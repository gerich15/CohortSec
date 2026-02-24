import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  Camera,
  UserPlus,
  Zap,
  CheckCircle,
  XCircle,
  LayoutDashboard,
  Activity,
  Users,
  HardDrive,
  ChevronRight,
} from "lucide-react";
import {
  getDashboard,
  getMe,
  checkSecurity,
  getAnomaliesTimeline,
  getSecurityScore,
  securityApi,
} from "../api/client";
import toast from "react-hot-toast";
import { useLocale } from "../hooks/useLocale";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressRing from "../components/ui/ProgressRing";
import SecurityScore from "../components/SecurityScore";
import FamilyDashboard from "../components/FamilyDashboard";
import SimpleBackup from "../components/SimpleBackup";
import ScrollReveal from "../components/animations/ScrollReveal";

interface DashboardData {
  active_anomalies: number;
  high_threat_count: number;
  last_backup: {
    last_run: string | null;
    objects_count: number;
    total_bytes: number;
  } | null;
  attempts_hack?: number;
  photos_safe?: number;
  passwords_ok?: boolean;
}

interface TimelineEvent {
  id: number;
  type: string;
  title: string;
  description: string;
  created_at: string;
  threat_level: string;
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-vg-accent/20 text-vg-accent">
          <Icon className="w-4 h-4" />
        </span>
        {title}
      </h2>
      {subtitle && <p className="text-sm text-vg-muted mt-1 ml-11">{subtitle}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [securityStatus, setSecurityStatus] = useState<{
    security_level: number;
    recent_events: { event_type: string; created_at: string; success: boolean }[];
  } | null>(null);

  useEffect(() => {
    getMe()
      .then((r) => setUserName(r.data.full_name || r.data.username || "Пользователь"))
      .catch(() => {});
  }, []);
  useEffect(() => {
    getDashboard().then((r) => setDashboard(r.data)).catch(() => setDashboard(null));
  }, []);
  useEffect(() => {
    getSecurityScore().then((r) => setScore(r.data.score)).catch(() => setScore(0));
  }, []);
  useEffect(() => {
    securityApi.getSecurityStatus().then((r) => setSecurityStatus(r.data)).catch(() => {});
  }, []);
  useEffect(() => {
    getAnomaliesTimeline(10)
      .then((r) => setTimeline(r.data.events || []))
      .catch(() => setTimeline([]));
  }, []);

  const handleCheckSecurity = async () => {
    setChecking(true);
    setCheckResult(null);
    try {
      const { data } = await checkSecurity();
      setCheckResult({ ok: data.ok, message: data.message });
      if (data.ok) toast.success(data.message);
      else toast(data.message, { icon: "⚠️" });
    } catch {
      toast.error("Что-то пошло не так");
    } finally {
      setChecking(false);
    }
  };

  const formatTime = (s: string) => {
    const d = new Date(s);
    const now = new Date();
    if (now.getTime() - d.getTime() < 86400000)
      return "Сегодня в " + d.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
    if (now.getTime() - d.getTime() < 172800000) return "Вчера";
    return d.toLocaleDateString("ru");
  };

  if (!dashboard)
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <p className="text-vg-muted">{t("common.loading")}</p>
      </div>
    );

