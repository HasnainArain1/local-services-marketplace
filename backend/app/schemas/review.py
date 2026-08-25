"""
Pydantic schemas for reviews.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    request_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    provider_id: Optional[UUID] = None


class ReviewResponse(BaseModel):
    id: UUID
    request_id: UUID
    provider_id: UUID
    customer_id: UUID
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
