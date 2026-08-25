"""
ProviderProfile model — maps to the existing 'provider_profiles' table.
Also defines the provider_category_association many-to-many join table.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, Table, ForeignKey,
    Enum as SAEnum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


# Many-to-many association table (already exists in DB)
provider_category_association = Table(
    "provider_category_association",
    Base.metadata,
    Column("provider_id", UUID(as_uuid=True), ForeignKey("provider_profiles.id"), primary_key=True),
    Column("category_id", UUID(as_uuid=True), ForeignKey("categories.id"), primary_key=True),
)


class ProviderProfile(Base):
    __tablename__ = "provider_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    experience_years = Column(Integer, default=0)
    location = Column(String, nullable=False)
    raw_description = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    rating_avg = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    strengths = Column(Text, nullable=True)
    weaknesses = Column(Text, nullable=True)
    status = Column(
        SAEnum("pending", "active", "suspended", name="provider_status", create_type=False),
        default="pending",
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="provider_profile")
    categories = relationship("Category", secondary=provider_category_association, backref="providers")
    service_requests = relationship("ServiceRequest", back_populates="matched_provider")
    reviews = relationship("Review", back_populates="provider")
