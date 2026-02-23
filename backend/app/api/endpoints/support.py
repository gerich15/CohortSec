"""Support chat API - tickets and messages with file attachments."""

import json
import os
import random
import string
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.support import SupportMessage, SupportTicket
from app.models.user import User
from app.services.clamav_scan import scan_bytes
from app.utils.deps import get_current_user, get_db_session

router = APIRouter(prefix="/support", tags=["support"])

MAX_FILES = 5
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".txt", ".doc", ".docx", ".mp4", ".webm", ".mov"}


def _generate_ticket_number() -> str:
    return f"SP-{''.join(random.choices(string.digits, k=8))}"


@router.post("/message")
def send_message(
    text: str = Form(...),
    ticket_id: Optional[int] = Form(None),
    files: List[UploadFile] = File(default=[]),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Create ticket or add message with optional file attachments (images, videos, docs)."""
    if not text.strip() and not files:
        raise HTTPException(status_code=400, detail="Текст или файл обязателен")

    settings = get_settings()
    upload_base = os.path.join(settings.upload_dir, "support")
    os.makedirs(upload_base, exist_ok=True)

    attachment_paths: List[str] = []
    for f in files[:MAX_FILES]:
        if not f.filename:
            continue
        ext = os.path.splitext(f.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue
        content = f.file.read()
        if len(content) > MAX_FILE_SIZE:
            continue
        if not scan_bytes(content):
            raise HTTPException(status_code=400, detail="Файл не прошёл проверку антивирусом")
        safe_name = f"{uuid.uuid4().hex}{ext}"
        path = os.path.join(upload_base, safe_name)
        with open(path, "wb") as out:
            out.write(content)
        attachment_paths.append(os.path.join("support", safe_name))

    ticket = None
    if ticket_id:
        ticket = db.query(SupportTicket).filter(
            SupportTicket.id == ticket_id,
            SupportTicket.user_id == current_user.id,
        ).first()
        if not ticket:
            raise HTTPException(status_code=404, detail="Обращение не найдено")

    if not ticket:
        ticket_number = _generate_ticket_number()
        while db.query(SupportTicket).filter(SupportTicket.ticket_number == ticket_number).first():
            ticket_number = _generate_ticket_number()
        ticket = SupportTicket(
            ticket_number=ticket_number,
            user_id=current_user.id,
            subject=text[:100] if text.strip() else "Обращение",
        )
        db.add(ticket)
        db.flush()

    msg = SupportMessage(
        ticket_id=ticket.id,
        user_id=current_user.id,
        text=(text or " ").strip(),
        is_support=0,
        attachment_paths=json.dumps(attachment_paths) if attachment_paths else None,
    )
    db.add(msg)
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(msg)

    att_names = [f.filename for f in files[:MAX_FILES] if f.filename]
    return {
        "id": str(msg.id),
        "ticket_id": ticket.id,
        "ticket_number": ticket.ticket_number,
        "attachments": [{"name": n} for n in att_names],
    }


@router.get("/tickets")
def list_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """List user's support tickets."""
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.user_id == current_user.id)
        .order_by(SupportTicket.updated_at.desc())
        .all()
    )
    return [
        {
            "id": t.id,
            "ticket_number": t.ticket_number,
            "status": t.status,
            "subject": t.subject,
            "created_at": t.created_at.isoformat(),
            "updated_at": t.updated_at.isoformat(),
        }
        for t in tickets
    ]


@router.get("/tickets/{ticket_id}/messages")
def get_ticket_messages(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Get messages for a ticket."""
    ticket = (
        db.query(SupportTicket)
        .filter(SupportTicket.id == ticket_id, SupportTicket.user_id == current_user.id)
        .first()
    )
    if not ticket:
        raise HTTPException(status_code=404, detail="Обращение не найдено")
    messages = (
        db.query(SupportMessage)
        .filter(SupportMessage.ticket_id == ticket_id)
        .order_by(SupportMessage.created_at)
        .all()
    )
    result = []
    for m in messages:
        paths = json.loads(m.attachment_paths) if m.attachment_paths else []
        result.append({
            "id": str(m.id),
            "text": m.text,
            "role": "support" if m.is_support else "user",
            "created_at": m.created_at.isoformat(),
            "attachments": [{"name": os.path.basename(p)} for p in paths],
        })
    return result
