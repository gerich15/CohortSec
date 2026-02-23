"""Have I Been Pwned API - password breach check (k-anonymity)."""

import hashlib
from typing import Tuple

import httpx

HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/{prefix}"
USER_AGENT = "CohortSec-Security/1.0 (https://cohortsec.example; security check)"


def check_password_breached(password: str) -> Tuple[bool, int]:
    """
    Check if password appears in HIBP breach database.
    Uses k-anonymity: only first 5 chars of SHA-1 hash sent to API.
    Returns (breached, count).
    """
    sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix = sha1[:5]
    suffix = sha1[5:]
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(
                HIBP_RANGE_URL.format(prefix=prefix),
                headers={"User-Agent": USER_AGENT, "Add-Padding": "true"},
            )
            resp.raise_for_status()
            for line in resp.text.strip().splitlines():
                parts = line.split(":", 1)
                if parts[0].strip().upper() == suffix:
                    count = int(parts[1].strip()) if len(parts) > 1 else 0
                    return True, count
    except Exception:
        pass
    return False, 0
