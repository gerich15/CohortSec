"""Send Telegram notifications to bot subscribers."""

import logging
from enum import Enum
from typing import List

import httpx

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.telegram_bot_user import TelegramBotUser

logger = logging.getLogger(__name__)
settings = get_settings()

TELEGRAM_API = "https://api.telegram.org/bot"


class NotificationType(str, Enum):
    """Notification types. Important ones cannot be disabled by user."""

    IMPORTANT = "important"  # Suspicious activity, hack - always sent
    PUSH = "push"  # General push - can disable
    NEWS = "news"  # News - can disable
    LIFEHACKS = "lifehacks"  # Life hacks - can disable


def _get_recipients(notification_type: NotificationType) -> List[int]:
    """Get telegram_ids of users who should receive this notification."""
    db = SessionLocal()
    try:
        users = db.query(TelegramBotUser).filter(TelegramBotUser.is_subscribed == True).all()
        result = []
        for u in users:
            if notification_type == NotificationType.IMPORTANT:
                result.append(u.telegram_id)
            elif notification_type == NotificationType.PUSH and u.push_enabled:
                result.append(u.telegram_id)
            elif notification_type == NotificationType.NEWS and u.news_enabled:
                result.append(u.telegram_id)
            elif notification_type == NotificationType.LIFEHACKS and u.lifehacks_enabled:
                result.append(u.telegram_id)
        return result
    finally:
        db.close()


def send_telegram_notification(
    message: str,
    notification_type: NotificationType = NotificationType.IMPORTANT,
) -> int:
    """
    Send notification to all eligible bot subscribers.
    Returns number of users notified.
    """
    token = settings.telegram_bot_token
    if not token:
        logger.warning("TELEGRAM_BOT_TOKEN not set, skipping notification")
        return 0
    recipients = _get_recipients(notification_type)
    if not recipients:
        return 0
    url = f"{TELEGRAM_API}{token}/sendMessage"
    sent = 0
    for telegram_id in recipients:
        try:
            with httpx.Client(timeout=10.0) as client:
                r = client.post(
                    url,
                    json={"chat_id": telegram_id, "text": message, "parse_mode": "HTML"},
                )
                if r.status_code == 200:
                    sent += 1
                else:
                    logger.warning("Telegram send failed for %s: %s", telegram_id, r.text)
        except Exception as e:
            logger.exception("Failed to send to %s: %s", telegram_id, e)
    return sent


def notify_suspicious_activity(description: str, telegram_ids: List[int] | None = None) -> int:
    """
    Notify about suspicious activity. Always sent (important).
    If telegram_ids given, send only to those; else to all subscribers.
    """
    msg = (
        "🚨 <b>CohortSec: Подозрительная активность</b>\n\n"
        f"{description}\n\n"
        "Рекомендуем сменить пароль и проверить настройки безопасности."
    )
    if telegram_ids:
        return send_to_telegram_ids(msg, telegram_ids)
    return send_telegram_notification(msg, NotificationType.IMPORTANT)


def notify_possible_breach(description: str, telegram_ids: List[int] | None = None) -> int:
    """
    Notify about possible account breach. Always sent (important).
    If telegram_ids given, send only to those; else to all subscribers.
    """
    msg = (
        "🔒 <b>CohortSec: Возможный взлом</b>\n\n"
        f"{description}\n\n"
        "Немедленно смените пароль и включите 2FA."
    )
    if telegram_ids:
        return send_to_telegram_ids(msg, telegram_ids)
    return send_telegram_notification(msg, NotificationType.IMPORTANT)


def send_to_telegram_ids(message: str, telegram_ids: List[int]) -> int:
    """Send message to specific telegram IDs."""
    token = settings.telegram_bot_token
    if not token:
        return 0
    url = f"{TELEGRAM_API}{token}/sendMessage"
    sent = 0
    for tid in telegram_ids:
        try:
            with httpx.Client(timeout=10.0) as client:
                r = client.post(
                    url,
                    json={"chat_id": tid, "text": message, "parse_mode": "HTML"},
                )
                if r.status_code == 200:
                    sent += 1
        except Exception as e:
            logger.exception("Failed to send to %s: %s", tid, e)
    return sent


def get_telegram_ids_for_user(platform_user_id: int) -> List[int]:
    """Get telegram_ids of bot users linked to this platform user."""
    db = SessionLocal()
    try:
        users = (
            db.query(TelegramBotUser)
            .filter(TelegramBotUser.user_id == platform_user_id, TelegramBotUser.is_subscribed == True)
            .all()
        )
        return [u.telegram_id for u in users]
    finally:
        db.close()
