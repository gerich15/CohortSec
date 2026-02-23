import { useEffect, useState } from "react";
import {
  getBackupConfigs,
  createBackupConfig,
  triggerBackup,
  getBackupLogs,
} from "../api/client";

interface BackupConfig {
  id: number;
  name: string;
  endpoint: string;
  bucket: string;
  prefix: string | null;
  schedule_cron: string;
  is_active: number;
}

interface BackupLog {
  id: number;
  config_id: number;
  status: string;
  objects_count: number;
  total_size_bytes: number;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
}

export default function BackupManager() {
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    endpoint: "",
    access_key: "",
    secret_key: "",
    bucket: "",
    prefix: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getBackupConfigs()
      .then((r) => setConfigs(r.data))
      .catch(console.error);
    getBackupLogs()
      .then((r) => setLogs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBackupConfig({
        ...form,
        prefix: form.prefix || undefined,
      });
      setShowForm(false);
      setForm({ name: "", endpoint: "", access_key: "", secret_key: "", bucket: "", prefix: "" });
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrigger = (config_id: number) => {
    triggerBackup(config_id)
      .then(() => load())
      .catch(console.error);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginTop: 0 }}>Управление резервным копированием</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.5rem 1rem",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          {showForm ? "Отмена" : "+ Добавить S3 источник"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "var(--bg-card)",
            padding: "1.5rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Добавить внешний S3</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <input
              placeholder="Название"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={{
                padding: "0.5rem",
                background: "var(--bg-dark)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
              }}
            />
            <input
              placeholder="Endpoint (хост:порт)"
              value={form.endpoint}
              onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
              required
              style={{
                padding: "0.5rem",
                background: "var(--bg-dark)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
              }}
            />
            <input
              placeholder="Access Key"
              value={form.access_key}
              onChange={(e) => setForm({ ...form, access_key: e.target.value })}
              required
              style={{
                padding: "0.5rem",
                background: "var(--bg-dark)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
              }}
            />
            <input
              type="password"
              placeholder="Secret Key"
              value={form.secret_key}
              onChange={(e) => setForm({ ...form, secret_key: e.target.value })}
              required
              style={{
                padding: "0.5rem",
                background: "var(--bg-dark)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
              }}
            />
            <input
              placeholder="Контейнер (bucket)"
              value={form.bucket}
              onChange={(e) => setForm({ ...form, bucket: e.target.value })}
              required
              style={{
                padding: "0.5rem",
                background: "var(--bg-dark)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
              }}
            />
            <input
              placeholder="Префикс (необяз.)"
              value={form.prefix}
              onChange={(e) => setForm({ ...form, prefix: e.target.value })}
              style={{
                padding: "0.5rem",
                background: "var(--bg-dark)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                color: "var(--text)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "var(--success)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Создание..." : "Создать"}
          </button>
        </form>
      )}

      <div
        style={{
          background: "var(--bg-card)",
          padding: "1.5rem",
          borderRadius: 8,
          border: "1px solid var(--border)",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Источники S3</h3>
        {configs.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Нет настроек резервного копирования. Добавьте источник выше.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {configs.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  background: "var(--bg-dark)",
                  borderRadius: 6,
                }}
              >
                <div>
                  <strong>{c.name}</strong> — {c.endpoint} / {c.bucket}
                </div>
                <button
                  onClick={() => handleTrigger(c.id)}
                  style={{
                    padding: "0.35rem 0.75rem",
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Запустить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: "var(--bg-card)",
          padding: "1.5rem",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Журнал резервного копирования</h3>
        {logs.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Резервные копии ещё не выполнялись.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Конфиг</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Статус</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Объектов</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Размер</th>
                <th style={{ textAlign: "left", padding: "0.5rem" }}>Завершено</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "0.5rem" }}>{log.config_id}</td>
                  <td
                    style={{
                      padding: "0.5rem",
                      color:
                        log.status === "success"
                          ? "var(--success)"
                          : log.status === "failed"
                          ? "var(--danger)"
                          : "var(--warning)",
                    }}
                  >
                    {log.status === "success" ? "Успешно" : log.status === "failed" ? "Ошибка" : log.status === "running" ? "Выполняется" : log.status}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{log.objects_count}</td>
                  <td style={{ padding: "0.5rem" }}>{formatBytes(log.total_size_bytes)}</td>
                  <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>
                    {log.finished_at
                      ? new Date(log.finished_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
