"""Monitoring endpoints - telemetry, dashboard stats, WebSocket."""

import asyncio
import json
import logging
from typing import List

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.anomaly import Anomaly
from app.models.backup_config import BackupConfig
from app.models.backup_log import BackupLog
from app.models.simple_backup_config import SimpleBackupConfig
from app.models.user import User
from app.utils.deps import get_current_user, get_db_session

router = APIRouter(prefix="/monitoring", tags=["monitoring"])
logger = logging.getLogger(__name__)

# Simple in-memory WebSocket manager for real-time anomaly notifications
# Each entry: (websocket, user_id) for per-user broadcast filtering
ws_connections: List[tuple] = []


async def broadcast_anomaly(data: dict, target_user_id: int | None = None) -> None:
    """Broadcast anomaly to connected WebSocket clients (optionally filtered by user)."""
    msg = json.dumps({"type": "anomaly", "data": data})
    for entry in ws_connections[:]:
        ws, uid = entry if len(entry) == 2 else (entry[0], None)
        if target_user_id is not None and uid is not None and uid != target_user_id:
            continue
        try:
            await ws.send_text(msg)
        except Exception:
            ws_connections.remove(entry)


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Dashboard stats: risk level, recent anomalies, backup status."""
    base_anomaly = db.query(Anomaly).filter(Anomaly.resolved == 0)
    if not current_user.is_superuser:
        base_anomaly = base_anomaly.filter(Anomaly.user_id == current_user.id)
    anomaly_count = base_anomaly.count()

    # Last backup - only configs owned by current user
    config_ids = [c.id for c in db.query(BackupConfig).filter(BackupConfig.user_id == current_user.id).all()]
    last_backup = None
    if config_ids:
        last_backup = (
            db.query(BackupLog)
            .filter(
                BackupLog.config_id.in_(config_ids),
                BackupLog.status == "success",
            )
            .order_by(BackupLog.finished_at.desc())
            .first()
        )
    if last_backup is None:
        simple = db.query(SimpleBackupConfig).filter(SimpleBackupConfig.user_id == current_user.id).first()
        if simple and simple.last_backup_at:
            backup_info = {
                "last_run": simple.last_backup_at.isoformat(),
                "objects_count": 0,
                "total_bytes": 0,
            }
        else:
            backup_info = None
    else:
        backup_info = {
            "last_run": last_backup.finished_at.isoformat() if last_backup.finished_at else None,
            "objects_count": last_backup.objects_count or 0,
            "total_bytes": last_backup.total_size_bytes or 0,
        }
    base_high = db.query(Anomaly).filter(Anomaly.threat_level == "High", Anomaly.resolved == 0)
    if not current_user.is_superuser:
        base_high = base_high.filter(Anomaly.user_id == current_user.id)
    high_count = base_high.count()
    photos_count = backup_info["objects_count"] if backup_info else 0

    return {
        "active_anomalies": anomaly_count,
        "high_threat_count": high_count,
        "last_backup": backup_info,
        "geo_entries": [],  # Placeholder for GeoIP map
        "attempts_hack": anomaly_count + high_count,
        "photos_safe": photos_count,
        "passwords_ok": high_count == 0,
    }


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time anomaly notifications. Requires JWT (query param ?token= or access_token cookie)."""
    jwt_token = websocket.query_params.get("token") or websocket.cookies.get("access_token")
    if not jwt_token:
        await websocket.close(code=4001)
        return
    payload = decode_token(jwt_token)
    if not payload or payload.get("mfa_pending"):
        await websocket.close(code=4001)
        return
    sub = payload.get("sub")
    if not sub:
        await websocket.close(code=4001)
        return
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        await websocket.close(code=4001)
        return
    await websocket.accept()
    entry = (websocket, user_id)
    ws_connections.append(entry)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        if entry in ws_connections:
            ws_connections.remove(entry)
