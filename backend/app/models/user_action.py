"""User action model - for ML anomaly detection."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class UserAction(Base):
    """User action log (login, download, etc.) - features for ML."""

    __tablename__ = "user_actions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(50), nullable=False)  # login, download, upload, etc.
    timestamp_hour = Column(Integer, nullable=False)  # 0-23
    timestamp_weekday = Column(Integer, nullable=False)  # 0-6
    volume_operations = Column(Integer, default=0, nullable=False)  # count of ops
    geo_hash = Column(String(20), nullable=True)  # simplified geo
    ip_hash = Column(String(64), nullable=True)
    device_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    anomaly_score = Column(Float, nullable=True)  # ML prediction
    is_anomaly = Column(Integer, default=0, nullable=False)  # -1 anomaly, 1 normal

    user = relationship("User", back_populates="actions")
