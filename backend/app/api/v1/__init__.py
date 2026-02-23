"""API v1 router."""

from fastapi import APIRouter

from app.api.endpoints import (
    auth,
    users,
    backup,
    anomalies,
    monitoring,
    family,
    security_score,
    check_security,
    simple_backup,
    onboarding,
    password_check,
    osint,
    fraud_help,
    support,
)
from app.core.config import get_settings

settings = get_settings()

router = APIRouter(prefix=settings.api_v1_prefix)

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(backup.router)
router.include_router(anomalies.router)
router.include_router(monitoring.router)
router.include_router(family.router)
router.include_router(security_score.router)
router.include_router(check_security.router)
router.include_router(simple_backup.router)
router.include_router(onboarding.router)
router.include_router(password_check.router)
router.include_router(osint.router)
router.include_router(fraud_help.router)
router.include_router(support.router)
