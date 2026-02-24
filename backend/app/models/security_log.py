"""Security event log for audit and dashboard."""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class SecurityLog(Base):
    """Log of all security-related events."""

    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    event_type = Column(String(80), nullable=False, index=True)
    details = Column(Text, nullable=True)  # JSON
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    geo = Column(String(255), nullable=True)
    success = Column(Integer, default=1, nullable=False)  # 1=success, 0=failure
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="security_logs")
