"""One-time token for linking Telegram account to platform user."""

from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, ForeignKey
from app.core.database import Base


class NotificationLinkToken(Base):
    """One-time token for Telegram account linking. Expires in 5 minutes."""

    __tablename__ = "notification_link_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
