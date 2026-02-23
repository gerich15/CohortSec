"""Models for password breach check (k-anonymity)."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String

from app.core.database import Base


class BreachedPassword(Base):
    """Database of breached password hashes (SHA-1 k-anonymity)."""

    __tablename__ = "breached_passwords"

    id = Column(Integer, primary_key=True, index=True)
    hash_prefix = Column(String(5), index=True, nullable=False)
    hash_suffix = Column(String(35), nullable=False)
    breach_source = Column(String(255), nullable=True)
    breach_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class PasswordCheckLog(Base):
    """Log of password checks (for limits and analytics). Only prefix stored."""

    __tablename__ = "password_check_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    check_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    hash_prefix = Column(String(5), nullable=False)
    result = Column(Boolean, nullable=False)
    subscription_tier = Column(String(50), nullable=True)
