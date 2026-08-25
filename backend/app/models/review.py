"""
Review model — maps to the existing 'reviews' table.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("service_requests.id"), unique=True, nullable=False)
    provider_id = Column(UUID(as_uuid=True), ForeignKey("provider_profiles.id"), nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Match the DB CHECK constraint
    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="reviews_rating_check"),
    )

    # Relationships
    service_request = relationship("ServiceRequest", back_populates="review")
    provider = relationship("ProviderProfile", back_populates="reviews")
    customer = relationship("User", back_populates="reviews", foreign_keys=[customer_id])
