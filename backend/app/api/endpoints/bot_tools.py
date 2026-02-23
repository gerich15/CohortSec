"""Internal API for Telegram bot - phone, password, link, username checks. No user auth, uses X-Bot-Token."""

import re
from typing import List, Tuple
from urllib.parse import urlparse

import phonenumbers
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from app.api.endpoints.osint import _run_sherlock, _phone_type_str
from app.services.hibp import check_password_breached
from app.core.config import get_settings

router = APIRouter(prefix="/bot-tools", tags=["bot-tools"])
settings = get_settings()


def _verify_bot_token(x_bot_token: str | None) -> None:
    """Verify bot API token. Used for internal bot-to-backend calls."""
    token = getattr(settings, "telegram_bot_api_secret", None) or ""
    if not token or x_bot_token != token:
        raise HTTPException(401, "Invalid or missing bot token")


# --- Request/Response schemas ---

class PhoneCheckRequest(BaseModel):
    phone: str = Field(..., min_length=5, max_length=20)


class PhoneCheckResponse(BaseModel):
    valid: bool
    formatted: str | None = None
    country_code: int | None = None
    country: str | None = None
    number_type: str | None = None


class PasswordCheckRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=128)


class PasswordCheckResponse(BaseModel):
    breached: bool
    count: int
    message: str


class LinkCheckRequest(BaseModel):
    url: str = Field(..., min_length=5, max_length=2048)


class LinkCheckResponse(BaseModel):
    valid: bool
    domain: str | None = None
    warnings: List[str] = []
    message: str


class UsernameCheckRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")


class UsernameResult(BaseModel):
    site: str
    url: str
    status: str


class UsernameCheckResponse(BaseModel):
    username: str
    found: List[UsernameResult] = []
    total: int = 0


# --- Endpoints ---

@router.post("/phone", response_model=PhoneCheckResponse)
def check_phone(
    request: PhoneCheckRequest,
    x_bot_token: str | None = Header(None, alias="X-Bot-Token"),
):
    """Validate phone number. Bot-only endpoint."""
    _verify_bot_token(x_bot_token)
    raw = re.sub(r"[\s\-\(\)]", "", request.phone)
    if not raw.startswith("+"):
        raw = "+" + raw
    try:
        parsed = phonenumbers.parse(raw, None)
        valid = phonenumbers.is_valid_number(parsed)
        return PhoneCheckResponse(
            valid=valid,
            formatted=phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.INTERNATIONAL),
            country_code=parsed.country_code,
            country=phonenumbers.region_code_for_number(parsed),
            number_type=_phone_type_str(phonenumbers.number_type(parsed)) if valid else None,
        )
    except phonenumbers.NumberParseException:
        return PhoneCheckResponse(valid=False)


@router.post("/password", response_model=PasswordCheckResponse)
def check_password(
    request: PasswordCheckRequest,
    x_bot_token: str | None = Header(None, alias="X-Bot-Token"),
):
    """Check password against HIBP breach database. Bot-only endpoint."""
    _verify_bot_token(x_bot_token)
    breached, count = check_password_breached(request.password)
    if breached:
        return PasswordCheckResponse(
            breached=True,
            count=count,
            message=f"⚠️ Пароль скомпрометирован! Обнаружен в {count} утечках. Рекомендуем сменить пароль.",
        )
    return PasswordCheckResponse(
        breached=False,
        count=0,
        message="✅ Пароль не найден в известных утечках.",
    )


