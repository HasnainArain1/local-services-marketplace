"""
Service request routes — create, read, status transitions, quote submission.
"""

import logging
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.category import Category
from app.models.provider import ProviderProfile, provider_category_association
from app.models.service_request import ServiceRequest
from app.models.user import User
from app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestStatusUpdate,
    ServiceRequestResponse,
    QuoteSubmit,
)
from app.services import ai_client
from app.services.request_logic import validate_status_transition

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/requests", tags=["Service Requests"])


# ──────────────────────────────────────────────────────────────
# Create
# ──────────────────────────────────────────────────────────────

@router.post("/", response_model=ServiceRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_request(
    payload: ServiceRequestCreate,
    current_user: User = Depends(require_role("customer")),
    db: Session = Depends(get_db),
):
    """
    Customer only — submit a new service request.

    Two-step matching pipeline:
      Step 1 (AI):  Classify raw_text → one of the 10 fixed categories.
      Step 2 (DB):  Find the best available provider in that category
                    (highest rating, fewest active jobs). Assign them.
    """
    sr = ServiceRequest(
        customer_id=current_user.id,
        raw_text=payload.raw_text,
        location=payload.location,
        contact_number=payload.contact_number,
        photo_url=payload.photo_url,
        status="submitted",
    )

    # ── Step 1: AI category matching ──
    matched_category = None
    try:
        match_result = await ai_client.match_request(payload.raw_text)
        confidence = match_result.get("confidence", 0.0)

        if confidence >= 0.40:
            category_id_str = match_result.get("category_id")
            category_name = match_result.get("category")

            # Try to find category by UUID first
            if category_id_str:
                try:
                    cat_uuid = UUID(str(category_id_str))
                    matched_category = db.query(Category).filter(Category.id == cat_uuid).first()
                except (ValueError, TypeError):
                    matched_category = None

            # Fallback to matching by category name
            if not matched_category and category_name:
                matched_category = db.query(Category).filter(
                    Category.name.ilike(category_name)
                ).first()

            if matched_category:
                sr.matched_category_id = matched_category.id
                logger.info(
                    "Step 1 — Request matched to category '%s' (confidence=%.2f)",
                    matched_category.name, confidence,
                )
            else:
                logger.warning(
                    "AI returned category '%s' / id '%s' but it wasn't found in DB",
                    category_name, category_id_str,
                )
        else:
            logger.info(
                "AI match confidence %.2f is below threshold — no category set",
                confidence,
            )
    except Exception:
        logger.exception("Error during AI matching — request saved without category")

    # ── Step 2: Provider selection (plain DB filtering, no AI) ──
    if matched_category:
        try:
            best_provider = _find_best_provider(db, matched_category.id, payload.location)
            if best_provider:
                sr.matched_provider_id = best_provider.id
                sr.status = "matched"
                logger.info(
                    "Step 2 — Assigned provider '%s' (id=%s, rating=%.1f) for category '%s'",
                    best_provider.user.name if best_provider.user else "?",
                    best_provider.id,
                    best_provider.rating_avg or 0,
                    matched_category.name,
                )
            else:
                logger.info(
                    "Step 2 — No provider available in category '%s'; request stays as 'submitted'",
                    matched_category.name,
                )
        except Exception:
            logger.exception("Error during provider selection — request saved without provider")

    db.add(sr)
    db.commit()
    db.refresh(sr)
    return sr


def _find_best_provider(db: Session, category_id: UUID, location: str = None) -> Optional[ProviderProfile]:
    """
    Find the best available provider in a given category.

    Selection criteria (in order):
      1. Provider must have `category_id` in their registered categories
      2. Provider status must be 'active' (approved by admin) or 'pending' (fallback)
      3. Prefer providers whose location matches the customer's location
      4. Sorted by highest rating_avg, then fewest active (non-terminal) jobs
    """
    from sqlalchemy import func, case

    # Count of non-terminal active jobs per provider
    active_jobs_subq = (
        db.query(
            ServiceRequest.matched_provider_id,
            func.count(ServiceRequest.id).label("active_jobs"),
        )
        .filter(ServiceRequest.status.notin_(["completed", "cancelled"]))
        .group_by(ServiceRequest.matched_provider_id)
        .subquery()
    )

    query = (
        db.query(ProviderProfile)
        .join(
            provider_category_association,
            ProviderProfile.id == provider_category_association.c.provider_id,
        )
        .filter(provider_category_association.c.category_id == category_id)
        .filter(ProviderProfile.status == "active")
        .outerjoin(
            active_jobs_subq,
            ProviderProfile.id == active_jobs_subq.c.matched_provider_id,
        )
    )

    # Prefer location match
    location_priority = case(
        (ProviderProfile.location.ilike(f"%{location}%"), 0) if location else (ProviderProfile.id.isnot(None), 1),
        else_=1,
    )

    query = query.order_by(
        location_priority,
        ProviderProfile.rating_avg.desc(),
        func.coalesce(active_jobs_subq.c.active_jobs, 0).asc(),
    )

    return query.first()


# ──────────────────────────────────────────────────────────────
# Read
# ──────────────────────────────────────────────────────────────

@router.get("/{request_id}", response_model=ServiceRequestResponse)
def get_request(
    request_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get a single service request.
    Customer can see their own; provider can see if they are the matched provider
    or if the request is in their category.
    """
    sr = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not sr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    _assert_request_access(sr, current_user, db)
    return sr


@router.get("/", response_model=List[ServiceRequestResponse])
def list_requests(
    customer_id: Optional[UUID] = Query(None),
    provider_id: Optional[UUID] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    List service requests.

    - Customers see only their own requests (via customer_id).
    - Providers see ONLY:
        (a) Requests directly assigned to them (matched_provider_id == their profile id)
        (b) Unassigned requests whose matched_category_id is in their category list
    - Admins use /api/v1/admin/requests instead.
    """
    user_role = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role

    if customer_id:
        if user_role != "customer" or current_user.id != customer_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view your own requests")
        return db.query(ServiceRequest).filter(ServiceRequest.customer_id == customer_id).order_by(ServiceRequest.created_at.desc()).all()

    if user_role == "provider" or provider_id:
        profile = None
        if provider_id:
            profile = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
        if not profile and user_role == "provider":
            profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()

        if not profile:
            # Provider hasn't completed onboarding yet — return empty list
            return []

        # Extract the provider's registered category IDs
        cat_ids = [c.id for c in profile.categories]

        if not cat_ids:
            # Provider has no categories selected — they can only see requests already assigned to them
            return (
                db.query(ServiceRequest)
                .filter(ServiceRequest.matched_provider_id == profile.id)
                .order_by(ServiceRequest.created_at.desc())
                .all()
            )

        # Provider sees:
        # 1. Requests directly assigned to them
        # 2. Unassigned requests that have a matched_category_id in their categories
        query = db.query(ServiceRequest).filter(
            (ServiceRequest.matched_provider_id == profile.id) |
            (
                (ServiceRequest.matched_provider_id.is_(None)) &
                (ServiceRequest.matched_category_id.in_(cat_ids)) &
                (ServiceRequest.status.in_(["submitted"]))
            )
        )
        return query.order_by(ServiceRequest.created_at.desc()).all()

    # If user is admin without explicit filters, return all requests
    if user_role == "admin":
        return db.query(ServiceRequest).order_by(ServiceRequest.created_at.desc()).all()

    # Customers calling without customer_id — return their own requests
    if user_role == "customer":
        return (
            db.query(ServiceRequest)
            .filter(ServiceRequest.customer_id == current_user.id)
            .order_by(ServiceRequest.created_at.desc())
            .all()
        )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Provide either customer_id or provider_id query parameter",
    )


# ──────────────────────────────────────────────────────────────
# Status transition
# ──────────────────────────────────────────────────────────────

@router.patch("/{request_id}/status", response_model=ServiceRequestResponse)
def update_request_status(
    request_id: UUID,
    payload: ServiceRequestStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Customer or provider — transition the request to a new status.
    The status flow is validated strictly.
    """
    sr = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not sr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    _assert_request_access(sr, current_user, db)

    # Validate the transition
    validate_status_transition(sr.status.value if hasattr(sr.status, 'value') else sr.status, payload.status)

    sr.status = payload.status
    sr.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sr)
    return sr


# ──────────────────────────────────────────────────────────────
# Quote submission
# ──────────────────────────────────────────────────────────────

@router.post("/{request_id}/quote", response_model=ServiceRequestResponse)
def submit_quote(
    request_id: UUID,
    payload: QuoteSubmit,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """
    Provider only — submit a quote for a request.

    Category validation: the provider can only quote on requests whose
    matched_category_id is in their own category list. This prevents
    cross-category claiming (e.g. a plumber quoting on an AC repair job).

    If the request is unassigned, this provider becomes the matched provider.
    Sets status to 'quoted'.
    """
    sr = db.query(ServiceRequest).filter(ServiceRequest.id == request_id).first()
    if not sr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider profile not found. Please complete onboarding first.")

    if profile.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your provider profile is pending admin approval. You cannot submit quotes until approved by an administrator.",
        )

    # Provider can quote if they are already matched OR if the request is open/unassigned
    if sr.matched_provider_id is not None and sr.matched_provider_id != profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Another provider is already matched to this service request",
        )

    # Category validation — prevent cross-category quoting
    if sr.matched_category_id is not None:
        provider_cat_ids = {c.id for c in profile.categories}
        if sr.matched_category_id not in provider_cat_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This request is in a category outside your registered specializations",
            )

    # Assign provider if unassigned
    if sr.matched_provider_id is None:
        sr.matched_provider_id = profile.id

    # Validate status transition to 'quoted'
    current_status = sr.status.value if hasattr(sr.status, 'value') else sr.status
    validate_status_transition(current_status, "quoted")

    sr.quote_amount = payload.quote_amount
    sr.quote_message = payload.quote_message
    sr.status = "quoted"
    sr.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sr)
    return sr


# ──────────────────────────────────────────────────────────────
# Access control helper
# ──────────────────────────────────────────────────────────────

def _assert_request_access(sr: ServiceRequest, user: User, db: Session) -> None:
    """
    Raise 403 if the user cannot access this specific service request.

    Rules:
      - Admins can see everything.
      - Customers can see their own requests.
      - Providers can see requests:
          (a) directly assigned to them (matched_provider_id == profile.id), OR
          (b) unassigned AND in one of their registered categories.
    """
    role = user.role.value if hasattr(user.role, 'value') else user.role

    if role == "admin":
        return

    if role == "customer" and str(sr.customer_id) == str(user.id):
        return

    if role == "provider":
        profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == user.id).first()
        if profile:
            # Directly assigned to this provider
            if sr.matched_provider_id is not None and str(sr.matched_provider_id) == str(profile.id):
                return

            # Unassigned request in this provider's category
            if sr.matched_provider_id is None and sr.matched_category_id is not None:
                provider_cat_ids = {c.id for c in profile.categories}
                if sr.matched_category_id in provider_cat_ids:
                    return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this service request",
    )
