"""
Provider profile routes — CRUD, bio generation, review summarization, admin approval.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.category import Category
from app.models.provider import ProviderProfile, provider_category_association
from app.models.review import Review
from app.models.user import User
from app.schemas.provider import (
    ProviderCreate,
    ProviderUpdate,
    ProviderStatusUpdate,
    ProviderResponse,
)
from app.schemas.review import ReviewResponse
from app.services import ai_client

router = APIRouter(prefix="/api/v1/providers", tags=["Providers"])


# ──────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────

def _build_provider_response(profile: ProviderProfile) -> dict:
    """Build a response dict including user_name, user_phone, user_email from the related User."""
    data = ProviderResponse.model_validate(profile).model_dump()
    if profile.user:
        data["user_name"] = profile.user.name
        data["user_phone"] = profile.user.phone
        data["user_email"] = profile.user.email
    data["categories"] = [{"id": c.id, "name": c.name} for c in profile.categories]
    return data


# ──────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────

@router.post("/", response_model=ProviderResponse, status_code=status.HTTP_201_CREATED)
def create_provider_profile(
    payload: ProviderCreate,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """Provider only — create their own provider profile."""

    # One profile per user
    existing = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Provider profile already exists for this user",
        )

    profile = ProviderProfile(
        user_id=current_user.id,
        experience_years=payload.experience_years,
        location=payload.location,
        raw_description=payload.raw_description,
    )

    # Attach categories
    if payload.category_ids:
        categories = db.query(Category).filter(Category.id.in_(payload.category_ids)).all()
        if len(categories) != len(payload.category_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more category IDs are invalid",
            )
        profile.categories = categories

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return _build_provider_response(profile)


@router.get("/", response_model=List[ProviderResponse])
def list_providers(
    category_id: Optional[UUID] = Query(None),
    location: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Public — list providers with optional filters."""
    query = db.query(ProviderProfile).options(
        joinedload(ProviderProfile.user),
        joinedload(ProviderProfile.categories),
    )

    if category_id:
        query = query.join(provider_category_association).filter(
            provider_category_association.c.category_id == category_id
        )
    if location:
        query = query.filter(ProviderProfile.location.ilike(f"%{location}%"))

    # Only show active providers to the public
    query = query.filter(ProviderProfile.status == "active")
    providers = query.all()
    return [_build_provider_response(p) for p in providers]


@router.get("/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: UUID, db: Session = Depends(get_db)):
    """Public — get a single provider profile."""
    profile = (
        db.query(ProviderProfile)
        .options(joinedload(ProviderProfile.user), joinedload(ProviderProfile.categories))
        .filter(ProviderProfile.id == provider_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
    return _build_provider_response(profile)


@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider(
    provider_id: UUID,
    payload: ProviderUpdate,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """Provider only — update their own profile."""
    profile = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own profile")

    if payload.experience_years is not None:
        profile.experience_years = payload.experience_years
    if payload.location is not None:
        profile.location = payload.location
    if payload.raw_description is not None:
        profile.raw_description = payload.raw_description
    if payload.category_ids is not None:
        categories = db.query(Category).filter(Category.id.in_(payload.category_ids)).all()
        if len(categories) != len(payload.category_ids):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more category IDs are invalid")
        profile.categories = categories

    db.commit()
    db.refresh(profile)
    return _build_provider_response(profile)


@router.post("/{provider_id}/generate-bio", response_model=ProviderResponse)
async def generate_bio(
    provider_id: UUID,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """Provider only — call AI service to generate a professional bio."""
    profile = (
        db.query(ProviderProfile)
        .options(joinedload(ProviderProfile.categories))
        .filter(ProviderProfile.id == provider_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only generate a bio for your own profile")

    # Determine primary category name
    category_name = profile.categories[0].name if profile.categories else "General"

    result = await ai_client.generate_bio(
        name=current_user.name,
        category=category_name,
        experience_years=profile.experience_years,
        location=profile.location,
        rating=profile.rating_avg,
        raw_description=profile.raw_description or "",
    )

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=result["error"])

    profile.bio = result.get("bio", "")
    db.commit()
    db.refresh(profile)
    return _build_provider_response(profile)


@router.patch("/{provider_id}/status", response_model=ProviderResponse)
def update_provider_status(
    provider_id: UUID,
    payload: ProviderStatusUpdate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Admin only — approve or suspend a provider."""
    if payload.status not in ("active", "suspended", "pending"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be one of: pending, active, suspended",
        )

    profile = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")

    profile.status = payload.status
    db.commit()
    db.refresh(profile)
    return _build_provider_response(profile)


@router.get("/{provider_id}/reviews", response_model=List[ReviewResponse])
def get_provider_reviews(provider_id: UUID, db: Session = Depends(get_db)):
    """Public — list all reviews for a provider."""
    profile = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")

    reviews = db.query(Review).filter(Review.provider_id == provider_id).order_by(Review.created_at.desc()).all()
    return reviews


@router.post("/{provider_id}/summarize-reviews", response_model=ProviderResponse)
async def summarize_reviews(
    provider_id: UUID,
    current_user: User = Depends(require_role("provider")),
    db: Session = Depends(get_db),
):
    """Provider only — call AI service to summarize reviews into strengths/weaknesses."""
    profile = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
    if profile.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only summarize reviews for your own profile")

    reviews = db.query(Review).filter(Review.provider_id == provider_id).all()
    if not reviews:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No reviews to summarize")

    review_data = [
        {"rating": r.rating, "comment": r.comment or ""}
        for r in reviews
    ]

    result = await ai_client.summarize_reviews(
        provider_id=str(provider_id),
        reviews=review_data,
    )

    if "error" in result:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=result["error"])

    profile.strengths = result.get("strengths", "")
    profile.weaknesses = result.get("weaknesses", "")
    db.commit()
    db.refresh(profile)
    return _build_provider_response(profile)
