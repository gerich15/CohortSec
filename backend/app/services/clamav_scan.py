"""ClamAV antivirus scan for uploaded files."""

import logging
from typing import Optional

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_cclamd: Optional[object] = None


def _get_clamd() -> Optional[object]:
    """Get ClamAV daemon connection (lazy init). Try Unix socket, then TCP."""
    global _cclamd
    if _cclamd is not None:
        return _cclamd
    settings = get_settings()
    if not settings.clamav_enabled:
        return None
    try:
        import pyclamd
        for conn in [pyclamd.ClamdUnixSocket(), pyclamd.ClamdNetworkSocket()]:
            try:
                if conn.ping():
                    _cclamd = conn
                    return conn
            except Exception:
                pass
    except ImportError:
        logger.warning("pyclamd not installed; ClamAV scan disabled")
    except Exception as e:
        logger.warning("ClamAV unavailable: %s", e)
    _cclamd = None
    return None


def scan_bytes(data: bytes) -> bool:
    """
    Scan bytes for malware. Returns True if clean, False if infected.
    When ClamAV disabled or unavailable, returns True (skip scan).
    """
    cd = _get_clamd()
    if not cd:
        return True
    try:
        result = cd.scan_stream(data)
        # None = clean, dict with FOUND = infected
        if result is None:
            return True
        if isinstance(result, dict) and any(
            v == "FOUND" or (isinstance(v, tuple) and v[0] == "FOUND")
            for v in result.values()
        ):
            return False
        return True
    except Exception as e:
        logger.warning("ClamAV scan error: %s", e)
        return True
