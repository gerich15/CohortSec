"""Auth endpoints: login, register, MFA, biometric, refresh, logout."""

import logging
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import init_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    decrypt_field,
    encrypt_field,
    hash_password,
    verify_password,
)
from app.models.user_session import UserSession
from app.models.user import User
from app.schemas.user import TokenResponse, UserCreate, UserLogin
from app.services.biometric import (
    encrypt_embedding,
    extract_face_embedding,
    verify_face,
)
from app.models.user_action import UserAction
from app.models.anomaly import Anomaly
from app.services.predictor import predict
from app.services.threat_intel import get_threat_level
from app.services.anomaly_explainer import explain_anomaly
from app.core.limiter import limiter
from app.services.hibp import check_password_breached
from app.utils.deps import get_current_user, get_current_user_mfa_pending, get_db_session

import pyotp

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)
settings = get_settings()


class MFASetupResponse(BaseModel):
    """MFA setup response with QR URI."""

    secret: str
    qr_uri: str
    message: str


class MFAConfirm(BaseModel):
    """MFA confirmation."""

    code: str


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Set HttpOnly, Secure cookies for tokens."""
    s = get_settings()
    domain = s.token_cookie_domain or None
    secure = s.token_cookie_secure
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=s.access_token_expire_minutes * 60,
        domain=domain,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=secure,
        samesite="lax",
        max_age=s.refresh_token_expire_days * 86400,
        domain=domain,
    )


def _clear_auth_cookies(response: Response) -> None:
    """Clear auth cookies on logout."""
    s = get_settings()
    domain = s.token_cookie_domain or None
    for key in ("access_token", "refresh_token"):
        response.delete_cookie(key=key, domain=domain)


@router.post("/register", response_model=dict)
@limiter.limit("5/minute")
def register(request: Request, user_in: UserCreate, db: Session = Depends(get_db_session)):
    """Register new user. Rejects breached passwords (HIBP)."""
    init_db()
    breached, count = check_password_breached(user_in.password)
    if breached:
        raise HTTPException(
            status_code=400,
            detail=f"Пароль обнаружен в утечках ({count} раз). Выберите другой пароль.",
        )
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "message": "Registered"}


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    login_in: UserLogin,
    db: Session = Depends(get_db_session),
):
    """Login. If MFA enabled, returns mfa_required and temp token."""
    user = db.query(User).filter(User.username == login_in.username).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User inactive")

    # Log action and run ML prediction
    now = datetime.utcnow()
    pred, score = predict(
        hour=now.hour,
        weekday=now.weekday(),
        volume_ops=1,
    )
    action = UserAction(
        user_id=user.id,
        action_type="login",
        timestamp_hour=now.hour,
        timestamp_weekday=now.weekday(),
        volume_operations=1,
        anomaly_score=score,
        is_anomaly=pred,
    )
    db.add(action)
    if pred == -1:
        title, desc = explain_anomaly(
            is_anomaly=True,
            score=score,
            hour=now.hour,
            weekday=now.weekday(),
        )
        anomaly = Anomaly(
            user_id=user.id,
            user_email=user.email,
            action_type="login",
            description=desc,
            threat_level=get_threat_level(score),
            score=score,
        )
        db.add(anomaly)
    db.commit()

    if user.mfa_enabled and user.totp_secret:
        temp_token = create_access_token(
            subject=user.id,
            extra_claims={"mfa_pending": True},
            expires_delta=timedelta(minutes=5),
        )
        return TokenResponse(access_token=temp_token, mfa_required=True)

    # Full login: issue access + refresh, store session, set HttpOnly cookies
    access_token = create_access_token(subject=user.id)
    jti = secrets.token_hex(32)
    refresh_token = create_refresh_token(subject=user.id, jti=jti)
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    session = UserSession(
        user_id=user.id,
        token_jti=jti,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()
    _set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse(access_token=access_token, mfa_required=False)


@router.post("/mfa/verify", response_model=TokenResponse)
@limiter.limit("10/minute")
def verify_mfa(
    request: Request,
    response: Response,
    body: MFAConfirm,
    current_user: User = Depends(get_current_user_mfa_pending),
    db: Session = Depends(get_db_session),
):
    """Verify TOTP code and return full access token. Sets HttpOnly cookies."""
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="MFA not configured")
    secret = decrypt_field(current_user.totp_secret) or current_user.totp_secret
    totp = pyotp.TOTP(secret)
    if not totp.verify(body.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")
    access_token = create_access_token(subject=current_user.id)
    jti = secrets.token_hex(32)
    refresh_token = create_refresh_token(subject=current_user.id, jti=jti)
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    session = UserSession(
        user_id=current_user.id,
        token_jti=jti,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        expires_at=expires_at,
    )
    db.add(session)
    db.commit()
    _set_auth_cookies(response, access_token, refresh_token)
    return TokenResponse(access_token=access_token, mfa_required=False)


@router.post("/mfa/setup", response_model=MFASetupResponse)
def setup_mfa(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Setup TOTP MFA. Returns secret and QR URI for Google Authenticator."""
    if current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA already enabled")
    secret_plain = pyotp.random_base32()
    totp = pyotp.TOTP(secret_plain)
    qr_uri = totp.provisioning_uri(
        name=current_user.email,
        issuer_name="COHORTSEC",
    )
    current_user.totp_secret = encrypt_field(secret_plain) or secret_plain
    db.commit()
    return MFASetupResponse(
        secret=secret_plain,
        qr_uri=qr_uri,
        message="Scan QR with Google Authenticator, then call /mfa/confirm",
    )


