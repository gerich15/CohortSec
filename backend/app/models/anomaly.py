"""Anomaly incident model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class Anomaly(Base):
    """Detected anomaly / incident."""

    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user_email = Column(String(255), nullable=True)  # denormalized for display
    action_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    threat_level = Column(String(20), nullable=False)  # High, Medium, Low
    score = Column(Float, nullable=True)  # Anomaly score from ML
    ip_address = Column(String(45), nullable=True)
    geo_location = Column(String(255), nullable=True)
    extra_data = Column(Text, nullable=True)  # JSON extra data
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved = Column(Integer, default=0, nullable=False)  # 0=pending, 1=resolved

    user = relationship("User", back_populates="anomalies")
