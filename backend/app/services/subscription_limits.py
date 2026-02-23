"""Subscription limits for password breach checks."""

from datetime import datetime
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.breach import PasswordCheckLog
from app.models.user import User


def get_user_limit(subscription_tier: Optional[str]) -> int:
    """Return monthly check limit for subscription tier."""
    limits = {"free": 10, "family": 100, "premium": 1000}
    return limits.get(subscription_tier or "free", 10)


def check_user_limits(db: Session, user: User) -> int:
    """Return remaining password checks for current month."""
    current_month = datetime.utcnow().replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    result = db.execute(
        select(func.count(PasswordCheckLog.id)).where(
            PasswordCheckLog.user_id == user.id,
            PasswordCheckLog.check_date >= current_month,
        )
    )
    used = result.scalar() or 0
    limit = get_user_limit(user.subscription_tier)
    return max(0, limit - used)
