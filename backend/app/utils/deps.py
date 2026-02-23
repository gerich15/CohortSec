"""FastAPI dependencies - auth, db, etc."""

from typing import Generator, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.security import decode_token
from app.models.user import User

security = HTTPBearer(auto_error=False)


def get_token(request: Request, credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[str]:
    """Extract token from Authorization header or HttpOnly cookie (for browser clients)."""
    if credentials and credentials.credentials:
        return credentials.credentials
    return request.cookies.get("access_token")


def get_db_session() -> Generator[Session, None, None]:
    """Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db_session),
    token: Optional[str] = Depends(get_token),
) -> User:
    """Get current authenticated user from JWT (header or cookie). Rejects MFA-pending tokens."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # MFA-pending tokens are accepted only by /mfa/verify; reject elsewhere
    if payload.get("mfa_pending") is True:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="MFA verification required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        user = db.query(User).filter(User.email == sub).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User inactive")
    return user


def get_current_user_mfa_pending(
    db: Session = Depends(get_db_session),
    token: Optional[str] = Depends(get_token),
) -> User:
    """Get current user from JWT (header or cookie), allowing MFA-pending tokens."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        user = db.query(User).filter(User.email == sub).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User inactive")
    return user


def get_current_user_optional(
    db: Session = Depends(get_db_session),
    token: Optional[str] = Depends(get_token),
) -> Optional[User]:
    """Optional auth - returns None if not authenticated."""
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    sub = payload.get("sub")
    if not sub:
        return None
    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        user = db.query(User).filter(User.email == sub).first()
    else:
        user = db.query(User).filter(User.id == user_id).first()
    return user


def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    """Require superuser."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
