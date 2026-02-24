"""Email service for fraud report notifications."""

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import get_settings


def send_fraud_report_confirmation(to_email: str, ticket_number: str, reporter_name: str) -> bool:
    """Send confirmation email to user after fraud report submission."""
    settings = get_settings()
    if not settings.smtp_host:
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"CohortSec — Ваше обращение #{ticket_number} принято"
        msg["From"] = settings.smtp_from
        msg["To"] = to_email

        text = f"""Здравствуйте, {reporter_name}!

Ваше обращение #{ticket_number} принято. Мы свяжемся с вами в течение 24 часов.

Не отправляйте мошенникам больше денег.

—
CohortSec — Ваш цифровой телохранитель"""

        html = f"""<html><body style="font-family:sans-serif;">
<p>Здравствуйте, {reporter_name}!</p>
<p>Ваше обращение <strong>#{ticket_number}</strong> принято. Мы свяжемся с вами в течение 24 часов.</p>
<p><em>Не отправляйте мошенникам больше денег.</em></p>
<p>—<br>CohortSec</p>
</body></html>"""

        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_user and settings.smtp_password:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, [to_email], msg.as_string())
        return True
    except Exception:
        return False


def send_fraud_report_admin_notification(
    ticket_number: str, reporter_name: str, reporter_email: str, description_preview: str
) -> bool:
    """Send notification to admin about new fraud report."""
    settings = get_settings()
    if not settings.smtp_host or not settings.smtp_admin_email:
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[CohortSec] Новое обращение #{ticket_number}"
        msg["From"] = settings.smtp_from
        msg["To"] = settings.smtp_admin_email

        text = f"""Новое обращение о мошенничестве:

Номер: #{ticket_number}
От: {reporter_name} <{reporter_email}>

Описание: {description_preview[:300]}...
"""

        msg.attach(MIMEText(text, "plain"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_user and settings.smtp_password:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, [settings.smtp_admin_email], msg.as_string())
        return True
    except Exception:
        return False


def send_family_invite_email(
    to_email: str,
    inviter_display_name: str,
    display_name: str | None,
    token: str,
    expires_days: int = 7,
    invite_link: str | None = None,
) -> bool:
    """Send family invitation email. If invite_link is None, built from settings.frontend_base_url."""
    settings = get_settings()
    if not settings.smtp_host:
        return False
    if not invite_link:
        invite_link = f"{settings.frontend_base_url.rstrip('/')}/app/family?invite_token={token}"
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "CohortSec — приглашение в семью"
        msg["From"] = settings.smtp_from
        msg["To"] = to_email
        text = f"""Здравствуйте!

{inviter_display_name} приглашает вас в семью CohortSec.

Перейдите по ссылке, чтобы принять приглашение (действует {expires_days} дней):
{invite_link}

—
CohortSec — Ваш цифровой телохранитель"""
        html = f"""<html><body style="font-family:sans-serif;">
<p>Здравствуйте!</p>
<p><strong>{inviter_display_name}</strong> приглашает вас в семью CohortSec.</p>
<p>Перейдите по ссылке, чтобы принять приглашение (действует {expires_days} дней):<br>
<a href="{invite_link}">{invite_link}</a></p>
<p>—<br>CohortSec</p>
</body></html>"""
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_user and settings.smtp_password:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, [to_email], msg.as_string())
        return True
    except Exception:
        return False


def send_verification_code_email(to_email: str, code: str, purpose: str = "verify_contact") -> bool:
    """Send verification code to email (for backup contacts, password recovery)."""
    settings = get_settings()
    if not settings.smtp_host:
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "CohortSec — код подтверждения"
        msg["From"] = settings.smtp_from
        msg["To"] = to_email
        text = f"""Ваш код подтверждения: {code}

Код действителен 10 минут. Никому не сообщайте этот код.

—
CohortSec"""
        html = f"""<html><body style="font-family:sans-serif;">
<p>Ваш код подтверждения: <strong>{code}</strong></p>
<p>Код действителен 10 минут. Никому не сообщайте этот код.</p>
<p>—<br>CohortSec</p>
</body></html>"""
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_user and settings.smtp_password:
                server.starttls()
                server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, [to_email], msg.as_string())
        return True
    except Exception:
        return False
