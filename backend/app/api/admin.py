"""
Admin routes — overview dashboard, list all requests, list all providers.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import require_role
from app.models.provider import ProviderProfile
from app.models.service_request import ServiceRequest
from app.models.user import User
from app.schemas.admin import AdminOverview
from app.schemas.provider import ProviderResponse
from app.schemas.service_request import ServiceRequestResponse

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/overview", response_model=AdminOverview)
def admin_overview(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Admin only — dashboard overview with key counts."""
    total_requests = db.query(func.count(ServiceRequest.id)).scalar()
    active_providers = (
        db.query(func.count(ProviderProfile.id))
        .filter(ProviderProfile.status == "active")
        .scalar()
    )
    completed_jobs = (
        db.query(func.count(ServiceRequest.id))
        .filter(ServiceRequest.status == "completed")
        .scalar()
    )

    return AdminOverview(
        total_requests=total_requests,
        active_providers=active_providers,
        completed_jobs=completed_jobs,
    )


@router.get("/requests", response_model=List[ServiceRequestResponse])
def admin_list_requests(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Admin only — list all service requests."""
    return (
        db.query(ServiceRequest)
        .order_by(ServiceRequest.created_at.desc())
        .all()
    )


@router.get("/providers", response_model=List[ProviderResponse])
def admin_list_providers(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    """Admin only — list all providers, optionally filtered by status."""
    query = db.query(ProviderProfile).options(
        joinedload(ProviderProfile.user),
        joinedload(ProviderProfile.categories),
    )

    if status_filter:
        query = query.filter(ProviderProfile.status == status_filter)

    providers = query.all()
    result = []
    for p in providers:
        data = ProviderResponse.model_validate(p).model_dump()
        data["user_name"] = p.user.name if p.user else None
        data["categories"] = [{"id": c.id, "name": c.name} for c in p.categories]
        result.append(data)
    return result
