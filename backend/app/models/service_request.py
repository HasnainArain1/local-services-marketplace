"""
ServiceRequest model — maps to the existing 'service_requests' table.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    raw_text = Column(Text, nullable=False)
    matched_category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    matched_provider_id = Column(UUID(as_uuid=True), ForeignKey("provider_profiles.id"), nullable=True)
    location = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    photo_url = Column(String, nullable=True)
    quote_amount = Column(Float, nullable=True)
    quote_message = Column(Text, nullable=True)
    status = Column(
        SAEnum(
            "submitted", "matched", "quoted", "accepted",
            "in_progress", "completed", "cancelled",
            name="request_status",
            create_type=False,
        ),
        default="submitted",
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    customer = relationship("User", back_populates="service_requests", foreign_keys=[customer_id])
    matched_category = relationship("Category", backref="service_requests")
    matched_provider = relationship("ProviderProfile", back_populates="service_requests", foreign_keys=[matched_provider_id])
    messages = relationship("Message", back_populates="service_request", order_by="Message.sent_at")
    review = relationship("Review", back_populates="service_request", uselist=False)
