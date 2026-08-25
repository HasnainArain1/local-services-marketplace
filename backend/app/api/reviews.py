"""
Review routes — customers can review completed service requests.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.provider import ProviderProfile
from app.models.review import Review
from app.models.service_request import ServiceRequest
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/api/v1/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(require_role("customer")),
    db: Session = Depends(get_db),
):
    """
    Customer only — leave a review on a completed service request.
    Validates: request exists, is completed, belongs to this customer,
    has a matched provider, and hasn't been reviewed yet.
    """
    sr = db.query(ServiceRequest).filter(ServiceRequest.id == payload.request_id).first()
    if not sr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service request not found")

    if sr.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only review your own requests")

    current_status = sr.status.value if hasattr(sr.status, 'value') else sr.status
    if current_status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot review a request with status '{current_status}'. Must be 'completed'.",
        )

    provider_id = sr.matched_provider_id or payload.provider_id
    if not provider_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No provider was matched to this request")

    # Ensure request records provider_id if it was missing
    if not sr.matched_provider_id:
        sr.matched_provider_id = provider_id

    # Check for existing review
    existing = db.query(Review).filter(Review.request_id == payload.request_id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This request has already been reviewed")

    review = Review(
        request_id=payload.request_id,
        provider_id=provider_id,
        customer_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate provider's rating stats accurately from database
    provider = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
    if provider:
        all_reviews = db.query(Review).filter(Review.provider_id == provider.id).all()
        if all_reviews:
            provider.rating_count = len(all_reviews)
            provider.rating_avg = round(sum(r.rating for r in all_reviews) / len(all_reviews), 2)
            db.commit()
            db.refresh(provider)

    return review
