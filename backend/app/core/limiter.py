"""Rate limiter for FastAPI. Default limit for all API; auth endpoints use stricter limits."""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"],
)
