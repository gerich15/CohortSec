"""Onboarding endpoint - first-time tour completion."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.models.onboarding import OnboardingStatus
from app.models.user import User
from app.utils.deps import get_current_user, get_db_session

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class OnboardingResponse(BaseModel):
    tour_completed: bool


@router.get("/status", response_model=OnboardingResponse)
def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Check if user completed the first-time tour."""
    s = db.query(OnboardingStatus).filter(OnboardingStatus.user_id == current_user.id).first()
    if not s:
        return OnboardingResponse(tour_completed=False)
    return OnboardingResponse(tour_completed=s.tour_completed)


@router.post("/complete")
def complete_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Mark first-time tour as completed."""
    from datetime import datetime

    s = db.query(OnboardingStatus).filter(OnboardingStatus.user_id == current_user.id).first()
    if not s:
        s = OnboardingStatus(user_id=current_user.id)
        db.add(s)
    s.tour_completed = True
    s.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "Тур пройден"}
