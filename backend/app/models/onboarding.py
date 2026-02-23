"""Onboarding status - first-time tour completion."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer
from app.core.database import Base


class OnboardingStatus(Base):
    """Tracks whether user completed the first-time tour."""

    __tablename__ = "onboarding_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    tour_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
