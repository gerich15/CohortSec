"""Simple backup endpoint - B2C one-click backup."""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.backup_config import BackupConfig
from app.models.backup_log import BackupLog
from app.models.simple_backup_config import SimpleBackupConfig
from app.models.user import User
from app.tasks.backup_tasks import run_backup_task
from app.utils.deps import get_current_user, get_db_session

router = APIRouter(prefix="/simple-backup", tags=["simple-backup"])


class SimpleBackupTrigger(BaseModel):
    backup_photos: bool = True
    backup_contacts: bool = True
    backup_documents: bool = False


class SimpleBackupStatus(BaseModel):
    last_backup: Optional[datetime]
    last_backup_human: str
    objects_count: int
    total_bytes: int
    cloud_connected: bool


@router.get("/status", response_model=SimpleBackupStatus)
def get_simple_backup_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Get last backup status in human-readable form."""
    simple = db.query(SimpleBackupConfig).filter(SimpleBackupConfig.user_id == current_user.id).first()
    configs = db.query(BackupConfig).filter(BackupConfig.user_id == current_user.id).all()
    config_ids = [c.id for c in configs]
    cloud_connected = bool(len(configs) > 0 or (simple is not None and simple.cloud_provider))

    last_backup: Optional[datetime] = None
    objects_count = 0
    total_bytes = 0

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
        if log:
            last_backup = log.finished_at
            objects_count = log.objects_count or 0
            total_bytes = log.total_size_bytes or 0

    if simple and simple.last_backup_at:
        if last_backup is None or simple.last_backup_at > last_backup:
            last_backup = simple.last_backup_at

    def human_days(dt: datetime) -> str:
        delta = datetime.utcnow() - dt
        days = delta.days
        if days == 0:
            return "сегодня"
        if days == 1:
            return "вчера"
        if days < 7:
            return f"{days} дней назад"
        if days < 30:
            weeks = days // 7
            return f"{weeks} нед. назад"
        return f"{days} дней назад"

    last_human = human_days(last_backup) if last_backup else "никогда"

    return SimpleBackupStatus(
        last_backup=last_backup,
        last_backup_human=last_human,
        objects_count=objects_count,
        total_bytes=total_bytes,
        cloud_connected=cloud_connected,
    )


@router.post("/trigger")
def trigger_simple_backup(
    body: SimpleBackupTrigger,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Trigger backup now. Uses first available config or creates stub."""
    configs = db.query(BackupConfig).filter(BackupConfig.user_id == current_user.id).all()
    if not configs:
        # No S3 config - update SimpleBackupConfig preferences and return stub
        simple = db.query(SimpleBackupConfig).filter(SimpleBackupConfig.user_id == current_user.id).first()
        if not simple:
            simple = SimpleBackupConfig(
                user_id=current_user.id,
                backup_photos=1 if body.backup_photos else 0,
                backup_contacts=1 if body.backup_contacts else 0,
                backup_documents=1 if body.backup_documents else 0,
            )
            db.add(simple)
        else:
            simple.backup_photos = 1 if body.backup_photos else 0
            simple.backup_contacts = 1 if body.backup_contacts else 0
            simple.backup_documents = 1 if body.backup_documents else 0
        simple.last_backup_at = datetime.utcnow()
        db.commit()
        return {
            "message": "Настройки сохранены. Подключи облако (Яндекс.Диск или Google) для реального бэкапа.",
            "task_id": None,
        }
    config = configs[0]
    task = run_backup_task.delay(config.id)
    return {"message": "Резервная копия запущена", "task_id": task.id}


@router.put("/preferences")
def update_simple_backup_preferences(
    body: SimpleBackupTrigger,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Update what to backup: photos, contacts, documents."""
    simple = db.query(SimpleBackupConfig).filter(SimpleBackupConfig.user_id == current_user.id).first()
    if not simple:
        simple = SimpleBackupConfig(user_id=current_user.id)
        db.add(simple)
    simple.backup_photos = 1 if body.backup_photos else 0
    simple.backup_contacts = 1 if body.backup_contacts else 0
    simple.backup_documents = 1 if body.backup_documents else 0
    db.commit()
    return {"message": "Сохранено"}
