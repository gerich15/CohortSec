"""Telegram bot handlers."""

import logging
import os
from contextlib import suppress
from urllib.parse import unquote

import httpx
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.telegram_bot_user import TelegramBotUser

logger = logging.getLogger(__name__)
settings = get_settings()

# API base: backend service in Docker, or localhost when running locally
API_BASE = os.getenv("API_BASE_URL", "http://backend:8000/api/v1")
BOT_TOKEN = settings.telegram_bot_token
CHANNEL_URL = settings.cohortsec_channel_url or "https://t.me/cohortsec"
API_SECRET = settings.telegram_bot_api_secret

# --- Welcome text (first launch only) ---
WELCOME_TITLE = "🛡️ CohortSec — Ваш цифровой телохранитель"
WELCOME_SLOGAN = "Твоя цифровая когорта — защита для всей семьи."
WELCOME_GREETING = "Добро пожаловать!"
WELCOME_ABOUT = """
CohortSec — B2C-сервис для защиты себя и семьи в интернете. Мы помогаем с мониторингом входов, проверкой паролей, бэкапами и помощью при мошенничестве.

Этот бот — ваш быстрый помощник:
• Проверка номеров телефонов
• Проверка паролей на утечки (Have I Been Pwned)
• Проверка ссылок на фишинг
• Поиск никнейма по соцсетям

Подписывайтесь на наш канал — новости, советы по безопасности и важные обновления!
"""


def get_or_create_user(
    telegram_id: int,
    username: str | None,
    first_name: str | None,
    last_name: str | None,
) -> TelegramBotUser:
    """Get or create TelegramBotUser."""
    db = SessionLocal()
    try:
        user = db.query(TelegramBotUser).filter(TelegramBotUser.telegram_id == telegram_id).first()
        if not user:
            user = TelegramBotUser(
                telegram_id=telegram_id,
                username=username,
                first_name=first_name,
                last_name=last_name,
                welcome_seen=False,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    finally:
        db.close()


def update_user_preference(telegram_id: int, **kwargs) -> None:
    """Update user notification preferences."""
    db = SessionLocal()
    try:
        user = db.query(TelegramBotUser).filter(TelegramBotUser.telegram_id == telegram_id).first()
        if user:
            for k, v in kwargs.items():
                if hasattr(user, k):
                    setattr(user, k, v)
            db.commit()
    finally:
        db.close()


async def _call_api(endpoint: str, method: str, json_data: dict | None = None) -> dict | list | None:
    """Call backend API with bot token."""
    url = f"{API_BASE}/bot-tools/{endpoint}"
    headers = {"X-Bot-Token": API_SECRET}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            if method == "POST":
                r = await client.post(url, json=json_data or {}, headers=headers)
            else:
                r = await client.get(url, headers=headers)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as e:
        logger.warning(
            "API %s %s failed: status=%d body=%s",
            method, endpoint, e.response.status_code, e.response.text[:200],
        )
        return None
    except Exception as e:
        logger.exception("API call failed: %s", e)
        return None


def _main_menu_keyboard() -> InlineKeyboardMarkup:
    """Main menu with check actions and settings."""
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("📱 Номер", callback_data="action_check_phone"),
            InlineKeyboardButton("🔐 Пароль", callback_data="action_check_password"),
        ],
        [
            InlineKeyboardButton("🔗 Ссылка", callback_data="action_check_link"),
            InlineKeyboardButton("👤 Никнейм", callback_data="action_check_username"),
        ],
        [InlineKeyboardButton("⚙️ Настройки", callback_data="action_settings")],
    ])


# --- Command: /start ---
async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if not user or not update.message:
        return
    # Handle link token: /start link_<token> (deep link via t.me/bot?start=link_XXX)
    # Prefer context.args for reliable deep link handling
    token = None
    if context.args and len(context.args) >= 1:
        payload = context.args[0]
        if payload.startswith("link_"):
            token = unquote(payload[5:]).strip()  # remove "link_" prefix
    if not token:
        msg_text = (update.message.text or "").strip()
        if msg_text.startswith("/start link_"):
            token = unquote(msg_text.replace("/start link_", "").strip())
    if token:
        logger.info("Link attempt: telegram_id=%s token_len=%d", user.id, len(token))
        result = await _call_api("link-account", "POST", {
            "token": token,
            "telegram_id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
        })
        if result and result.get("ok"):
            logger.info("Link success: telegram_id=%s", user.id)
            await update.message.reply_text(
                "✅ Аккаунт успешно привязан к CohortSec!\n\n"
                "Теперь вы будете получать важные уведомления о безопасности здесь.",
                reply_markup=_main_menu_keyboard(),
            )
        else:
            logger.warning("Link failed: telegram_id=%s result=%s", user.id, result)
            await update.message.reply_text(
                "❌ Ссылка истекла или уже использована.\n"
                "Создайте новую ссылку в разделе «Уведомления» на сайте cohortsec.",
            )
        return
    bot_user = get_or_create_user(
        telegram_id=user.id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
    )
    is_new = not bot_user.welcome_seen
    if is_new:
        update_user_preference(telegram_id=user.id, welcome_seen=True)
        text = (
            f"{WELCOME_TITLE}\n\n"
            f"{WELCOME_SLOGAN}\n\n"
            f"{WELCOME_GREETING}\n\n"
            f"{WELCOME_ABOUT}"
        )
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("📢 Официальный канал CohortSec", url=CHANNEL_URL)],
            [
                InlineKeyboardButton("📱 Номер", callback_data="action_check_phone"),
                InlineKeyboardButton("🔐 Пароль", callback_data="action_check_password"),
            ],
            [
                InlineKeyboardButton("🔗 Ссылка", callback_data="action_check_link"),
                InlineKeyboardButton("👤 Никнейм", callback_data="action_check_username"),
            ],
            [InlineKeyboardButton("⚙️ Настройки", callback_data="action_settings")],
        ])
        await update.message.reply_text(text, reply_markup=keyboard)
    else:
        text = (
            "🛡️ CohortSec\n\n"
            "Выберите действие:"
        )
        await update.message.reply_text(text, reply_markup=_main_menu_keyboard())


