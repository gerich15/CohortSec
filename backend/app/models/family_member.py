"""Family member model - B2C family dashboard."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class FamilyMember(Base):
    """Links users in a family group (owner + invited members)."""

    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    display_name = Column(String(100), nullable=True)  # e.g. "Мама", "Костя"
    role = Column(String(20), default="member", nullable=False)  # member, child, parent
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    owner = relationship("User", foreign_keys=[owner_id])


class FamilyInvitation(Base):
    """Invitation to join a family (sent by email)."""

    __tablename__ = "family_invitations"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    email = Column(String(255), nullable=False)
    display_name = Column(String(100), nullable=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    status = Column(String(20), default="pending", nullable=False)  # pending, accepted, expired
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
