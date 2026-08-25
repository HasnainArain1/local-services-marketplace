"""
User model — maps to the existing 'users' table.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Enum as SAEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role = Column(SAEnum("customer", "provider", "admin", name="user_role", create_type=False), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    provider_profile = relationship("ProviderProfile", back_populates="user", uselist=False)
    service_requests = relationship("ServiceRequest", back_populates="customer", foreign_keys="ServiceRequest.customer_id")
    messages = relationship("Message", back_populates="sender")
    reviews = relationship("Review", back_populates="customer", foreign_keys="Review.customer_id")
