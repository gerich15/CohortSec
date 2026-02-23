"""Anomaly schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel




class AnomalyResponse(BaseModel):
    """Anomaly incident response."""

    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action_type: str
    description: Optional[str] = None
    threat_level: str
    score: Optional[float] = None
    ip_address: Optional[str] = None
    geo_location: Optional[str] = None
    created_at: datetime
    resolved: int

    class Config:
        from_attributes = True


class RiskPoint(BaseModel):
    """Risk level data point for chart."""

    timestamp: str
    risk_level: float
    anomaly_count: int
