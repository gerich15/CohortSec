#!/usr/bin/env python3
"""Run CohortSec Telegram Bot."""

import logging
import os
import sys
from pathlib import Path

# Load .env from project root (parent of backend)
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(env_path)

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from telegram.ext import Application, CallbackQueryHandler, CommandHandler, MessageHandler, filters

from app.core.config import get_settings
from telegram_bot.handlers import (
    callback_main_action,
    callback_settings,
    cmd_check_link,
    cmd_check_password,
    cmd_check_phone,
    cmd_check_username,
    cmd_settings,
    cmd_start,
    handle_check_input,
)

logging.basicConfig(
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


def main() -> None:
    settings = get_settings()
    token = settings.telegram_bot_token
    if not token:
        logger.error("TELEGRAM_BOT_TOKEN is not set. Bot cannot start.")
        sys.exit(1)

    app = Application.builder().token(token).build()

    # Commands
    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("settings", cmd_settings))
    app.add_handler(CommandHandler("check_phone", cmd_check_phone))
    app.add_handler(CommandHandler("check_password", cmd_check_password))
    app.add_handler(CommandHandler("check_link", cmd_check_link))
    app.add_handler(CommandHandler("check_username", cmd_check_username))

    # Callbacks (main menu + settings toggles)
    app.add_handler(CallbackQueryHandler(callback_main_action, pattern="^action_"))
    app.add_handler(CallbackQueryHandler(callback_settings, pattern="^toggle_"))

    # Text input for check flows
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_check_input))

    logger.info("Starting CohortSec Telegram Bot...")
    app.run_polling(allowed_updates=["message", "callback_query"])


if __name__ == "__main__":
    main()