# --- Callback: main menu actions ---
async def callback_main_action(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user = update.effective_user
    if not user:
        return
    data = query.data or ""
    if data == "action_settings":
        bot_user = get_or_create_user(user.id, user.username, user.first_name, user.last_name)
        push = "✅" if bot_user.push_enabled else "❌"
        news = "✅" if bot_user.news_enabled else "❌"
        life = "✅" if bot_user.lifehacks_enabled else "❌"
        text = (
            "⚙️ Настройки уведомлений\n\n"
            f"Push-уведомления: {push}\n"
            f"Новости: {news}\n"
            f"Лайфхаки: {life}\n\n"
            "⚠️ Важные уведомления (подозрительная активность, взлом) отключить нельзя — это ваша безопасность."
        )
        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton(f"Push {push}", callback_data="toggle_push"),
                InlineKeyboardButton(f"Новости {news}", callback_data="toggle_news"),
            ],
            [InlineKeyboardButton(f"Лайфхаки {life}", callback_data="toggle_lifehacks")],
            [InlineKeyboardButton("◀️ Назад", callback_data="action_back")],
        ])
        with suppress(Exception):
            await query.edit_message_text(text, reply_markup=keyboard)
        return
    if data == "action_back":
        text = "🛡️ CohortSec\n\nВыберите действие:"
        with suppress(Exception):
            await query.edit_message_text(text, reply_markup=_main_menu_keyboard())
        return
    # Check actions - set state and ask for input
    if data == "action_check_phone":
        set_check_state(context, "phone")
        await query.edit_message_text("📱 Введите номер телефона для проверки (например, +79001234567):")
    elif data == "action_check_password":
        set_check_state(context, "password")
        await query.edit_message_text(
            "🔐 Введите пароль для проверки на утечки.\n"
            "⚠️ Пароль будет отправлен на наш сервер для проверки через Have I Been Pwned. "
            "Не используйте пароль, который вы нигде не меняли после ввода."
        )
    elif data == "action_check_link":
        set_check_state(context, "link")
        await query.edit_message_text("🔗 Введите ссылку для проверки:")
    elif data == "action_check_username":
        set_check_state(context, "username")
        await query.edit_message_text("👤 Введите никнейм для поиска по соцсетям:")


# --- Command: /settings ---
async def cmd_settings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if not user:
        return
    bot_user = get_or_create_user(user.id, user.username, user.first_name, user.last_name)
    push = "✅" if bot_user.push_enabled else "❌"
    news = "✅" if bot_user.news_enabled else "❌"
    life = "✅" if bot_user.lifehacks_enabled else "❌"
    text = (
        "⚙️ Настройки уведомлений\n\n"
        f"Push-уведомления: {push}\n"
        f"Новости: {news}\n"
        f"Лайфхаки: {life}\n\n"
        "⚠️ Важные уведомления (подозрительная активность, взлом) отключить нельзя — это ваша безопасность."
    )
    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton(f"Push {push}", callback_data="toggle_push"),
            InlineKeyboardButton(f"Новости {news}", callback_data="toggle_news"),
        ],
        [InlineKeyboardButton(f"Лайфхаки {life}", callback_data="toggle_lifehacks")],
        [InlineKeyboardButton("◀️ Назад", callback_data="action_back")],
    ])
    await update.message.reply_text(text, reply_markup=keyboard)