def _validate_url(url: str) -> Tuple[bool, str | None, List[str]]:
    """Validate URL format and basic security checks."""
    warnings = []
    try:
        parsed = urlparse(url)
        if not parsed.scheme:
            return False, None, ["Отсутствует протокол (http/https)"]
        if parsed.scheme not in ("http", "https"):
            return False, None, [f"Неподдерживаемый протокол: {parsed.scheme}"]
        if not parsed.netloc:
            return False, None, ["Отсутствует домен"]
        domain = parsed.netloc.lower()
        # Remove port
        if ":" in domain:
            domain = domain.split(":")[0]
        # Basic phishing checks
        if any(x in domain for x in ["login", "signin", "account", "secure", "update", "verify"]):
            if len(domain) < 15:  # Short suspicious domains
                warnings.append("Подозрительный домен с типичными словами фишинга")
        # Check for IP instead of domain (often used in phishing)
        if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", domain):
            warnings.append("URL указывает на IP-адрес вместо домена — возможен фишинг")
        return True, domain, warnings
    except Exception as e:
        return False, None, [str(e)]


@router.post("/link", response_model=LinkCheckResponse)
def check_link(
    request: LinkCheckRequest,
    x_bot_token: str | None = Header(None, alias="X-Bot-Token"),
):
    """Validate URL and basic security checks. Bot-only endpoint."""
    _verify_bot_token(x_bot_token)
    valid, domain, warnings = _validate_url(request.url.strip())
    if not valid:
        return LinkCheckResponse(
            valid=False,
            domain=None,
            warnings=warnings,
            message="❌ Некорректная или небезопасная ссылка.",
        )
    if warnings:
        return LinkCheckResponse(
            valid=True,
            domain=domain,
            warnings=warnings,
            message="⚠️ Ссылка валидна, но есть предупреждения. Будьте осторожны.",
        )
    return LinkCheckResponse(
        valid=True,
        domain=domain,
        warnings=[],
        message="✅ Ссылка выглядит корректно. Всё равно проверяйте адрес перед переходом.",
    )


class LinkAccountRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=64)
    telegram_id: int = Field(...)
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None


@router.post("/link-account")
def link_account(
    request: LinkAccountRequest,
    x_bot_token: str | None = Header(None, alias="X-Bot-Token"),
):
    """
    Complete Telegram account linking. Called by bot when user opens link_<token>.
    """
    _verify_bot_token(x_bot_token)
    from datetime import datetime, timedelta
    from app.core.database import SessionLocal
    from app.models.notification_link_token import NotificationLinkToken
    from app.models.telegram_bot_user import TelegramBotUser

    db = SessionLocal()
    try:
        expiry = datetime.utcnow() - timedelta(seconds=300)
        record = db.query(NotificationLinkToken).filter(
            NotificationLinkToken.token == request.token,
            NotificationLinkToken.created_at > expiry,
        ).first()
        if not record:
            raise HTTPException(400, "Ссылка истекла или уже использована. Создайте новую на сайте.")
        user_id = record.user_id
        db.delete(record)
        bot_user = db.query(TelegramBotUser).filter(
            TelegramBotUser.telegram_id == request.telegram_id
        ).first()
        if not bot_user:
            bot_user = TelegramBotUser(
                telegram_id=request.telegram_id,
                username=request.username,
                first_name=request.first_name,
                last_name=request.last_name,
                user_id=user_id,
                is_subscribed=True,
            )
            db.add(bot_user)
        else:
            bot_user.user_id = user_id
            bot_user.username = request.username
            bot_user.first_name = request.first_name
            bot_user.last_name = request.last_name
            bot_user.is_subscribed = True
        db.commit()
        return {"ok": True, "message": "Аккаунт успешно привязан"}
    finally:
        db.close()


@router.post("/username", response_model=UsernameCheckResponse)
def check_username(
    request: UsernameCheckRequest,
    x_bot_token: str | None = Header(None, alias="X-Bot-Token"),
):
    """Search username across social networks (Sherlock). Bot-only endpoint."""
    _verify_bot_token(x_bot_token)
    username = request.username.strip()
    found = _run_sherlock(username)
    return UsernameCheckResponse(
        username=username,
        found=[
            UsernameResult(site=r["site"], url=r.get("url", ""), status=r.get("status", "Claimed"))
            for r in found
        ],
        total=len(found),
    )
