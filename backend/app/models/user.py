"""User model."""

from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user_action import UserAction
    from app.models.user_session import UserSession
    from app.models.anomaly import Anomaly


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    totp_secret = Column(String(64), nullable=True)
    biometric_template = Column(Text, nullable=True)  # Encrypted 128-d face embedding
    subscription_tier = Column(String(50), default="free", nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete")
    actions = relationship("UserAction", back_populates="user", cascade="all, delete")
    anomalies = relationship("Anomaly", back_populates="user", cascade="all, delete")
