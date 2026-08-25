"""
Pydantic schemas for messages (chat).
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: UUID
    request_id: UUID
    sender_id: UUID
    sender_role: str
    content: str
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True
