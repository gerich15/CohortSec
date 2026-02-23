"""Backup endpoints - S3 config, trigger, logs."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.models.backup_config import BackupConfig
from app.models.backup_log import BackupLog
from app.models.user import User
from app.schemas.backup import (
    BackupConfigCreate,
    BackupConfigResponse,
    BackupLogResponse,
    BackupTrigger,
)
from app.tasks.backup_tasks import run_backup_task
from app.utils.deps import get_current_user, get_db_session
from sqlalchemy.orm import Session

router = APIRouter(prefix="/backup", tags=["backup"])


@router.post("/config", response_model=BackupConfigResponse)
def create_backup_config(
    config_in: BackupConfigCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Add external S3 backup source."""
    config = BackupConfig(
        user_id=current_user.id,
        name=config_in.name,
        endpoint=config_in.endpoint,
        access_key=config_in.access_key,
        secret_key=config_in.secret_key,
        bucket=config_in.bucket,
        prefix=config_in.prefix,
        schedule_cron=config_in.schedule_cron,
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


@router.get("/config", response_model=List[BackupConfigResponse])
def list_backup_configs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """List user's backup configs."""
    return (
        db.query(BackupConfig)
        .filter(BackupConfig.user_id == current_user.id)
        .all()
    )


@router.post("/trigger")
def trigger_backup(
    body: BackupTrigger,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Trigger backup manually (MFA recommended for critical action)."""
    config = (
        db.query(BackupConfig)
        .filter(
            BackupConfig.id == body.config_id,
            BackupConfig.user_id == current_user.id,
        )
        .first()
    )
    if not config:
        raise HTTPException(status_code=404, detail="Backup config not found")
    task = run_backup_task.delay(body.config_id)
    return {"task_id": task.id, "message": "Backup started"}


@router.get("/logs", response_model=List[BackupLogResponse])
def list_backup_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    limit: int = 50,
):
    """List backup execution logs for user's configs."""
    configs = db.query(BackupConfig).filter(
        BackupConfig.user_id == current_user.id
    ).all()
    config_ids = [c.id for c in configs]
    if not config_ids:
        return []
    logs = (
        db.query(BackupLog)
        .filter(BackupLog.config_id.in_(config_ids))
        .order_by(BackupLog.started_at.desc())
        .limit(limit)
        .all()
    )
    return logs
