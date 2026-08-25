"""
Message model — maps to the existing 'messages' table.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("service_requests.id"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sender_role = Column(
        SAEnum("customer", "provider", name="sender_role", create_type=False),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="messages")
    sender = relationship("User", back_populates="messages")
