"""Backup execution log model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text

from app.core.database import Base


class BackupLog(Base):
    """Log of backup job execution."""

    __tablename__ = "backup_logs"

    id = Column(Integer, primary_key=True, index=True)
    config_id = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False)  # success, failed, running
    objects_count = Column(Integer, default=0, nullable=False)
    total_size_bytes = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at = Column(DateTime, nullable=True)
