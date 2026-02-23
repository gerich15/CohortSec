import { useState, useEffect } from "react";
import {
  HardDrive,
  Cloud,
  Plus,
  FolderOpen,
  Shield,
  FileCheck,
  Server,
  BookOpen,
} from "lucide-react";
import {
  getBackupConfigs,
  createBackupConfig,
  triggerBackup,
  getBackupLogs,
  getSimpleBackupStatus,
  triggerSimpleBackup,
} from "../api/client";
import toast from "react-hot-toast";
import { useLocale } from "../hooks/useLocale";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";

interface BackupConfig {
  id: number;
  name: string;
  endpoint: string;
  bucket: string;
  prefix: string | null;
}
interface BackupLog {
  id: number;
  config_id: number;
  status: string;
  total_size_bytes: number;
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-white">{children}</span>
      {hint && <span className="block text-xs text-vg-muted mt-0.5">{hint}</span>}
    </label>
  );
}

export default function Backup() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<"simple" | "cloud">("simple");
  const [configs, setConfigs] = useState<BackupConfig[]>([]);
  const [logs, setLogs] = useState<BackupLog[]>([]);
  const [simpleStatus, setSimpleStatus] = useState<{
    last_backup_human: string;
    cloud_connected: boolean;
  } | null>(null);
  const [photos, setPhotos] = useState(true);
  const [contacts, setContacts] = useState(true);
  const [documents, setDocuments] = useState(false);
  const [running, setRunning] = useState(false);
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
  const [loading, setLoading] = useState(true);

  const load = () => {
    getBackupConfigs().then((r) => setConfigs(r.data)).catch(() => setConfigs([]));
    getBackupLogs().then((r) => setLogs(r.data)).catch(() => setLogs([]));
    getSimpleBackupStatus()
      .then((r) =>
        setSimpleStatus({
          last_backup_human: r.data.last_backup_human,
          cloud_connected: r.data.cloud_connected,
        })
      )
      .catch(() => setSimpleStatus(null))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
  }, []);

  const handleSimpleBackup = async () => {
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
      toast.error("Подключи облако");
    } finally {
      setRunning(false);
    }
  };

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createBackupConfig({ ...form, prefix: form.prefix || undefined });
      setShowForm(false);
      setForm({
        name: "",
        endpoint: "",
        access_key: "",
        secret_key: "",
        bucket: "",
        prefix: "",
      });
      load();
      toast.success("Облако подключено");
    } catch {
      toast.error("Ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrigger = (id: number) => {
    triggerBackup(id).then(() => {
      load();
      toast.success("Бэкап запущен");
    }).catch(() => toast.error("Ошибка"));
  };

  const formatBytes = (b: number) =>
    b < 1024
      ? b + " Б"
      : b < 1024 * 1024
        ? (b / 1024).toFixed(1) + " КБ"
        : (b / (1024 * 1024)).toFixed(1) + " МБ";

  if (loading)
    return (
      <div className="flex justify-center min-h-[200px] items-center">
        <p className="text-vg-muted">{t("common.loading")}</p>
      </div>
    );

  return (
    <div className="space-y-8 max-w-4xl">
      <ScrollReveal>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HardDrive className="w-7 h-7 text-vg-accent" />
          Резервное копирование
        </h1>
        <p className="text-vg-muted mt-1 text-sm">
          Простой бэкап — одна кнопка. Облачные хранилища — подключите своё S3-совместимое облако.
        </p>
      </ScrollReveal>

      {/* Табы и основной контент */}
      <ScrollReveal>
        <div className="flex gap-2 border-b border-white/10">
          <button
            onClick={() => setActiveTab("simple")}
            className={
              "px-4 py-2 rounded-t-lg font-medium " +
              (activeTab === "simple"
                ? "bg-vg-accent/20 text-vg-accent border-b-2 border-vg-accent"
                : "text-vg-muted hover:text-vg-text")
            }
          >
            {t("backup.simple")}
          </button>
          <button
            onClick={() => setActiveTab("cloud")}
            className={
              "px-4 py-2 rounded-t-lg font-medium " +
              (activeTab === "cloud"
                ? "bg-vg-accent/20 text-vg-accent border-b-2 border-vg-accent"
                : "text-vg-muted hover:text-vg-text")
            }
          >
            {t("backup.advanced")}
          </button>
        </div>
      </ScrollReveal>

      {activeTab === "simple" && (
        <ScrollReveal>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-vg-accent" />
              {t("backup.simple")}
            </h3>
            <p className="text-sm text-vg-muted mb-4">
              Отметьте, что копировать. Для работы нужен хотя бы один подключённый облачный контейнер во вкладке «Облачные хранилища».
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={photos}
                  onChange={(e) => setPhotos(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span>{t("backup.photos")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contacts}
                  onChange={(e) => setContacts(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span>{t("backup.contacts")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={documents}
                  onChange={(e) => setDocuments(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span>{t("backup.documents")}</span>
              </label>
            </div>
            <Button
              onClick={handleSimpleBackup}
              disabled={running}
              className="w-full mb-4"
              size="lg"
            >
              {running ? t("common.loading") : t("backup.run_now")}
            </Button>
            <p className="text-sm text-vg-muted">
              {t("backup.last_backup")}: <strong>{simpleStatus?.last_backup_human || t("backup.never")}</strong>
            </p>
            {simpleStatus && !simpleStatus.cloud_connected && (
              <p className="text-sm text-vg-warning mt-2">{t("backup.cloud_hint")}</p>
            )}
          </Card>
        </ScrollReveal>
      )}

      {activeTab === "cloud" && (
        <>
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-vg-accent" />
                  {t("backup.advanced")}
                </h3>
                <p className="text-sm text-vg-muted mt-1">
                  Подключите S3-совместимое хранилище (Яндекс Облако, MinIO, Amazon S3 и т.п.) — один раз, дальше бэкап запускается одной кнопкой.
                </p>
              </div>
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowForm(!showForm)}
              >
                {t("backup.connect_cloud")}
              </Button>
            </div>
          </ScrollReveal>

          {showForm && (
            <ScrollReveal>
              <Card className="p-6">
                <h4 className="font-semibold text-white mb-4">Новое подключение</h4>
                <form onSubmit={handleCreateConfig} className="space-y-5">
                  <div className="space-y-2">
                    <FieldLabel hint="Как вы хотите назвать это хранилище (например: Яндекс Облако)">
                      Название
                    </FieldLabel>
                    <input
                      placeholder="Например: Мой бэкап"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white placeholder:text-vg-muted focus:border-vg-accent focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel hint="Адрес сервера S3: host или host:port (например storage.yandexcloud.net или s3.amazonaws.com)">
                        Endpoint
                      </FieldLabel>
                      <input
                        placeholder="storage.yandexcloud.net"
                        value={form.endpoint}
                        onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white placeholder:text-vg-muted focus:border-vg-accent focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel hint="Имя контейнера (bucket), куда будут сохраняться файлы">
                        Bucket
                      </FieldLabel>
                      <input
                        placeholder="my-backup-bucket"
                        value={form.bucket}
                        onChange={(e) => setForm({ ...form, bucket: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white placeholder:text-vg-muted focus:border-vg-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <FieldLabel hint="Идентификатор доступа (из настроек облака)">
                        Access Key
                      </FieldLabel>
                      <input
                        placeholder="Access Key"
                        value={form.access_key}
                        onChange={(e) => setForm({ ...form, access_key: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white placeholder:text-vg-muted focus:border-vg-accent focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel hint="Секретный ключ (хранится только у вас)">
                        Secret Key
                      </FieldLabel>
                      <input
                        type="password"
                        placeholder="Secret Key"
                        value={form.secret_key}
                        onChange={(e) => setForm({ ...form, secret_key: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white placeholder:text-vg-muted focus:border-vg-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel hint="Необязательно. Папка внутри bucket (например backup/2024)">
                      Префикс (папка)
                    </FieldLabel>
                    <input
                      placeholder="Оставьте пустым или укажите папку"
                      value={form.prefix}
                      onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                      className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white placeholder:text-vg-muted focus:border-vg-accent focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" loading={submitting}>
                      Подключить
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setShowForm(false)}
                    >
                      {t("common.cancel")}
                    </Button>
                  </div>
                </form>
              </Card>
            </ScrollReveal>
          )}

          <ScrollReveal>
            <Card className="p-6">
              {configs.length === 0 ? (
                <div className="text-center py-8">
                  <Cloud className="w-12 h-12 text-vg-muted mx-auto mb-3 opacity-60" />
                  <p className="text-vg-muted mb-1">Нет подключенных облаков</p>
                  <p className="text-sm text-vg-muted mb-4">
                    Нажмите «Подключить облако» выше и заполните данные хранилища. Подробная инструкция — в блоке ниже.
                  </p>
                  <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowForm(true)}>
                    {t("backup.connect_cloud")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {configs.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap justify-between items-center gap-3 p-4 bg-vg-surface/50 rounded-xl border border-white/5"
                    >
                      <div>
                        <strong className="text-white">{c.name}</strong>
                        <p className="text-sm text-vg-muted mt-0.5">
                          {c.endpoint} → {c.bucket}
                          {c.prefix ? ` / ${c.prefix}` : ""}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => handleTrigger(c.id)}>
                        Запустить бэкап
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </ScrollReveal>

          {logs.length > 0 && (
            <ScrollReveal>
              <Card className="p-6">
                <h4 className="font-semibold mb-4 text-white">Журнал копирований</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-vg-muted font-medium">Конфиг</th>
                        <th className="text-left py-2 text-vg-muted font-medium">Статус</th>
                        <th className="text-left py-2 text-vg-muted font-medium">Размер</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 10).map((log) => (
                        <tr key={log.id} className="border-b border-white/5">
                          <td className="py-2">{log.config_id}</td>
                          <td
                            className={
                              "py-2 " +
                              (log.status === "success"
                                ? "text-vg-success"
                                : log.status === "failed"
                                  ? "text-vg-danger"
                                  : "text-vg-warning")
                            }
                          >
                            {log.status === "success"
                              ? "Успешно"
                              : log.status === "failed"
                                ? "Ошибка"
                                : log.status}
                          </td>
                          <td className="py-2 text-vg-muted">{formatBytes(log.total_size_bytes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </ScrollReveal>
          )}
        </>
      )}

      {/* ————— Инструкции снизу ————— */}
      <ScrollReveal>
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mt-10 pt-6 border-t border-white/10">
          <BookOpen className="w-5 h-5 text-vg-accent" />
          Справка и инструкции
        </h2>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6 md:p-8 overflow-hidden" hover={false}>
          <div className="flex items-start gap-3 mb-4">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-vg-accent/20 text-vg-accent shrink-0">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-white">Что такое бэкап и зачем он нужен</h3>
              <p className="text-sm text-vg-muted mt-1">
                Резервная копия — это сохранённая копия ваших данных (фото, контакты, документы) в облаке. Если устройство потеряется, сломается или будет взломан, данные можно восстановить из бэкапа. На сервисе CohortSec копирование идёт в ваше облако; данные шифруются перед отправкой.
              </p>
            </div>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6 md:p-8 overflow-hidden" hover={false}>
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-vg-accent" />
            Как сделать бэкап по шагам
          </h3>
          <ol className="space-y-3">
            <li className="flex gap-3 items-start">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-vg-accent/20 text-vg-accent font-semibold text-sm shrink-0">1</span>
              <div>
                <strong className="text-white">Подключите облако</strong> — вкладка «Облачные хранилища», кнопка «Подключить облако», введите endpoint, ключи и bucket (см. инструкцию ниже).
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-vg-accent/20 text-vg-accent font-semibold text-sm shrink-0">2</span>
              <div>
                <strong className="text-white">Выберите, что копировать</strong> — на вкладке «Простой бэкап» отметьте фото, контакты, документы.
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-vg-accent/20 text-vg-accent font-semibold text-sm shrink-0">3</span>
              <div>
                <strong className="text-white">Нажмите «Создать резервную копию»</strong> — дождитесь окончания (статус в журнале на вкладке облаков).
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-vg-accent/20 text-vg-accent font-semibold text-sm shrink-0">4</span>
              <div>
                <strong className="text-white">Проверьте результат</strong> — дата последней копии и количество объектов отображаются на странице. Рекомендуем делать бэкап регулярно.
              </div>
            </li>
          </ol>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6 md:p-8 overflow-hidden" hover={false}>
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-vg-accent" />
            Как подключить облако: кратко
          </h3>
          <p className="text-sm text-vg-muted mb-4">
            Нужно S3-совместимое хранилище. Укажите endpoint (адрес сервера), bucket (имя контейнера) и ключи доступа (Access Key и Secret Key). Где взять данные:
          </p>
          <ul className="space-y-3 text-sm text-vg-muted">
            <li className="flex gap-2">
              <span className="text-vg-accent shrink-0">•</span>
              <span>
                <strong className="text-white">Яндекс Облако</strong> — в консоли: Object Storage → бакет → «Создать ключ» для сервисного аккаунта. Endpoint: <code className="bg-vg-surface px-1 rounded">storage.yandexcloud.net</code>, bucket — имя бакета.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-vg-accent shrink-0">•</span>
              <span>
                <strong className="text-white">Amazon S3</strong> — в AWS IAM создайте пользователя с доступом к S3, получите Access Key и Secret Key. Endpoint: <code className="bg-vg-surface px-1 rounded">s3.amazonaws.com</code> (или региональный, например <code className="bg-vg-surface px-1 rounded">s3.eu-central-1.amazonaws.com</code>), bucket — имя созданного бакета.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-vg-accent shrink-0">•</span>
              <span>
                <strong className="text-white">MinIO / другой S3-совместимый сервис</strong> — укажите адрес сервера (например <code className="bg-vg-surface px-1 rounded">minio.example.com:9000</code>), имя bucket и ключи из панели управления.
              </span>
            </li>
          </ul>
          <p className="text-sm text-vg-muted mt-4 pt-3 border-t border-white/5">
            Endpoint должен быть валидным хостом (с точкой в домене или с портом), например <code className="bg-vg-surface px-1 rounded">storage.yandexcloud.net</code> или <code className="bg-vg-surface px-1 rounded">localhost:9000</code>. Короткие значения вроде «rs» не подходят.
          </p>
        </Card>
      </ScrollReveal>
    </div>
  );
}
