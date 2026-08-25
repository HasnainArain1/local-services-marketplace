"""
Pydantic schemas for provider profiles.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


# --------------- Request schemas ---------------

class ProviderCreate(BaseModel):
    experience_years: int = 0
    location: str
    raw_description: Optional[str] = None
    category_ids: List[UUID] = []


class ProviderUpdate(BaseModel):
    experience_years: Optional[int] = None
    location: Optional[str] = None
    raw_description: Optional[str] = None
    category_ids: Optional[List[UUID]] = None


class ProviderStatusUpdate(BaseModel):
    status: str  # "active" | "suspended"


# --------------- Response schemas ---------------

class ProviderResponse(BaseModel):
    id: UUID
    user_id: UUID
    experience_years: int
    location: str
    raw_description: Optional[str] = None
    bio: Optional[str] = None
    rating_avg: float
    rating_count: int
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    categories: List["CategoryInProvider"] = []
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryInProvider(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


# Resolve forward reference
ProviderResponse.model_rebuild()
