import { useState, useEffect } from "react";
import { Bell, ExternalLink, Check } from "lucide-react";
import { useLocale } from "../hooks/useLocale";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";
import {
  createTelegramLinkToken,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendTestNotification,
} from "../api/client";

type Prefs = {
  telegram_linked: boolean;
  push_enabled: boolean;
  news_enabled: boolean;
  lifehacks_enabled: boolean;
  is_subscribed: boolean;
  bot_link?: string;
};

export default function Notifications() {
  const { t } = useLocale();
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadPrefs = async () => {
    try {
      const { data } = await getNotificationPreferences();
      setPrefs(data);
    } catch (e: unknown) {
      setError("Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrefs();
  }, []);

  const handleGetLink = async () => {
    setLinkLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await createTelegramLinkToken();
      setLinkUrl(data.bot_link);
      setSuccess("Ссылка создана. Откройте её в Telegram в течение 5 минут.");
    } catch (e: unknown) {
      setError("Не удалось создать ссылку");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleTest = async () => {
    setTestLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await sendTestNotification();
      setSuccess(t("notifications.test_sent"));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof msg === "string" ? msg : "Не удалось отправить тест");
    } finally {
      setTestLoading(false);
    }
  };

  const handleToggle = async (key: keyof Prefs, value: boolean) => {
    if (!prefs?.telegram_linked) return;
    setError(null);
    try {
      const { data } = await updateNotificationPreferences({ [key]: value });
      setPrefs(data);
    } catch (e: unknown) {
      setError("Не удалось сохранить");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-vg-muted">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <ScrollReveal>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-7 h-7 text-vg-accent" />
          {t("notifications.title")}
        </h1>
      </ScrollReveal>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300">
          {success}
        </div>
      )}

      <ScrollReveal>
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-vg-accent/20 flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-vg-accent" />
            </div>
            <div>
              <h3 className="font-semibold">
                {prefs?.telegram_linked ? t("notifications.telegram_connected") : t("notifications.telegram_connect")}
              </h3>
              <p className="text-sm text-vg-muted">{t("notifications.telegram_connect_hint")}</p>
            </div>
          </div>
          {prefs?.telegram_linked ? (
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={handleTest} disabled={testLoading}>
                {testLoading ? t("common.loading") : t("notifications.test_notification")}
              </Button>
              <a
                href={prefs.bot_link || "https://t.me/cohortsec_bot"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-vg-surface border border-white/10 hover:border-vg-accent/50 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {t("notifications.open_bot")}
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <Button onClick={handleGetLink} disabled={linkLoading}>
                {linkLoading ? t("common.loading") : t("notifications.connect_btn")}
              </Button>
              {linkUrl && (
                <div className="p-4 bg-vg-surface rounded-lg border border-white/10">
                  <p className="text-sm text-vg-muted mb-2">Откройте эту ссылку в Telegram:</p>
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vg-accent hover:underline break-all"
                  >
                    {linkUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </Card>
      </ScrollReveal>

      {prefs?.telegram_linked && (
        <ScrollReveal>
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-vg-accent" />
              Настройки уведомлений
            </h3>
            <p className="text-sm text-vg-muted mb-4">{t("notifications.important_note")}</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t("notifications.subscribe")}</span>
                <button
                  onClick={() => handleToggle("is_subscribed", !prefs.is_subscribed)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${prefs.is_subscribed ? "bg-vg-accent" : "bg-vg-surface"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefs.is_subscribed ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.push")}</span>
                <button
                  onClick={() => handleToggle("push_enabled", !prefs.push_enabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${prefs.push_enabled ? "bg-vg-accent" : "bg-vg-surface"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefs.push_enabled ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.news")}</span>
                <button
                  onClick={() => handleToggle("news_enabled", !prefs.news_enabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${prefs.news_enabled ? "bg-vg-accent" : "bg-vg-surface"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefs.news_enabled ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>{t("notifications.lifehacks")}</span>
                <button
                  onClick={() => handleToggle("lifehacks_enabled", !prefs.lifehacks_enabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${prefs.lifehacks_enabled ? "bg-vg-accent" : "bg-vg-surface"}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prefs.lifehacks_enabled ? "left-7" : "left-1"}`}
                  />
                </button>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      )}
    </div>
  );
}
