import { useEffect, useState } from "react";
import {
  getSimpleBackupStatus,
  triggerSimpleBackup,
  updateSimpleBackupPreferences,
} from "../api/client";
import toast from "react-hot-toast";

interface SimpleBackupStatus {
  last_backup: string | null;
  last_backup_human: string;
  objects_count: number;
  total_bytes: number;
  cloud_connected: boolean;
}

export default function SimpleBackup() {
  const [status, setStatus] = useState<SimpleBackupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [photos, setPhotos] = useState(true);
  const [contacts, setContacts] = useState(true);
  const [documents, setDocuments] = useState(false);

  const load = () => {
    getSimpleBackupStatus()
      .then((r) => setStatus(r.data))
      .catch(() => {
        setStatus({
          last_backup: null,
          last_backup_human: "никогда",
          objects_count: 0,
          total_bytes: 0,
          cloud_connected: false,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleBackup = async () => {
    setRunning(true);
    try {
      await triggerSimpleBackup({
        backup_photos: photos,
        backup_contacts: contacts,
        backup_documents: documents,
      });
      toast.success("Резервная копия запущена");
      load();
    } catch {
      toast.error("Что-то пошло не так. Подключи облако в разделе «Резервные копии».");
    } finally {
      setRunning(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " Б";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " КБ";
    return (bytes / (1024 * 1024)).toFixed(1) + " МБ";
  };

  if (loading || !status) {
    return (
      <div style={styles.card}>
        <p style={styles.loading}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>📸 Сохранить всё важное</h3>
      <p style={styles.hint} data-tooltip="Фото, контакты и документы будут сохранены в твоё облако">
        Выбери, что бэкапить, и нажми кнопку
      </p>

      <div style={styles.checkboxes}>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={photos}
            onChange={(e) => setPhotos(e.target.checked)}
          />
          <span>Фото</span>
        </label>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={contacts}
            onChange={(e) => setContacts(e.target.checked)}
          />
          <span>Контакты</span>
        </label>
        <label style={styles.label}>
          <input
            type="checkbox"
            checked={documents}
            onChange={(e) => setDocuments(e.target.checked)}
          />
          <span>Документы</span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleBackup}
        disabled={running}
        style={styles.backupBtn}
        data-tooltip="Запустит копирование в облако"
      >
        {running ? "Выполняется..." : "Сделать бэкап сейчас"}
      </button>

      <p style={styles.status}>
        Резервная копия: <strong>{status.last_backup_human}</strong>
        {status.objects_count > 0 && (
          <span> — {status.objects_count} файлов, {formatBytes(status.total_bytes)}</span>
        )}
      </p>

      {!status.cloud_connected && (
        <p style={styles.warning}>
          Подключи облако (Яндекс.Диск или Google) в разделе «Резервные копии», чтобы бэкап работал.
        </p>
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
  loading: { color: "var(--text-muted)", margin: 0 },
  title: { marginTop: 0, marginBottom: "0.5rem", fontSize: "1.25rem" },
  hint: { color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" },
  checkboxes: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "1rem",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },
  backupBtn: {
    width: "100%",
    padding: "1rem 1.5rem",
    background: "var(--success)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: "1.1rem",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "1rem",
  },
  status: { color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 },
  warning: {
    marginTop: "0.5rem",
    padding: "0.5rem",
    background: "rgba(245, 158, 11, 0.15)",
    borderRadius: 8,
    color: "var(--warning)",
    fontSize: "0.85rem",
  },
};
