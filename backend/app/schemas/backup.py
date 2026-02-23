"""Backup schemas."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator


def _endpoint_looks_like_host(value: str) -> bool:
    """Endpoint must look like a real host (has dot, or localhost, or port)."""
    if not value or len(value) < 4:
        return False
    if "." in value:
        return True
    if value.startswith("localhost"):
        return True
    if ":" in value:
        return True
    return False


class BackupConfigCreate(BaseModel):
    """Create backup config."""

    name: str
    endpoint: str
    access_key: str
    secret_key: str
    bucket: str
    prefix: Optional[str] = None
    schedule_cron: str = "0 2 * * *"

    @field_validator("endpoint")
    @classmethod
    def endpoint_valid_host(cls, v: str) -> str:
        if not _endpoint_looks_like_host(v):
            raise ValueError(
                "endpoint must be a valid host (e.g. s3.amazonaws.com or localhost:9000)"
            )
        return v.strip()

    @field_validator("bucket")
    @classmethod
    def bucket_min_length(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("bucket name must be at least 2 characters")
        return v


class BackupConfigResponse(BaseModel):
    """Backup config response (no secret)."""

    id: int
    name: str
    endpoint: str
    bucket: str
    prefix: Optional[str] = None
    schedule_cron: str
    is_active: int
    created_at: datetime

    class Config:
        from_attributes = True


class BackupLogResponse(BaseModel):
    """Backup log response."""

    id: int
    config_id: int
    status: str
    objects_count: int
    total_size_bytes: int
    error_message: Optional[str] = None
    started_at: datetime
    finished_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BackupTrigger(BaseModel):
    """Trigger backup manually."""

    config_id: int