  const attempts =
    dashboard.attempts_hack ?? dashboard.active_anomalies + dashboard.high_threat_count;
  const photos = dashboard.photos_safe ?? dashboard.last_backup?.objects_count ?? 0;
  const passwordsOk = dashboard.passwords_ok ?? dashboard.high_threat_count === 0;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Заголовок страницы */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-vg-muted text-sm mb-1">
              <LayoutDashboard className="w-4 h-4" />
              Обзор
            </div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-vg-accent/30 to-accentPurple/30 text-vg-accent">
                <Zap className="w-5 h-5" />
              </span>
              {t("dashboard.welcome", { name: userName })}
            </h1>
            <p className="text-vg-muted mt-1">
              Здесь всё о вашей защите: уровень, быстрые действия и последние события.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Блок: Уровень защиты + Быстрые действия */}
      <ScrollReveal>
        <Card className="p-6 md:p-8">
          <SectionHeader
            icon={Shield}
            title={t("dashboard.security_level")}
            subtitle="Проверьте статус и выполните действия одним кликом"
          />
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
            <div className="flex flex-col items-center">
              <ProgressRing value={securityStatus?.security_level ?? score} size={120} strokeWidth={8} />
              <span className="text-2xl font-bold mt-2 text-white">{securityStatus?.security_level ?? score}%</span>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => navigate("/app/security")}
              >
                Настройки безопасности
              </Button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-vg-muted">
                Быстрые действия помогут проверить безопасность, сделать бэкап или пригласить родственника.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  data-tour="check-security"
                  onClick={handleCheckSecurity}
                  disabled={checking}
                  leftIcon={<Shield className="w-4 h-4" />}
                >
                  {checking ? t("common.loading") : t("dashboard.check_security")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/app/backup")}
                  leftIcon={<Camera className="w-4 h-4" />}
                >
                  {t("dashboard.run_backup")}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/app/family")}
                  leftIcon={<UserPlus className="w-4 h-4" />}
                >
                  {t("dashboard.invite_family")}
                </Button>
              </div>
              {checkResult && (
                <div
                  className={
                    "flex items-center gap-3 p-4 rounded-xl " +
                    (checkResult.ok
                      ? "bg-vg-success/15 text-vg-success border border-vg-success/30"
                      : "bg-vg-warning/15 text-vg-warning border border-vg-warning/30")
                  }
                >
                  {checkResult.ok ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 shrink-0" />
                  )}
                  <span>{checkResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </ScrollReveal>

      {/* Статистика: 3 карточки */}
      <ScrollReveal>
        <SectionHeader
          icon={Activity}
          title="Краткая статистика"
          subtitle="Попытки взлома, сохранённые фото и статус паролей"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 text-center border-l-4 border-l-vg-accent" hover={false}>
            <Shield className="w-8 h-8 text-vg-accent mx-auto mb-2" />
            <span className="text-2xl font-bold text-white block">{attempts}</span>
            <p className="text-sm text-vg-muted">Попыток взлома отражено</p>
          </Card>
          <Card className="p-5 text-center border-l-4 border-l-vg-success" hover={false}>
            <Camera className="w-8 h-8 text-vg-success mx-auto mb-2" />
            <span className="text-2xl font-bold text-white block">{photos}</span>
            <p className="text-sm text-vg-muted">Фото в безопасности</p>
          </Card>
          <Card className="p-5 text-center border-l-4 border-l-vg-warning" hover={false}>
            {passwordsOk ? (
              <CheckCircle className="w-8 h-8 text-vg-success mx-auto mb-2" />
            ) : (
              <XCircle className="w-8 h-8 text-vg-warning mx-auto mb-2" />
            )}
            <span className="text-2xl font-bold text-white block">{passwordsOk ? "OK" : "—"}</span>
            <p className="text-sm text-vg-muted">
              {passwordsOk ? "Пароли в порядке" : "Проверьте пароли"}
            </p>
          </Card>
        </div>
      </ScrollReveal>

      {/* Уровень защиты (чек-лист) */}
      <ScrollReveal data-tour="security-score">
        <SectionHeader
          icon={Shield}
          title="Уровень защиты"
          subtitle="Выполняйте действия, чтобы повысить балл"
        />
        <Card className="p-0 overflow-hidden">
          <div className="p-6">
            <SecurityScore />
          </div>
        </Card>
      </ScrollReveal>

      {/* Семья и Бэкап — две колонки на больших экранах */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ScrollReveal data-tour="family">
          <SectionHeader
            icon={Users}
            title={t("dashboard.family")}
            subtitle="До 5 родственников под одной подпиской"
          />
          <Card className="p-6">
            <FamilyDashboard />
          </Card>
        </ScrollReveal>
        <ScrollReveal data-tour="backup">
          <SectionHeader
            icon={HardDrive}
            title="Резервные копии"
            subtitle="Фото, контакты и документы в облаке"
          />
          <Card className="p-6">
            <SimpleBackup />
          </Card>
        </ScrollReveal>
      </div>

      {/* Последние события */}
      <ScrollReveal>
        <SectionHeader
          icon={Activity}
          title={t("dashboard.recent_events")}
          subtitle="Недавние события по безопасности"
        />
        <Card className="p-6">
          {timeline.length === 0 ? (
            <p className="text-vg-muted py-4">{t("dashboard.no_events")}</p>
          ) : (
            <div className="space-y-3">
              {timeline.slice(0, 5).map((e) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={
                    "p-4 rounded-xl border-l-4 " +
                    (e.threat_level === "High"
                      ? "border-vg-danger bg-vg-danger/5"
                      : e.threat_level === "Medium"
                        ? "border-vg-warning bg-vg-warning/5"
                        : "border-vg-accent/30 bg-vg-surface/50")
                  }
                >
                  <strong className="text-white">{e.title}</strong>
                  <p className="text-sm text-vg-muted mt-1">{e.description}</p>
                  <span className="text-xs text-vg-muted">{formatTime(e.created_at)}</span>
                </motion.div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app/events")}
                className="mt-2"
                leftIcon={<ChevronRight className="w-4 h-4" />}
              >
                {t("dashboard.view_all")}
              </Button>
            </div>
          )}
        </Card>
      </ScrollReveal>
    </div>
  );
}