async def callback_settings(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    user = update.effective_user
    if not user:
        return
    data = query.data
    if data == "toggle_push":
        bot_user = get_or_create_user(user.id, user.username, user.first_name, user.last_name)
        update_user_preference(telegram_id=user.id, push_enabled=not bot_user.push_enabled)
    elif data == "toggle_news":
        bot_user = get_or_create_user(user.id, user.username, user.first_name, user.last_name)
        update_user_preference(telegram_id=user.id, news_enabled=not bot_user.news_enabled)
    elif data == "toggle_lifehacks":
        bot_user = get_or_create_user(user.id, user.username, user.first_name, user.last_name)
        update_user_preference(telegram_id=user.id, lifehacks_enabled=not bot_user.lifehacks_enabled)
    # Refresh settings view
    bot_user = get_or_create_user(user.id, user.username, user.first_name, user.last_name)
    push = "✅" if bot_user.push_enabled else "❌"
    news = "✅" if bot_user.news_enabled else "❌"
    life = "✅" if bot_user.lifehacks_enabled else "❌"
    text = (
        "⚙️ Настройки уведомлений\n\n"
        f"Push-уведомления: {push}\n"
        f"Новости: {news}\n"
        f"Лайфхаки: {life}\n\n"
        "⚠️ Важные уведомления отключить нельзя."
    )
    keyboard = InlineKeyboardMarkup([
        [
            InlineKeyboardButton(f"Push {push}", callback_data="toggle_push"),
            InlineKeyboardButton(f"Новости {news}", callback_data="toggle_news"),
        ],
        [InlineKeyboardButton(f"Лайфхаки {life}", callback_data="toggle_lifehacks")],
        [InlineKeyboardButton("◀️ Назад", callback_data="action_back")],
    ])
    with suppress(Exception):
        await query.edit_message_text(text, reply_markup=keyboard)


# --- Check commands (expect next message as input) ---
def set_check_state(context: ContextTypes.DEFAULT_TYPE, state: str) -> None:
    if context.user_data is None:
        context.user_data = {}
    context.user_data["check_state"] = state


def get_check_state(context: ContextTypes.DEFAULT_TYPE) -> str | None:
    return (context.user_data or {}).get("check_state")


def clear_check_state(context: ContextTypes.DEFAULT_TYPE) -> None:
    if context.user_data:
        context.user_data.pop("check_state", None)


async def cmd_check_phone(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    set_check_state(context, "phone")
    await update.message.reply_text("📱 Введите номер телефона для проверки (например, +79001234567):")


async def cmd_check_password(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    set_check_state(context, "password")
    await update.message.reply_text(
        "🔐 Введите пароль для проверки на утечки.\n"
        "⚠️ Пароль будет отправлен на наш сервер для проверки через Have I Been Pwned. "
        "Не используйте пароль, который вы нигде не меняли после ввода."
    )


async def cmd_check_link(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    set_check_state(context, "link")
    await update.message.reply_text("🔗 Введите ссылку для проверки:")


async def cmd_check_username(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    set_check_state(context, "username")
    await update.message.reply_text("👤 Введите никнейм для поиска по соцсетям:")


async def handle_check_input(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    state = get_check_state(context)
    if not state or not update.message or not update.message.text:
        return
    text = update.message.text.strip()
    if not text:
        return
    clear_check_state(context)
    await update.message.chat.send_action("typing")
    if state == "phone":
        result = await _call_api("phone", "POST", {"phone": text})
        if result:
            if result.get("valid"):
                msg = (
                    f"✅ Номер валиден\n"
                    f"Формат: {result.get('formatted', '')}\n"
                    f"Страна: {result.get('country', '')}\n"
                    f"Тип: {result.get('number_type', '')}"
                )
            else:
                msg = "❌ Номер невалиден или не распознан."
        else:
            msg = "⚠️ Сервис временно недоступен. Попробуйте позже."
        await update.message.reply_text(msg, reply_markup=_main_menu_keyboard())
    elif state == "password":
        result = await _call_api("password", "POST", {"password": text})
        if result:
            msg = result.get("message", "Проверка завершена.")
        else:
            msg = "⚠️ Сервис временно недоступен. Попробуйте позже."
        await update.message.reply_text(msg, reply_markup=_main_menu_keyboard())
    elif state == "link":
        result = await _call_api("link", "POST", {"url": text})
        if result:
            msg = result.get("message", "")
            if result.get("warnings"):
                msg += "\n\n⚠️ " + "\n".join(result["warnings"])
        else:
            msg = "⚠️ Сервис временно недоступен. Попробуйте позже."
        await update.message.reply_text(msg or "Проверка завершена.", reply_markup=_main_menu_keyboard())
    elif state == "username":
        result = await _call_api("username", "POST", {"username": text})
        if result:
            total = result.get("total", 0)
            found = result.get("found", [])
            if total == 0:
                msg = f"👤 Никнейм «{text}» не найден в проверенных соцсетях."
            else:
                lines = [f"👤 Найдено {total} аккаунтов для «{text}»:"]
                for r in found[:15]:
                    lines.append(f"• {r.get('site', '')}: {r.get('url', '')}")
                if total > 15:
                    lines.append(f"... и ещё {total - 15}")
                msg = "\n".join(lines)
        else:
            msg = "⚠️ Сервис временно недоступен. Попробуйте позже."
        await update.message.reply_text(msg, reply_markup=_main_menu_keyboard())
