"""Backup configuration model."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class BackupConfig(Base):
    """External S3 backup source configuration."""

    __tablename__ = "backup_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    endpoint = Column(String(255), nullable=False)
    access_key = Column(String(255), nullable=False)
    secret_key = Column(Text, nullable=False)  # Stored encrypted in production
    bucket = Column(String(255), nullable=False)
    prefix = Column(String(255), nullable=True)  # Optional prefix filter
    schedule_cron = Column(String(50), default="0 2 * * *", nullable=False)  # Daily 2am
    is_active = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
