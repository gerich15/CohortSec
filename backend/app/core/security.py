"""JWT, password hashing (Argon2id), encryption (AES-256), token management."""

import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any, Optional

from cryptography.fernet import Fernet, InvalidToken
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.config import get_settings

settings = get_settings()
_passlib_ctx = CryptContext(
    schemes=["argon2"],
    argon2__time_cost=2,
    argon2__memory_cost=65536,
    deprecated="auto",
)


def create_fernet() -> Optional[Fernet]:
    """Create Fernet instance from encryption key or generate from secret."""
    key = settings.encryption_key
    if not key:
        key = base64.urlsafe_b64encode(
            hashlib.sha256(settings.secret_key.encode()).digest()
        ).decode()
    try:
        return Fernet(key.encode() if isinstance(key, str) else key)
    except Exception:
        return None


def hash_password(password: str) -> str:
    """Hash password using Argon2id (PHC format)."""
    return _passlib_ctx.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash. Supports Argon2id and legacy bcrypt."""
    try:
        _passlib_ctx.verify(plain_password, hashed_password)
        return True
    except Exception:
        pass
    try:
        import bcrypt
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def encrypt_field(value: str) -> Optional[str]:
    """Encrypt string for DB storage (AES-256 via Fernet). Returns base64."""
    if not value:
        return value
    encrypted = encrypt_data(value.encode("utf-8"))
    if encrypted:
        return base64.b64encode(encrypted).decode("ascii")
    return value


def decrypt_field(encrypted_b64: Optional[str]) -> Optional[str]:
    """Decrypt field from DB. Expects base64-encoded Fernet ciphertext. Returns original if not encrypted."""
    if not encrypted_b64:
        return encrypted_b64
    try:
        data = base64.b64decode(encrypted_b64, validate=True)
        decrypted = decrypt_data(data)
        if decrypted:
            return decrypted.decode("utf-8")
    except Exception:
        pass
    return encrypted_b64


def create_access_token(
    subject: str | int,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict[str, Any]] = None,
) -> str:
    """Create JWT access token (short-lived)."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def create_refresh_token(subject: str | int, jti: str) -> str:
    """Create JWT refresh token (long-lived)."""
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh", "jti": jti}
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def decode_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
        return payload
    except JWTError:
        return None


def encode_token(token_dict: dict[str, Any]) -> str:
    """Encode dict to JWT (for custom claims)."""
    return jwt.encode(
        token_dict,
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def encrypt_data(data: bytes) -> Optional[bytes]:
    """Encrypt data using Fernet (AES-256)."""
    fernet = create_fernet()
    if fernet:
        return fernet.encrypt(data)
    return None


def decrypt_data(encrypted_data: bytes) -> Optional[bytes]:
    """Decrypt Fernet-encrypted data."""
    fernet = create_fernet()
    if fernet:
        try:
            return fernet.decrypt(encrypted_data)
        except InvalidToken:
            return None
    return None


class TokenPayload(BaseModel):
    """Token payload structure."""

    sub: str
    exp: datetime
    type: str = "access"
