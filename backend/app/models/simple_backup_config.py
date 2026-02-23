"""Simple backup config - B2C cloud connection (Yandex, Google etc)."""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class SimpleBackupConfig(Base):
    """User preferences for simple backup: what to backup, cloud provider."""

    __tablename__ = "simple_backup_configs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    cloud_provider = Column(String(50), nullable=True)  # yandex_disk, google_photos, none
    backup_photos = Column(Integer, default=1, nullable=False)  # 1=yes
    backup_contacts = Column(Integer, default=1, nullable=False)
    backup_documents = Column(Integer, default=0, nullable=False)
    oauth_token = Column(Text, nullable=True)  # Encrypted in production
    last_backup_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
