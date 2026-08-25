"""
Pydantic schemas for service requests.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


# --------------- Request schemas ---------------

class ServiceRequestCreate(BaseModel):
    raw_text: str
    location: str
    contact_number: str
    photo_url: Optional[str] = None


class ServiceRequestStatusUpdate(BaseModel):
    status: str  # target status to transition to


class QuoteSubmit(BaseModel):
    quote_amount: float
    quote_message: Optional[str] = None


# --------------- Response schemas ---------------

class ServiceRequestResponse(BaseModel):
    id: UUID
    customer_id: UUID
    raw_text: str
    matched_category_id: Optional[UUID] = None
    matched_provider_id: Optional[UUID] = None
    location: str
    contact_number: str
    photo_url: Optional[str] = None
    quote_amount: Optional[float] = None
    quote_message: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
