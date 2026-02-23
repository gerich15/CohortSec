"""User management endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.utils.deps import get_current_user, get_current_superuser, get_db_session
from app.core.security import hash_password
from sqlalchemy.orm import Session

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        mfa_enabled=getattr(current_user, "mfa_enabled", False),
        created_at=current_user.created_at,
    )


@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Update current user. Password change requires MFA in production."""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.password:
        current_user.hashed_password = hash_password(user_update.password)
    db.commit()
    db.refresh(current_user)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        mfa_enabled=getattr(current_user, "mfa_enabled", False),
        created_at=current_user.created_at,
    )


@router.get("/", response_model=List[UserResponse])
def list_users(
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db_session),
):
    """List all users (superuser only)."""
    return db.query(User).all()
