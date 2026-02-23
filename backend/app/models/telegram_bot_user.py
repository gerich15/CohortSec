"""Telegram bot user model for notification preferences and subscription."""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, BigInteger, Integer, String
from sqlalchemy import ForeignKey
from app.core.database import Base


class TelegramBotUser(Base):
    """User who interacts with CohortSec Telegram bot."""

    __tablename__ = "telegram_bot_users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Subscription & notifications
    is_subscribed = Column(Boolean, default=True)  # Subscribed to notifications
    push_enabled = Column(Boolean, default=True)  # Push notifications (can disable)
    news_enabled = Column(Boolean, default=True)  # News (can disable)
    lifehacks_enabled = Column(Boolean, default=True)  # Life hacks (can disable)
    # Important notifications (suspicious activity, hack alerts) - always on, no flag

    welcome_seen = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
