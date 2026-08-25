"""
Pydantic schemas for authentication and user operations.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


# --------------- Request schemas ---------------

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str  # customer | provider | admin


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


# --------------- Response schemas ---------------

class UserResponse(BaseModel):
    id: UUID
    role: str
    name: str
    email: str
    phone: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
