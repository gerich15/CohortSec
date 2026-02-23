"""Fraud report model for help section."""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy import JSON

from app.core.database import Base


class FraudReport(Base):
    """Report of fraud/cyber scam from user."""

    __tablename__ = "fraud_reports"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(20), unique=True, index=True, nullable=False)
    reporter_name = Column(String(255), nullable=False)
    reporter_email = Column(String(255), nullable=False)
    reporter_phone = Column(String(50), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    description = Column(Text, nullable=False)
    scammer_phone = Column(String(50), nullable=True)
    scammer_email = Column(String(255), nullable=True)
    scammer_link = Column(String(500), nullable=True)
    scammer_nickname = Column(String(255), nullable=True)
    scammer_card = Column(String(100), nullable=True)
    consent_given = Column(Boolean, default=False, nullable=False)
    ip_hash = Column(String(64), nullable=True)
    status = Column(String(50), default="new", nullable=False)
    scheme_type = Column(String(100), nullable=True)
    attachment_paths = Column(JSON, default=list, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
