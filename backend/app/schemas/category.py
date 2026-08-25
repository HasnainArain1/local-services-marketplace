"""
Pydantic schemas for categories.
"""

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    description: str


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: str

    class Config:
        from_attributes = True
