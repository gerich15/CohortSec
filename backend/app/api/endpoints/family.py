"""Family endpoints - B2C family members and invitations."""

import secrets
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.models.family_member import FamilyInvitation, FamilyMember
from app.models.user import User
from app.services.email_service import send_family_invite_email
from app.utils.deps import get_current_user, get_db_session

router = APIRouter(prefix="/family", tags=["family"])


class InviteRequest(BaseModel):
    email: EmailStr
    display_name: str | None = None


class InvitationResponse(BaseModel):
    id: int
    email: str
    display_name: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/members", response_model=List[dict])
def list_family_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """List family members for current user."""
    owned = (
        db.query(FamilyMember)
        .filter(FamilyMember.owner_id == current_user.id)
        .all()
    )
    if not owned:
        return []
    user_ids = [m.user_id for m in owned]
    users_map = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()}
    members = []
    for m in owned:
        u = users_map.get(m.user_id)
        members.append({
            "id": m.id,
            "user_id": m.user_id,
            "display_name": m.display_name or (u.full_name if u else "Polzovatel"),
            "role": m.role,
            "email": u.email if u else None,
        })
    return members


@router.post("/invite", response_model=InvitationResponse)
def invite_family_member(
    body: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Send invitation to join family by email."""
    count = (
        db.query(FamilyMember)
        .filter(FamilyMember.owner_id == current_user.id)
        .count()
    )
    pending = (
        db.query(FamilyInvitation)
        .filter(
            FamilyInvitation.owner_id == current_user.id,
            FamilyInvitation.status == "pending",
        )
        .count()
    )
    if count + pending >= 5:
        raise HTTPException(
            status_code=400,
            detail="Max 5 family members. Remove someone or cancel invitation.",
        )
    existing = db.query(FamilyInvitation).filter(
        FamilyInvitation.owner_id == current_user.id,
        FamilyInvitation.email == body.email,
        FamilyInvitation.status == "pending",
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Invitation already sent to this email")
    token = secrets.token_urlsafe(32)
    expires = datetime.utcnow() + timedelta(days=7)
    inv = FamilyInvitation(
        owner_id=current_user.id,
        email=body.email,
        display_name=body.display_name,
        token=token,
        status="pending",
        expires_at=expires,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    inviter_name = current_user.full_name or current_user.username or "Пользователь"
    send_family_invite_email(
        to_email=body.email,
        inviter_display_name=inviter_name,
        display_name=body.display_name,
        token=token,
        expires_days=7,
    )
    return inv


@router.delete("/members/{member_id}")
def remove_family_member(
    member_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Remove family member."""
    m = (
        db.query(FamilyMember)
        .filter(
            FamilyMember.id == member_id,
            FamilyMember.owner_id == current_user.id,
        )
        .first()
    )
    if not m:
        raise HTTPException(status_code=404, detail="Member not found")
    db.delete(m)
    db.commit()
    return {"message": "Removed"}
