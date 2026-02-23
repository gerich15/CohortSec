"""Threat intelligence - parse/aggregate threat data.

MVP: placeholder for future integration with threat feeds.
"""

import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


def get_threat_level(anomaly_score: float) -> str:
    """Map anomaly score to threat level (High/Medium/Low)."""
    if anomaly_score < -0.3:
        return "High"
    if anomaly_score < -0.1:
        return "Medium"
    return "Low"


def hash_ip(ip: Optional[str]) -> Optional[str]:
    """Hash IP for privacy in logs."""
    if not ip:
        return None
    return hashlib.sha256(ip.encode()).hexdigest()[:16]


def hash_device(user_agent: Optional[str]) -> Optional[str]:
    """Hash device/user-agent for fingerprinting."""
    if not user_agent:
        return None
    return hashlib.sha256(user_agent.encode()).hexdigest()[:16]


def parse_geo_from_ip(ip: Optional[str]) -> Optional[str]:
    """Placeholder: GeoIP lookup. MVP returns 'Unknown'."""
    if not ip:
        return None
    # TODO: integrate maxmind geoip2 or similar
    return "Unknown"


def enrich_anomaly(
    action_type: str,
    score: float,
    ip: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> Dict[str, Any]:
    """Enrich anomaly record with threat intel metadata."""
    return {
        "action_type": action_type,
        "threat_level": get_threat_level(score),
        "score": score,
        "ip_hash": hash_ip(ip),
        "device_hash": hash_device(user_agent),
        "geo": parse_geo_from_ip(ip),
        "timestamp": datetime.utcnow().isoformat(),
    }
