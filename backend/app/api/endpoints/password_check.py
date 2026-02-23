"""Password breach check API (k-anonymity). Uses Have I Been Pwned API."""

from datetime import datetime
from typing import List

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.breach import PasswordCheckLog
from app.services.subscription_limits import check_user_limits, get_user_limit
from app.utils.deps import get_current_user, get_db_session
from app.models.user import User

HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range/{prefix}"

router = APIRouter(prefix="/password-check", tags=["password-check"])


class PasswordCheckRequest(BaseModel):
    """Request: first 5 chars of SHA-1 hash (uppercase)."""

    hash_prefix: str = Field(..., min_length=5, max_length=5)


class PasswordCheckResponse(BaseModel):
    """Response: suffixes for client-side check."""

    hash_prefix: str
    suffixes: List[str]
    count: int
    remaining_checks: int


class CheckStatsResponse(BaseModel):
    """Stats for user's checks."""

    used_checks: int
    total_checks: int
    last_check: datetime | None


def _fetch_hibp_suffixes(prefix: str) -> List[str]:
    """Fetch password hash suffixes from Have I Been Pwned API (k-anonymity)."""
    url = HIBP_RANGE_URL.format(prefix=prefix)
    headers = {
        "User-Agent": "CohortSec-PasswordCheck/1.0 (https://cohortsec.example; security check)",
        "Add-Padding": "true",
    }
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()
            suffixes = []
            for line in resp.text.strip().splitlines():
                part = line.split(":", 1)
                if part:
                    suffixes.append(part[0].strip().upper())
            return suffixes
    except Exception:
        return []


@router.post("/check", response_model=PasswordCheckResponse)
def check_password(
    request: PasswordCheckRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Check password against Have I Been Pwned breach database. Client sends only hash prefix."""
    remaining = check_user_limits(db, user)
    if remaining <= 0:
        raise HTTPException(429, "Monthly check limit exceeded")

    prefix = request.hash_prefix.upper()
    suffixes = _fetch_hibp_suffixes(prefix)

    log = PasswordCheckLog(
        user_id=user.id,
        hash_prefix=prefix,
        result=len(suffixes) > 0,
        subscription_tier=user.subscription_tier or "free",
    )
    db.add(log)
    db.commit()

    return PasswordCheckResponse(
        hash_prefix=prefix,
        suffixes=suffixes,
        count=len(suffixes),
        remaining_checks=remaining - 1,
    )


@router.get("/stats", response_model=CheckStatsResponse)
def get_check_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Return user's check statistics."""
    from datetime import datetime as dt

    current_month = dt.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    used = db.execute(
        select(func.count(PasswordCheckLog.id)).where(
            PasswordCheckLog.user_id == user.id,
            PasswordCheckLog.check_date >= current_month,
        )
    ).scalar() or 0
    last_row = (
        db.execute(
            select(PasswordCheckLog.check_date)
            .where(PasswordCheckLog.user_id == user.id)
            .order_by(PasswordCheckLog.check_date.desc())
            .limit(1)
        )
        .first()
    )
    last_check = last_row[0] if last_row else None

    return CheckStatsResponse(
        used_checks=used,
        total_checks=get_user_limit(user.subscription_tier),
        last_check=last_check,
    )
