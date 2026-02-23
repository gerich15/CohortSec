"""Check security endpoint - B2C 'panic button' quick check."""

from datetime import datetime, timedelta
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.anomaly import Anomaly
from app.models.backup_log import BackupLog
from app.models.backup_config import BackupConfig
from app.models.simple_backup_config import SimpleBackupConfig
from app.models.user import User
from app.models.user_action import UserAction
from app.utils.deps import get_current_user, get_db_session

router = APIRouter(prefix="/check-security", tags=["check-security"])


class CheckResult(BaseModel):
    ok: bool
    message: str
    details: Dict[str, Any]


@router.get("", response_model=CheckResult)
def check_security(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Quick security check: new device, backup recency, password leak (stub)."""
    issues: List[str] = []
    details: Dict[str, Any] = {}

    # 1. Unusual logins in last 24h
    since = datetime.utcnow() - timedelta(hours=24)
    anomalies = (
        db.query(Anomaly)
        .filter(
            Anomaly.user_id == current_user.id,
            Anomaly.created_at >= since,
            Anomaly.resolved == 0,
        )
        .all()
    )
    if anomalies:
        issues.append("За последние 24 часа были подозрительные входы в твой аккаунт")
        details["suspicious_logins"] = len(anomalies)
    else:
        details["suspicious_logins"] = 0

    # 2. Backup recency
    last_backup: datetime | None = None
    config_ids = [c.id for c in db.query(BackupConfig).filter(BackupConfig.user_id == current_user.id).all()]
    if config_ids:
        log = (
            db.query(BackupLog)
            .filter(
                BackupLog.config_id.in_(config_ids),
                BackupLog.status == "success",
            )
            .order_by(BackupLog.finished_at.desc())
            .first()
        )
        if log and log.finished_at:
            last_backup = log.finished_at
    simple = db.query(SimpleBackupConfig).filter(SimpleBackupConfig.user_id == current_user.id).first()
    if simple and simple.last_backup_at:
        if last_backup is None or simple.last_backup_at > last_backup:
            last_backup = simple.last_backup_at

    if last_backup:
        days_ago = (datetime.utcnow() - last_backup).days
        details["last_backup_days_ago"] = days_ago
        if days_ago > 7:
            issues.append(f"Последний бэкап был {days_ago} дней назад — пора обновить")
    else:
        details["last_backup_days_ago"] = None
        issues.append("Резервная копия ещё не делалась — подключи облако и сделай бэкап")

    # 3. Password leak - check performed at registration; no password available here
    details["password_leak"] = "checked_at_registration"

    ok = len(issues) == 0
    if ok:
        message = "Всё в порядке! Никаких угроз не обнаружено."
    else:
        message = "Есть что улучшить: " + "; ".join(issues[:3])

    return CheckResult(ok=ok, message=message, details=details)
