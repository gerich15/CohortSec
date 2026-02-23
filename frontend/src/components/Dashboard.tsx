import { useEffect, useState } from "react";
import { getDashboard, checkSecurity, getAnomaliesTimeline } from "../api/client";
import toast from "react-hot-toast";
import SecurityScore from "./SecurityScore";
import FamilyDashboard from "./FamilyDashboard";
import SimpleBackup from "./SimpleBackup";

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

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    getDashboard()
      .then((r) => setDashboard(r.data))
      .catch(() => setDashboard(null));
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
      toast.error("Что-то пошло не так, но мы уже чиним");
    } finally {
      setChecking(false);
    }
  };

  if (!dashboard) return <p style={{ color: "var(--text-muted)" }}>Загрузка...</p>;

  const attempts = dashboard.attempts_hack ?? dashboard.active_anomalies + dashboard.high_threat_count;
  const photos = dashboard.photos_safe ?? dashboard.last_backup?.objects_count ?? 0;
  const passwordsOk = dashboard.passwords_ok ?? dashboard.high_threat_count === 0;

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>Твой цифровой телохранитель</h1>

      <button
        data-tour="check-security"
        onClick={handleCheckSecurity}
        disabled={checking}
        style={styles.panicBtn}
      >
        {checking ? "Проверяю..." : "🔒 Проверить безопасность"}
      </button>

      {checkResult && (
        <div
          style={{
            ...styles.result,
            background: checkResult.ok ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
            color: checkResult.ok ? "var(--success)" : "var(--warning)",
          }}
        >
          {checkResult.message}
        </div>
      )}

      <div style={styles.tiles}>
        <div style={styles.tile}>
          <span style={styles.tileIcon}>🔒</span>
          <span style={styles.tileValue}>{attempts}</span>
          <span style={styles.tileLabel}>Попыток взлома</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileIcon}>📸</span>
          <span style={styles.tileValue}>{photos}</span>
          <span style={styles.tileLabel}>Фото в безопасности</span>
        </div>
        <div style={styles.tile}>
          <span style={styles.tileIcon}>{passwordsOk ? "✅" : "⚠️"}</span>
          <span style={styles.tileValue}>{passwordsOk ? "OK" : "—"}</span>
          <span style={styles.tileLabel}>{passwordsOk ? "Пароли в порядке" : "Проверь пароли"}</span>
        </div>
      </div>

      <div data-tour="security-score">
        <SecurityScore />
      </div>

      <div data-tour="family">
        <FamilyDashboard />
      </div>

      <div data-tour="backup">
        <SimpleBackup />
      </div>

      <div style={styles.timeline}>
        <h3 style={styles.timelineTitle}>Последние события</h3>
        {timeline.length === 0 ? (
          <p style={styles.empty}>Пока нет событий</p>
        ) : (
          timeline.map((e) => (
            <div
              key={e.id}
              style={{
                ...styles.event,
                borderLeftColor:
                  e.threat_level === "High"
                    ? "var(--danger)"
                    : e.threat_level === "Medium"
                    ? "var(--warning)"
                    : "var(--border)",
              }}
            >
              <strong>{e.title}</strong>
              <p style={styles.eventDesc}>{e.description}</p>
              <span style={styles.eventTime}>
                {new Date(e.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: "0 auto" },
  h1: { marginTop: 0, marginBottom: "1.5rem", fontSize: "1.5rem" },
  panicBtn: {
    width: "100%",
    padding: "1rem 1.5rem",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: "1.1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "1rem",
  },
  result: {
    padding: "1rem",
    borderRadius: 12,
    marginBottom: "1rem",
  },
  tiles: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  tile: {
    background: "var(--bg-card)",
    borderRadius: 12,
    padding: "1rem",
    textAlign: "center",
    border: "1px solid var(--border)",
  },
  tileIcon: { fontSize: "1.5rem", display: "block", marginBottom: "0.5rem" },
  tileValue: { fontSize: "1.5rem", fontWeight: 700, display: "block" },
  tileLabel: { fontSize: "0.8rem", color: "var(--text-muted)" },
  timeline: {
    background: "var(--bg-card)",
    borderRadius: 16,
    border: "1px solid var(--border)",
    padding: "1.5rem",
    marginTop: "1.5rem",
  },
  timelineTitle: { marginTop: 0, marginBottom: "1rem" },
  empty: { color: "var(--text-muted)", margin: 0 },
  event: {
    padding: "1rem",
    marginBottom: "0.5rem",
    background: "var(--bg-dark)",
    borderRadius: 8,
    borderLeft: "4px solid var(--border)",
  },
  eventDesc: { margin: "0.5rem 0", fontSize: "0.9rem", color: "var(--text-muted)" },
  eventTime: { fontSize: "0.8rem", color: "var(--text-muted)" },
};
