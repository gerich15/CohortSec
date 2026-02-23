"""Security score endpoint - B2C level of protection (0-100%)."""

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.backup_config import BackupConfig
from app.models.backup_log import BackupLog
from app.models.simple_backup_config import SimpleBackupConfig
from app.models.user import User
from app.utils.deps import get_current_user, get_db_session

router = APIRouter(prefix="/security-score", tags=["security-score"])


class ActionHint(BaseModel):
    action: str
    points: int
    done: bool
    description: str


class SecurityScoreResponse(BaseModel):
    score: int  # 0-100
    actions: List[ActionHint]


def _calculate_score(
    user: User,
    db: Session,
) -> tuple:
    """Calculate security score 0-100 and list of action hints."""
    actions: List[ActionHint] = []
    total = 0

    # MFA (second key): +25
    mfa_done = bool(user.mfa_enabled)
    actions.append(ActionHint(
        action="Включи второй ключ (2FA)",
        points=25,
        done=mfa_done,
        description="Приложение будет требовать код при входе — воруют пароль реже",
    ))
    if mfa_done:
        total += 25

    # Biometric (face): +20
    bio_done = bool(user.biometric_template)
    actions.append(ActionHint(
        action="Войди по лицу",
        points=20,
        done=bio_done,
        description="Селфи вместо пароля — удобно и безопасно",
    ))
    if bio_done:
        total += 20

    # Backup configured: +20
    backup_config = (
        db.query(BackupConfig)
        .filter(BackupConfig.user_id == user.id)
        .first()
    )
    simple_config = (
        db.query(SimpleBackupConfig)
        .filter(SimpleBackupConfig.user_id == user.id)
        .first()
    )
    backup_configured = backup_config is not None or (
        simple_config is not None and simple_config.cloud_provider
    )
    actions.append(ActionHint(
        action="Подключи облако для бэкапа",
        points=20,
        done=bool(backup_configured),
        description="Яндекс.Диск, Google Фото — фото и документы в безопасности",
    ))
    if backup_configured:
        total += 20

    # Recent backup: +15
    last_log = None
    if backup_config:
        last_log = (
            db.query(BackupLog)
            .filter(BackupLog.config_id == backup_config.id)
            .order_by(BackupLog.finished_at.desc())
            .first()
        )
    recent_backup = False
    if last_log and last_log.finished_at:
        recent_backup = (datetime.utcnow() - last_log.finished_at) < timedelta(days=7)
    if simple_config and simple_config.last_backup_at:
        recent_backup = recent_backup or (
            (datetime.utcnow() - simple_config.last_backup_at) < timedelta(days=7)
        )
    actions.append(ActionHint(
        action="Сделай бэкап за последнюю неделю",
        points=15,
        done=recent_backup,
        description="Резервная копия — твоя страховка от потери данных",
    ))
    if recent_backup:
        total += 15

    # Strong password (heuristic): +20
    strong_auth = mfa_done or bio_done
    actions.append(ActionHint(
        action="Используй надёжный пароль",
        points=20,
        done=strong_auth,
        description="Длинный пароль или второй ключ — выбор за тобой",
    ))
    if strong_auth:
        total += 20

    return min(100, total), actions


@router.get("/me", response_model=SecurityScoreResponse)
def get_my_security_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Get current user's security score (0-100%) and action hints."""
    score, actions = _calculate_score(current_user, db)
    return SecurityScoreResponse(score=score, actions=actions)
