"""Anomaly endpoints - predictions, list incidents."""

from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.anomaly import Anomaly
from app.models.user import User
from app.schemas.anomaly import AnomalyResponse, RiskPoint
from app.services.predictor import predict
from app.services.threat_intel import get_threat_level
from app.utils.deps import get_current_user, get_current_superuser, get_db_session

router = APIRouter(prefix="/anomalies", tags=["anomalies"])


@router.get("/", response_model=List[AnomalyResponse])
def list_anomalies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    limit: int = Query(50, le=200),
    resolved: Optional[int] = None,
):
    """List anomaly incidents."""
    q = db.query(Anomaly)
    if current_user.is_superuser:
        pass
    else:
        q = q.filter(Anomaly.user_id == current_user.id)
    if resolved is not None:
        q = q.filter(Anomaly.resolved == resolved)
    return q.order_by(Anomaly.created_at.desc()).limit(limit).all()


@router.get("/timeline")
def get_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    limit: int = Query(20, le=50),
):
    """B2C: Human-readable event timeline (anomalies and logins)."""
    from app.services.anomaly_explainer import explain_anomaly

    q = db.query(Anomaly).filter(Anomaly.user_id == current_user.id)
    anomalies = q.order_by(Anomaly.created_at.desc()).limit(limit).all()

    events = []
    for a in anomalies:
        hour = a.created_at.hour
        weekday = a.created_at.weekday()
        is_anom = a.threat_level in ("High", "Medium") or (a.score is not None and a.score < 0)
        title, desc = explain_anomaly(
            is_anomaly=is_anom,
            score=a.score or 0,
            hour=hour,
            weekday=weekday,
            geo_location=a.geo_location,
        )
        geo = a.geo_location or "неизвестном месте"
        events.append({
            "id": a.id,
            "type": "anomaly" if is_anom else "login",
            "title": a.description or title,
            "description": desc,
            "created_at": a.created_at.isoformat(),
            "threat_level": a.threat_level,
        })
    return {"events": events}


@router.get("/risk-chart", response_model=List[RiskPoint])
def risk_chart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    hours: int = Query(24, le=168),
):
    """Risk level over time for chart."""
    since = datetime.utcnow() - timedelta(hours=hours)
    q = db.query(Anomaly).filter(Anomaly.created_at >= since)
    if not current_user.is_superuser:
        q = q.filter(Anomaly.user_id == current_user.id)
    anomalies = q.order_by(Anomaly.created_at).all()
    buckets = {}
    for a in anomalies:
        ts = a.created_at.strftime("%Y-%m-%d %H:00")
        if ts not in buckets:
            buckets[ts] = {"count": 0, "scores": []}
        buckets[ts]["count"] += 1
        if a.score is not None:
            buckets[ts]["scores"].append(a.score)
    result = []
    for ts in sorted(buckets.keys()):
        b = buckets[ts]
        avg_score = (
            sum(b["scores"]) / len(b["scores"]) if b["scores"] else 0
        )
        result.append(
            RiskPoint(
                timestamp=ts,
                risk_level=round(-avg_score, 2) if avg_score < 0 else 0,
                anomaly_count=b["count"],
            )
        )
    return result


class PredictRequest(BaseModel):
    """Predict request body."""

    hour: int
    weekday: int
    volume_ops: int = 0
    action_type: str = "login"


@router.post("/predict")
def predict_action(
    body: PredictRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Check if action is anomalous. Records anomaly if predicted -1."""
    pred, score = predict(
        body.hour,
        body.weekday,
        body.volume_ops,
    )
    threat = get_threat_level(score)
    if pred == -1:
        anomaly = Anomaly(
            user_id=current_user.id,
            user_email=current_user.email,
            action_type=body.action_type,
            description=f"Anomaly detected: score={score:.3f}",
            threat_level=threat,
            score=score,
        )
        db.add(anomaly)
        db.commit()
    return {
        "prediction": pred,
        "score": score,
        "is_anomaly": pred == -1,
        "threat_level": threat,
    }
