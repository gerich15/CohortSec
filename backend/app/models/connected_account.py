"""Connected external account for monitoring (VK, email, banks)."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ConnectedAccount(Base):
    """External account linked for suspicious activity monitoring."""

    __tablename__ = "connected_accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_type = Column(String(50), nullable=False)  # "vk" | "email_gmail" | "email_yandex" | "email_mailru" | "bank_sber" | "bank_tinkoff" | "telegram" | "ok"
    display_name = Column(String(255), nullable=True)  # e.g. "Мой Gmail"
    credentials_encrypted = Column(Text, nullable=True)  # Fernet-encrypted OAuth token or config
    status = Column(String(30), default="active", nullable=False)  # "active" | "error" | "needs_reauth"
    last_check_at = Column(DateTime, nullable=True)
    last_error = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="connected_accounts")
    events = relationship("ConnectedAccountEvent", back_populates="account", cascade="all, delete-orphan")


class ConnectedAccountEvent(Base):
    """Suspicious event from connected account."""

    __tablename__ = "connected_account_events"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("connected_accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)  # "new_login" | "password_change" | "suspicious_activity" | "geo_change"
    details = Column(Text, nullable=True)  # JSON
    severity = Column(String(20), default="medium", nullable=False)  # "low" | "medium" | "high"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    notified = Column(Boolean, default=False, nullable=False)

    account = relationship("ConnectedAccount", back_populates="events")
