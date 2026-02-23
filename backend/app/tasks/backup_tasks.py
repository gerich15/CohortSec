"""Celery backup tasks."""

import logging
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.celery_app import celery_app
from app.core.config import get_settings
from app.models.backup_config import BackupConfig
from app.models.backup_log import BackupLog
from app.services.backup_worker import copy_bucket

settings = get_settings()
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
logger = logging.getLogger(__name__)


def get_db():
    """Get sync DB session for Celery."""
    return SessionLocal()


@celery_app.task(bind=True)
def run_backup_task(self, config_id: int) -> dict:
    """Run backup for a specific config. Called from Celery."""
    db = get_db()
    try:
        config = db.query(BackupConfig).filter(
            BackupConfig.id == config_id,
            BackupConfig.is_active == 1,
        ).first()
        if not config:
            return {"status": "skipped", "error": "Config not found or inactive"}

        log = BackupLog(
            config_id=config_id,
            status="running",
            started_at=datetime.utcnow(),
        )
        db.add(log)
        db.commit()
        db.refresh(log)

        result = copy_bucket(
            source_endpoint=config.endpoint,
            source_access_key=config.access_key,
            source_secret_key=config.secret_key,
            source_bucket=config.bucket,
            source_prefix=config.prefix,
            target_bucket=settings.minio_bucket,
        )

        log.status = result["status"]
        log.objects_count = result["objects_count"]
        log.total_size_bytes = result["total_bytes"]
        log.error_message = result.get("error")
        log.finished_at = datetime.utcnow()
        db.commit()

        return result
    except Exception as e:
        logger.exception("Backup task failed: %s", e)
        raise
    finally:
        db.close()


@celery_app.task
def run_scheduled_backups() -> None:
    """Celery beat: run all active backup configs."""
    db = get_db()
    try:
        configs = db.query(BackupConfig).filter(BackupConfig.is_active == 1).all()
        for cfg in configs:
            run_backup_task.delay(cfg.id)
    finally:
        db.close()
