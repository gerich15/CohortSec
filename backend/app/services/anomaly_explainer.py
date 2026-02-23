"""Human-readable anomaly explanations for B2C users."""

from typing import Tuple


def explain_anomaly(
    is_anomaly: bool,
    score: float,
    hour: int,
    weekday: int,
    ip_address: str | None = None,
    geo_location: str | None = None,
) -> Tuple[str, str]:
    """Return human-readable (title, description) for anomaly.
    title: short message like "Кто-то пытался войти в твой аккаунт ночью"
    description: longer explanation
    """
    geo = geo_location or "неизвестном месте"
    time_str = f"{hour}:00" if hour < 10 else f"{hour}:00"
    weekday_names = [
        "понедельник", "вторник", "среда", "четверг",
        "пятница", "суббота", "воскресенье"
    ]
    day = weekday_names[weekday] if 0 <= weekday < 7 else "неизвестный день"

    if is_anomaly:
        if 0 <= hour < 6:
            title = "Кто-то пытался войти в твой аккаунт ночью"
            desc = (
                f"Мы заметили вход в {time_str} ночью в {geo}. "
                "Обычно ты заходишь днём. Это был ты? Если нет — смени пароль."
            )
        elif 22 <= hour <= 23:
            title = "Необычный вход поздно вечером"
            desc = (
                f"Вход в {time_str} в {geo}. "
                "Поздние входы выглядят подозрительно. Подтверди, что это был ты."
            )
        elif weekday >= 5:  # weekend
            title = "Вход в выходные — не похоже на тебя"
            desc = (
                f"Вход в {day} из {geo}. "
                "Обычно ты пользуешься аккаунтом в будни. Проверь, что это твой вход."
            )
        else:
            title = "Подозрительная активность"
            desc = (
                f"Вход в {time_str} ({day}) из {geo}. "
                "Система посчитала это необычным. Если это был ты — всё в порядке."
            )
    else:
        title = "Скорее всего это был ты"
        desc = (
            f"Вход в {time_str} ({day}) соответствует твоему обычному поведению. "
            "Никаких подозрений."
        )

    return title, desc
