import { useEffect, useState } from "react";
import { getFamilyMembers, inviteFamilyMember } from "../api/client";
import toast from "react-hot-toast";

interface FamilyMember {
  id: number;
  user_id: number;
  display_name: string;
  role: string;
  email?: string;
}

export default function FamilyDashboard() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getFamilyMembers()
      .then((r) => setMembers(r.data))
      .catch(() => {
        setMembers([]);
        toast.error("Не удалось загрузить семью");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inviteFamilyMember({ email, display_name: displayName || undefined });
      toast.success("Приглашение отправлено на " + email);
      setShowInvite(false);
      setEmail("");
      setDisplayName("");
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Что-то пошло не так");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: "var(--text-muted)" }}>Загрузка...</p>;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Моя семья</h3>
      <p style={styles.hint}>Добавь родственников — до 5 человек. Приглашение уйдет на почту.</p>
      <div style={styles.grid}>
        {members.map((m) => (
          <div key={m.id} style={styles.memberCard}>
            <div style={styles.avatar}>{m.display_name?.charAt(0)?.toUpperCase() || "?"}</div>
            <strong>{m.display_name || "Пользователь"}</strong>
            <span style={styles.role}>{m.email || "Участник"}</span>
          </div>
        ))}
        {members.length < 5 && (
          <button type="button" style={styles.addBtn} onClick={() => setShowInvite(true)}>
            + Добавить родственника
          </button>
        )}
      </div>
      {showInvite && (
        <form onSubmit={handleInvite} style={styles.form}>
          <input
            type="email"
            placeholder="Email родственника"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Как называть (Мама, Папа)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={styles.input}
          />
          <div style={styles.formBtns}>
            <button type="submit" disabled={submitting} style={styles.submitBtn}>
              {submitting ? "Отправка..." : "Отправить приглашение"}
            </button>
            <button type="button" onClick={() => setShowInvite(false)} style={styles.cancelBtn}>
              Отмена
            </button>
          </div>
        </form>
      )}
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
  title: { marginTop: 0, marginBottom: "0.5rem", fontSize: "1.25rem" },
  hint: { color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "1rem",
  },
  memberCard: {
    background: "var(--bg-dark)",
    borderRadius: 12,
    padding: "1rem",
    textAlign: "center",
    border: "1px solid var(--border)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "var(--accent)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 0.5rem",
    fontSize: "1.25rem",
  },
  role: { display: "block", fontSize: "0.8rem", color: "var(--text-muted)" },
  addBtn: {
    background: "rgba(34, 197, 94, 0.15)",
    border: "1px dashed var(--success)",
    color: "var(--success)",
    padding: "1rem",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: "1rem",
  },
  form: { marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "0.5rem",
    background: "var(--bg-dark)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text)",
  },
  formBtns: { display: "flex", gap: "0.5rem", marginTop: "0.5rem" },
  submitBtn: {
    padding: "0.75rem 1rem",
    background: "var(--success)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "0.75rem 1rem",
    background: "transparent",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    cursor: "pointer",
  },
};
