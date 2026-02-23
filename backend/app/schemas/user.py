"""User schemas."""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


def _validate_password(v: str) -> str:
    """Enforce password policy: min 12 chars, uppercase, lowercase, digit, special."""
    if len(v) < 12:
        raise ValueError("Пароль должен содержать минимум 12 символов")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Пароль должен содержать хотя бы одну заглавную букву")
    if not re.search(r"[a-z]", v):
        raise ValueError("Пароль должен содержать хотя бы одну строчную букву")
    if not re.search(r"\d", v):
        raise ValueError("Пароль должен содержать хотя бы одну цифру")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;\'`~]', v):
        raise ValueError("Пароль должен содержать хотя бы один спецсимвол (!@#$%^&* и т.д.)")
    return v


class UserBase(BaseModel):
    """User base schema."""

    email: EmailStr
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""

    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        return _validate_password(v)


class UserUpdate(BaseModel):
    """User update schema."""

    full_name: Optional[str] = None
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v == "":
            return v
        return _validate_password(v)


class UserResponse(UserBase):
    """User response schema. Uses str for email to accept internal addresses like .local."""

    model_config = ConfigDict(from_attributes=True)

    email: str  # override EmailStr to accept admin@*.local etc.
    id: int
    is_active: bool
    is_superuser: bool
    mfa_enabled: bool = False
    created_at: datetime


class UserLogin(BaseModel):
    """Login request."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    token_type: str = "bearer"
    mfa_required: bool = False


class MFAVerify(BaseModel):
    """MFA verification."""

    code: str
