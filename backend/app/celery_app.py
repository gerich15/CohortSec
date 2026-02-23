"""Celery application for background tasks."""

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "cohortsec",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.backup_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "daily-backup": {
            "task": "app.tasks.backup_tasks.run_scheduled_backups",
            "schedule": crontab(hour=2, minute=0),  # 02:00 UTC daily
        },
    },
)
