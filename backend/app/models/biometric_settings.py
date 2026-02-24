"""Biometric auth settings: threshold, bruteforce protection."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Float
from sqlalchemy.orm import relationship

from app.core.database import Base


class BiometricSettings(Base):
    """Per-user biometric settings."""

    __tablename__ = "biometric_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    confidence_threshold = Column(Float, default=0.65, nullable=False)  # 0.65 = match if distance < 0.35
    failed_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)  # Block biometric until this time
    max_failed_attempts = Column(Integer, default=5, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="biometric_settings")
