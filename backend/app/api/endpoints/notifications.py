"""Notifications: Telegram linking, preferences, test send."""

import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.notification_link_token import NotificationLinkToken
from app.models.telegram_bot_user import TelegramBotUser
from app.models.user import User
from app.utils.deps import get_current_user
from app.services.telegram_notify import (
    get_telegram_ids_for_user,
    send_to_telegram_ids,
)

router = APIRouter(prefix="/notifications", tags=["notifications"])
settings = get_settings()

LINK_TOKEN_TTL = 300  # 5 min


class TelegramLinkTokenResponse(BaseModel):
    bot_link: str
    token: str
    expires_in: int = LINK_TOKEN_TTL


class NotificationPreferencesResponse(BaseModel):
    telegram_linked: bool
    push_enabled: bool
    news_enabled: bool
    lifehacks_enabled: bool
    is_subscribed: bool
    bot_link: str = ""


class NotificationPreferencesUpdate(BaseModel):
    push_enabled: Optional[bool] = None
    news_enabled: Optional[bool] = None
    lifehacks_enabled: Optional[bool] = None
    is_subscribed: Optional[bool] = None


@router.post("/telegram-link-token", response_model=TelegramLinkTokenResponse)
def create_telegram_link_token(current_user: User = Depends(get_current_user)):
    """
    Create a one-time token to link Telegram account.
    User opens the returned bot_link in Telegram; bot will complete the link.
    """
    token = secrets.token_urlsafe(32)
    db = SessionLocal()
    try:
        record = NotificationLinkToken(
            token=token,
            user_id=current_user.id,
        )
        db.add(record)
        db.commit()
        bot_link = f"{settings.telegram_bot_link.rstrip('/')}?start=link_{token}"
        return TelegramLinkTokenResponse(
            bot_link=bot_link,
            token=token,
            expires_in=LINK_TOKEN_TTL,
        )
    finally:
        db.close()


@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_preferences(current_user: User = Depends(get_current_user)):
    """Get notification preferences. If linked via Telegram, returns bot user prefs."""
    db = SessionLocal()
    try:
        bot_user = db.query(TelegramBotUser).filter(
            TelegramBotUser.user_id == current_user.id
        ).first()
        if not bot_user:
            return NotificationPreferencesResponse(
                telegram_linked=False,
                push_enabled=True,
                news_enabled=True,
                lifehacks_enabled=True,
                is_subscribed=True,
                bot_link=settings.telegram_bot_link,
            )
        return NotificationPreferencesResponse(
            telegram_linked=True,
            push_enabled=bot_user.push_enabled,
            news_enabled=bot_user.news_enabled,
            lifehacks_enabled=bot_user.lifehacks_enabled,
            is_subscribed=bot_user.is_subscribed,
            bot_link=settings.telegram_bot_link,
        )
    finally:
        db.close()


@router.put("/preferences", response_model=NotificationPreferencesResponse)
def update_preferences(
    data: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_user),
):
    """Update notification preferences. Requires Telegram to be linked."""
    db = SessionLocal()
    try:
        bot_user = db.query(TelegramBotUser).filter(
            TelegramBotUser.user_id == current_user.id
        ).first()
        if not bot_user:
            raise HTTPException(
                400,
                "Подключите Telegram-бота для настройки уведомлений",
            )
        if data.push_enabled is not None:
            bot_user.push_enabled = data.push_enabled
        if data.news_enabled is not None:
            bot_user.news_enabled = data.news_enabled
        if data.lifehacks_enabled is not None:
            bot_user.lifehacks_enabled = data.lifehacks_enabled
        if data.is_subscribed is not None:
            bot_user.is_subscribed = data.is_subscribed
        db.commit()
        db.refresh(bot_user)
        return NotificationPreferencesResponse(
            telegram_linked=True,
            push_enabled=bot_user.push_enabled,
            news_enabled=bot_user.news_enabled,
            lifehacks_enabled=bot_user.lifehacks_enabled,
            is_subscribed=bot_user.is_subscribed,
            bot_link=settings.telegram_bot_link,
        )
    finally:
        db.close()


@router.post("/test")
def send_test_notification(current_user: User = Depends(get_current_user)):
    """Send a test notification to linked Telegram. Requires Telegram to be linked."""
    tids = get_telegram_ids_for_user(current_user.id)
    if not tids:
        raise HTTPException(
            400,
            "Подключите Telegram-бота, чтобы получать тестовое уведомление",
        )
    msg = (
        "🔔 <b>CohortSec: Тестовое уведомление</b>\n\n"
        "Вы успешно подключили уведомления. Важные алерты "
        "(подозрительная активность, взлом) будут приходить сюда."
    )
    sent = send_to_telegram_ids(msg, tids)
    if sent == 0:
        raise HTTPException(500, "Не удалось отправить уведомление")
    return {"sent": sent, "message": "Тестовое уведомление отправлено"}
