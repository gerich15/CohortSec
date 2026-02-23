"""Fraud help API - submit fraud reports, search."""

import hashlib
import os
import re
import random
import string
import uuid
from datetime import datetime
from typing import List, Optional

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.fraud_report import FraudReport
from app.models.user import User
from app.services.clamav_scan import scan_bytes
from app.services.email_service import (
    send_fraud_report_admin_notification,
    send_fraud_report_confirmation,
)
from app.utils.deps import get_current_user_optional, get_db_session

router = APIRouter(prefix="/fraud-help", tags=["fraud-help"])

MAX_FILES = 10
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".txt", ".doc", ".docx"}


def _generate_ticket() -> str:
    return f"FH-{''.join(random.choices(string.digits, k=6))}"


def _get_ip_hash(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    ip = (forwarded.split(",")[0].strip() if forwarded else request.client.host) or "0.0.0.0"
    return hashlib.sha256(ip.encode()).hexdigest()


def _verify_recaptcha(token: str, request: Request) -> bool:
    settings = get_settings()
    if not settings.recaptcha_secret_key:
        return True
    if not token:
        return False
    try:
        resp = httpx.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": settings.recaptcha_secret_key,
                "response": token,
                "remoteip": request.client.host if request.client else None,
            },
            timeout=10,
        )
        data = resp.json()
        return data.get("success", False)
    except Exception:
        return False


def _normalize_phone(s: str) -> str:
    if not s:
        return ""
    return re.sub(r"\D", "", s)[-10:]  # last 10 digits


@router.get("/config")
def get_fraud_help_config():
    """Public config for fraud report form (e.g. reCAPTCHA site key)."""
    settings = get_settings()
    return {"recaptcha_site_key": settings.recaptcha_site_key or ""}


@router.get("/search")
def search_reports(
    q: str,
    db: Session = Depends(get_db_session),
):
    """Search by phone/email. Returns anonymized count."""
    q = q.strip()
    if len(q) < 4:
        return {"found": False, "count": 0, "message": "Введите минимум 4 символа"}

    norm = _normalize_phone(q)
    count_phone = 0
    if norm and len(norm) >= 6:
        count_phone = (
            db.query(FraudReport)
            .filter(
                FraudReport.scammer_phone.isnot(None),
                FraudReport.scammer_phone.ilike(f"%{norm}%"),
            )
            .count()
        )

    count_email = (
        db.query(FraudReport)
        .filter(FraudReport.scammer_email.isnot(None), FraudReport.scammer_email.ilike(f"%{q}%"))
        .count()
    )
    count_card = (
        db.query(FraudReport)
        .filter(FraudReport.scammer_card.isnot(None), FraudReport.scammer_card.ilike(f"%{q}%"))
        .count()
    )

    total = count_phone + count_email + count_card
    if total > 0:
        return {
            "found": True,
            "count": total,
            "message": f"Этот номер/email/карта упоминался в {total} обращениях",
        }
    return {"found": False, "count": 0, "message": "Не найдено в базе"}


@router.post("/report")
def submit_fraud_report(
    request: Request,
    reporter_name: str = Form(...),
    reporter_email: str = Form(...),
    reporter_phone: Optional[str] = Form(None),
    description: str = Form(...),
    scammer_phone: Optional[str] = Form(None),
    scammer_email: Optional[str] = Form(None),
    scammer_link: Optional[str] = Form(None),
    scammer_nickname: Optional[str] = Form(None),
    scammer_card: Optional[str] = Form(None),
    scheme_type: Optional[str] = Form(None),
    consent_given: bool = Form(False),
    recaptcha_token: Optional[str] = Form(None),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db_session),
    user: Optional[User] = Depends(get_current_user_optional),
):
    """Submit a fraud report with optional file attachments."""
    if not consent_given:
        raise HTTPException(400, "Необходимо дать согласие на обработку данных")

    if not _verify_recaptcha(recaptcha_token or "", request):
        raise HTTPException(400, "Пожалуйста, подтвердите, что вы не робот (капча)")

    ip_hash = _get_ip_hash(request)
    day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    recent = db.query(FraudReport).filter(
        FraudReport.ip_hash == ip_hash,
        FraudReport.created_at >= day_start,
    ).count()
    if recent >= 3:
        raise HTTPException(429, "Превышен лимит обращений в день (3). Попробуйте завтра.")

    if len(files) > MAX_FILES:
        raise HTTPException(400, f"Максимум {MAX_FILES} файлов")

    ticket_number = _generate_ticket()
    while db.query(FraudReport).filter(FraudReport.ticket_number == ticket_number).first():
        ticket_number = _generate_ticket()

    attachment_paths: List[str] = []
    settings = get_settings()
    upload_base = os.path.join(settings.upload_dir, "fraud_reports", ticket_number)
    os.makedirs(upload_base, exist_ok=True)

    for f in files:
        if f.filename:
            ext = os.path.splitext(f.filename)[1].lower()
            if ext not in ALLOWED_EXTENSIONS:
                continue
            content = f.file.read()
            if len(content) > MAX_FILE_SIZE:
                continue
            if not scan_bytes(content):
                raise HTTPException(400, "Файл заражён или не прошёл проверку антивирусом")
            safe_name = f"{uuid.uuid4().hex}{ext}"
            path = os.path.join(upload_base, safe_name)
            with open(path, "wb") as out:
                out.write(content)
            attachment_paths.append(os.path.join("fraud_reports", ticket_number, safe_name))

    report = FraudReport(
        ticket_number=ticket_number,
        reporter_name=reporter_name,
        reporter_email=reporter_email,
        reporter_phone=reporter_phone,
        user_id=user.id if user else None,
        description=description,
        scammer_phone=scammer_phone,
        scammer_email=scammer_email,
        scammer_link=scammer_link,
        scammer_nickname=scammer_nickname,
        scammer_card=scammer_card,
        scheme_type=scheme_type,
        consent_given=consent_given,
        ip_hash=ip_hash,
        status="new",
        attachment_paths=attachment_paths or None,
    )
    db.add(report)
    db.commit()

    send_fraud_report_confirmation(reporter_email, ticket_number, reporter_name)
    send_fraud_report_admin_notification(
        ticket_number, reporter_name, reporter_email, description[:300]
    )

    return {
        "ticket_number": ticket_number,
        "message": f"Спасибо! Мы приняли ваше обращение. Номер: #{ticket_number}",
    }
