"""Backup contact (email/phone) for recovery and notifications."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class BackupContact(Base):
    """Reserve email or phone for recovery and notifications."""

    __tablename__ = "backup_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_type = Column(String(20), nullable=False)  # "email" | "phone"
    value = Column(String(255), nullable=False)  # email or phone number
    verified = Column(Boolean, default=False, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    verified_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="backup_contacts")


class VerificationCode(Base):
    """One-time verification code for backup contacts (10 min TTL)."""

    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id = Column(Integer, ForeignKey("backup_contacts.id", ondelete="CASCADE"), nullable=True)
    code = Column(String(10), nullable=False)
    purpose = Column(String(50), nullable=False)  # "verify_contact" | "password_recovery" | "unlock"
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
