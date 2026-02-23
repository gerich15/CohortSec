import { useEffect, useState } from "react";
import { getSecurityScore } from "../api/client";

interface ActionHint {
  action: string;
  points: number;
  done: boolean;
  description: string;
}

interface SecurityScoreData {
  score: number;
  actions: ActionHint[];
}

export default function SecurityScore() {
  const [data, setData] = useState<SecurityScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSecurityScore()
      .then((r) => setData(r.data))
      .catch(() => setData({ score: 0, actions: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="security-score-card" style={styles.card}>
        <p style={styles.loading}>Загрузка уровня защиты...</p>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 45;
  const strokeDash = (data.score / 100) * circumference;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🛡️ Уровень защиты</h3>
      <div style={styles.ringWrapper}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={styles.svg}>
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={data.score >= 80 ? "var(--success)" : data.score >= 50 ? "var(--accent)" : "var(--warning)"}
            strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        </svg>
        <span style={styles.percent}>{data.score}%</span>
      </div>
      <p style={styles.hint} data-tooltip="Чем выше — тем лучше защищён твой аккаунт">
        Выполняй действия ниже, чтобы повысить уровень
      </p>
      <ul style={styles.actions}>
        {data.actions.map((a, i) => (
          <li key={i} style={styles.actionItem}>
            <span style={styles.actionIcon}>{a.done ? "✅" : "⬜"}</span>
            <div>
              <strong>{a.action}</strong>
              <span style={{ color: a.done ? "var(--success)" : "var(--text-muted)" }}>
                {a.done ? " +" : ""}{a.points}%
              </span>
            </div>
            <p style={styles.actionDesc}>{a.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--bg-card)",
    borderRadius: 16,
    border: "1px solid var(--border)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  loading: { color: "var(--text-muted)", margin: 0 },
  title: { marginTop: 0, marginBottom: "1rem", fontSize: "1.25rem" },
  ringWrapper: {
    position: "relative",
    width: 120,
    height: 120,
    margin: "0 auto 1rem",
  },
  svg: { position: "absolute", left: 0, top: 0 },
  percent: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  hint: { color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" },
  actions: { listStyle: "none", padding: 0, margin: 0 },
  actionItem: { marginBottom: "1rem" },
  actionIcon: { marginRight: "0.5rem" },
  actionDesc: { margin: "0.25rem 0 0 1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" },
};