@router.post("/mfa/confirm")
def confirm_mfa(
    body: MFAConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    """Confirm MFA setup with TOTP code."""
    secret = decrypt_field(current_user.totp_secret) or current_user.totp_secret
    totp = pyotp.TOTP(secret)
    if not totp.verify(body.code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid TOTP code")
    current_user.mfa_enabled = True
    db.commit()
    return {"message": "MFA enabled"}


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/minute")
def refresh_tokens(
    request: Request,
    response: Response,
    db: Session = Depends(get_db_session),
):
    """Rotate refresh token and issue new access + refresh. Requires refresh_token cookie."""
    refresh = request.cookies.get("refresh_token")
    if not refresh:
        raise HTTPException(status_code=401, detail="Refresh token required")
    payload = decode_token(refresh)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    jti = payload.get("jti")
    sub = payload.get("sub")
    if not jti or not sub:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = int(sub)
    session = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.token_jti == jti,
        UserSession.expires_at > datetime.utcnow(),
    ).first()
    if not session:
        raise HTTPException(status_code=401, detail="Refresh token expired or revoked")
    db.delete(session)
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    new_jti = secrets.token_hex(32)
    access_token = create_access_token(subject=user.id)
    new_refresh = create_refresh_token(subject=user.id, jti=new_jti)
    expires_at = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    new_session = UserSession(
        user_id=user.id,
        token_jti=new_jti,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("User-Agent"),
        expires_at=expires_at,
    )
    db.add(new_session)
    db.commit()
    _set_auth_cookies(response, access_token, new_refresh)
    return TokenResponse(access_token=access_token, mfa_required=False)


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db_session)):
    """Clear auth cookies and invalidate refresh token in DB."""
    refresh = request.cookies.get("refresh_token")
    if refresh:
        payload = decode_token(refresh)
        if payload and payload.get("type") == "refresh":
            jti = payload.get("jti")
            sub = payload.get("sub")
            if jti and sub:
                try:
                    user_id = int(sub)
                except (TypeError, ValueError):
                    user_id = None
                if user_id is not None:
                    session = db.query(UserSession).filter(
                        UserSession.user_id == user_id,
                        UserSession.token_jti == jti,
                    ).first()
                    if session:
                        db.delete(session)
                        db.commit()
    _clear_auth_cookies(response)
    return {"message": "Logged out"}


@router.post("/biometric/register")
def register_biometric(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    file: UploadFile = File(...),
):
    """Register face template from photo."""
    data = file.file.read()
    embedding = extract_face_embedding(data)
    if not embedding:
        raise HTTPException(status_code=400, detail="No face detected")
    encrypted = encrypt_embedding(embedding)
    if not encrypted:
        raise HTTPException(status_code=500, detail="Encryption failed")
    current_user.biometric_template = encrypted
    db.commit()
    return {"message": "Biometric template saved"}


@router.post("/biometric/verify")
def verify_biometric(
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
):
    """Verify face against stored template."""
    if not current_user.biometric_template:
        raise HTTPException(status_code=400, detail="No biometric template")
    data = file.file.read()
    if verify_face(data, current_user.biometric_template):
        return {"verified": True}
    return {"verified": False}
