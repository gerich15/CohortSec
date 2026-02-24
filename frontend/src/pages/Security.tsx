import { useState, useEffect } from "react";
import {
  Shield,
  Smartphone,
  ScanFace,
  KeyRound,
  Monitor,
  Mail,
  Phone,
  Link2,
  FileText,
  Camera,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useLocale } from "../hooks/useLocale";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";
import { securityApi } from "../api/client";

type TabType = "biometric" | "contacts" | "accounts" | "log";

export default function Security() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<TabType>("biometric");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Biometric state
  const [faces, setFaces] = useState<{ id: number; label: string; created_at: string }[]>([]);
  const [biometricSettings, setBiometricSettings] = useState({
    confidence_threshold: 0.65,
    failed_attempts: 0,
    locked_until: null as string | null,
  });
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [addFaceLabel, setAddFaceLabel] = useState("");
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [captureRef, setCaptureRef] = useState<HTMLVideoElement | null>(null);

  // Contacts state
  const [contacts, setContacts] = useState<
    { id: number; contact_type: string; value: string; value_full: string; verified: boolean; is_primary: boolean }[]
  >([]);
  const [newContactType, setNewContactType] = useState<"email" | "phone">("email");
  const [newContactValue, setNewContactValue] = useState("");
  const [verifyCode, setVerifyCode] = useState<{ [id: number]: string }>({});
  const [pendingVerify, setPendingVerify] = useState<number | null>(null);

  // Accounts state
  const [accounts, setAccounts] = useState<
    { id: number; account_type: string; display_name: string; status: string; last_check_at: string | null }[]
  >([]);
  const [newAccountType, setNewAccountType] = useState("vk");

  // Log state
  const [logs, setLogs] = useState<
    { id: number; event_type: string; details: string | null; ip_address: string | null; success: boolean; created_at: string }[]
  >([]);

  // Security status
  const [status, setStatus] = useState<{
    security_level: number;
    mfa_enabled: boolean;
    biometric_faces: number;
    verified_contacts: number;
    connected_accounts: number;
  } | null>(null);

  const loadBiometric = () => {
    securityApi.listFaces().then((r) => setFaces(r.data)).catch(() => {});
    securityApi.getBiometricSettings().then((r) => setBiometricSettings(r.data)).catch(() => {});
  };

  const loadContacts = () => {
    securityApi.listContacts().then((r) => setContacts(r.data)).catch(() => {});
  };

  const loadAccounts = () => {
    securityApi.listConnectedAccounts().then((r) => setAccounts(r.data)).catch(() => {});
  };

  const loadLogs = () => {
    securityApi.getSecurityLogs().then((r) => setLogs(r.data)).catch(() => {});
  };

  const loadStatus = () => {
    securityApi.getSecurityStatus().then((r) => setStatus(r.data)).catch(() => {});
  };

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (activeTab === "biometric") loadBiometric();
    else if (activeTab === "contacts") loadContacts();
    else if (activeTab === "accounts") loadAccounts();
    else if (activeTab === "log") loadLogs();
  }, [activeTab]);

  const handleAddFace = async (file: File) => {
    setBiometricLoading(true);
    try {
      try {
        const q = await securityApi.checkBiometricQuality(file);
        if (!q.data.ok) {
          alert(q.data.message);
          return;
        }
      } catch {
        // ignore
      }
      await securityApi.registerFace(file, addFaceLabel || undefined);
      setAddFaceLabel("");
      loadBiometric();
      loadStatus();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err.response?.data?.detail || "Ошибка");
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleDeleteFace = async (id: number) => {
    if (!confirm("Удалить это лицо?")) return;
    try {
      await securityApi.deleteFace(id);
      loadBiometric();
      loadStatus();
    } catch (e) {
      alert("Ошибка удаления");
    }
  };

  const handleAddContact = async () => {
    if (!newContactValue.trim()) return;
    try {
      const r = await securityApi.addContact(newContactType, newContactValue.trim());
      setPendingVerify(r.data.id);
      setNewContactValue("");
      loadContacts();
      loadStatus();
      if (r.data.dev_code) alert(`Код для подтверждения (dev): ${r.data.dev_code}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const handleVerifyContact = async (contactId: number) => {
    const code = verifyCode[contactId];
    if (!code || code.length < 4) return;
    try {
      await securityApi.verifyContact(contactId, code);
      setVerifyCode((prev) => ({ ...prev, [contactId]: "" }));
      setPendingVerify(null);
      loadContacts();
      loadStatus();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const handleAddAccount = async () => {
    try {
      await securityApi.addConnectedAccount(newAccountType, undefined, {});
      loadAccounts();
      loadStatus();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err.response?.data?.detail || "Ошибка");
    }
  };

  const tabs = [
    { id: "biometric" as TabType, label: "Биометрия", icon: ScanFace },
    { id: "contacts" as TabType, label: "Резервные контакты", icon: Mail },
    { id: "accounts" as TabType, label: "Подключённые аккаунты", icon: Link2 },
    { id: "log" as TabType, label: "Журнал безопасности", icon: FileText },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <ScrollReveal>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-7 h-7 text-vg-accent" />
          {t("security.title")}
        </h1>
      </ScrollReveal>

      {status && (
        <ScrollReveal>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Уровень защиты</h3>
              <span className="text-2xl font-bold text-[#00FFAA]">{status.security_level}%</span>
            </div>
            <div className="h-2 bg-vg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#00FFAA] to-[#3B82F6] rounded-full transition-all"
                style={{ width: `${status.security_level}%` }}
              />
            </div>
            <p className="text-sm text-vg-muted mt-2">
              MFA: {status.mfa_enabled ? "вкл" : "выкл"} · Лиц: {status.biometric_faces} · Контактов: {status.verified_contacts} · Аккаунтов: {status.connected_accounts}
            </p>
          </Card>
        </ScrollReveal>
      )}

      <ScrollReveal>
        <h3 className="font-semibold mb-3">Разделы</h3>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id ? "bg-vg-accent text-white" : "bg-vg-surface hover:bg-vg-surface/80"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal>
        {activeTab === "biometric" && (
          <Card className="p-6 space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-vg-success" />
              Биометрическая аутентификация
            </h3>
            <p className="text-sm text-vg-muted">
              Добавьте до 5 лиц для входа по лицу. Поддерживаются разные ракурсы и фото с очками.
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Добавить лицо</label>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Подпись (опционально)"
                  value={addFaceLabel}
                  onChange={(e) => setAddFaceLabel(e.target.value)}
                  className="px-4 py-2 bg-vg-surface border border-white/10 rounded-lg text-white w-48"
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAddFace(f);
                    e.target.value = "";
                  }}
                  disabled={biometricLoading}
                  className="hidden"
                  id="face-upload"
                />
                <label htmlFor="face-upload">
                  <Button as="span" disabled={biometricLoading}>
                    {biometricLoading ? "Загрузка…" : "Загрузить фото"}
                  </Button>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Сохранённые лица ({faces.length}/5)</h4>
              {faces.length === 0 ? (
                <p className="text-vg-muted text-sm">Нет добавленных лиц</p>
              ) : (
                <div className="space-y-2">
                  {faces.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-4 bg-vg-surface/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-vg-success/20 flex items-center justify-center">
                          <ScanFace className="w-5 h-5 text-vg-success" />
                        </div>
                        <div>
                          <p className="font-medium">{f.label || `Лицо #${f.id}`}</p>
                          <p className="text-xs text-vg-muted">
                            {new Date(f.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFace(f.id)}
                        className="p-2 text-vg-danger hover:bg-vg-danger/20 rounded-lg transition-colors"
                        aria-label="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Порог уверенности</h4>
              <p className="text-sm text-vg-muted mb-2">
                Текущий: {biometricSettings.confidence_threshold} (по умолчанию 0.65)
              </p>
              {biometricSettings.locked_until && (
                <p className="text-vg-warning text-sm">
                  Биометрия временно заблокирована после неудачных попыток
                </p>
              )}
            </div>
          </Card>
        )}

        {activeTab === "contacts" && (
          <Card className="p-6 space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="w-5 h-5 text-vg-accent" />
              Резервные контакты
            </h3>
            <p className="text-sm text-vg-muted">
              Добавьте email и телефоны для восстановления пароля и уведомлений. Минимум 2 контакта рекомендуется.
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Добавить контакт</label>
              <div className="flex gap-3 flex-wrap">
                <select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value as "email" | "phone")}
                  className="px-4 py-2 bg-vg-surface border border-white/10 rounded-lg text-white"
                >
                  <option value="email">Email</option>
                  <option value="phone">Телефон</option>
                </select>
                <input
                  type={newContactType === "email" ? "email" : "tel"}
                  placeholder={newContactType === "email" ? "email@example.com" : "+7 999 123-45-67"}
                  value={newContactValue}
                  onChange={(e) => setNewContactValue(e.target.value)}
                  className="px-4 py-2 bg-vg-surface border border-white/10 rounded-lg text-white flex-1 min-w-[200px]"
                />
                <Button onClick={handleAddContact} disabled={!newContactValue.trim()}>
                  Добавить
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Список контактов</h4>
              {contacts.length === 0 ? (
                <p className="text-vg-muted text-sm">Нет добавленных контактов</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 bg-vg-surface/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {c.contact_type === "email" ? (
                          <Mail className="w-5 h-5 text-vg-muted" />
                        ) : (
                          <Phone className="w-5 h-5 text-vg-muted" />
                        )}
                        <div>
                          <p className="font-medium">{c.value}</p>
                          <div className="flex gap-2">
                            {c.verified ? (
                              <span className="text-xs text-vg-success flex items-center gap-1">
                                <Check className="w-3 h-3" /> Подтверждён
                              </span>
                            ) : (
                              <span className="text-xs text-vg-warning">Не подтверждён</span>
                            )}
                            {c.is_primary && (
                              <span className="text-xs text-vg-accent">Основной</span>
                            )}
                          </div>
                          {!c.verified && pendingVerify === c.id && (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="Код"
                                value={verifyCode[c.id] || ""}
                                onChange={(e) =>
                                  setVerifyCode((prev) => ({ ...prev, [c.id]: e.target.value }))
                                }
                                className="px-2 py-1 bg-vg-surface border border-white/10 rounded text-white w-24"
                              />
                              <Button size="sm" onClick={() => handleVerifyContact(c.id)}>
                                Подтвердить
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!c.is_primary && c.verified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              securityApi.setPrimaryContact(c.id).then(loadContacts);
                            }}
                          >
                            Основной
                          </Button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Удалить контакт?"))
                              securityApi.deleteContact(c.id).then(loadContacts);
                          }}
                          className="p-2 text-vg-danger hover:bg-vg-danger/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "accounts" && (
          <Card className="p-6 space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Link2 className="w-5 h-5 text-vg-accent" />
              Подключённые аккаунты
            </h3>
            <p className="text-sm text-vg-muted">
              Подключите аккаунты для мониторинга подозрительных действий (VK, почта, банки).
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Подключить аккаунт</label>
              <div className="flex gap-3 flex-wrap">
                <select
                  value={newAccountType}
                  onChange={(e) => setNewAccountType(e.target.value)}
                  className="px-4 py-2 bg-vg-surface border border-white/10 rounded-lg text-white"
                >
                  <option value="vk">VK</option>
                  <option value="email_gmail">Gmail</option>
                  <option value="email_yandex">Яндекс</option>
                  <option value="email_mailru">Mail.ru</option>
                  <option value="bank_sber">Сбербанк</option>
                  <option value="bank_tinkoff">Тинькофф</option>
                  <option value="telegram">Telegram</option>
                </select>
                <Button onClick={handleAddAccount}>Подключить</Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Список аккаунтов</h4>
              {accounts.length === 0 ? (
                <p className="text-vg-muted text-sm">Нет подключённых аккаунтов</p>
              ) : (
                <div className="space-y-2">
                  {accounts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-4 bg-vg-surface/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{a.display_name}</p>
                        <p className="text-xs text-vg-muted">
                          {a.status === "active" ? (
                            <span className="text-vg-success">Активен</span>
                          ) : (
                            <span className="text-vg-warning">{a.status}</span>
                          )}
                          {a.last_check_at && " · " + new Date(a.last_check_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            securityApi.refreshConnectedAccount(a.id).then(loadAccounts)
                          }
                        >
                          Проверить
                        </Button>
                        <button
                          onClick={() => {
                            if (confirm("Отключить аккаунт?"))
                              securityApi.deleteConnectedAccount(a.id).then(loadAccounts);
                          }}
                          className="p-2 text-vg-danger hover:bg-vg-danger/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === "log" && (
          <Card className="p-6 space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-vg-accent" />
              Журнал безопасности
            </h3>
            <p className="text-sm text-vg-muted">
              Все события, связанные с безопасностью: входы, попытки, изменения настроек.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-vg-muted border-b border-white/10">
                    <th className="py-2">Дата</th>
                    <th className="py-2">Событие</th>
                    <th className="py-2">IP</th>
                    <th className="py-2">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l) => (
                    <tr key={l.id} className="border-b border-white/5">
                      <td className="py-2">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="py-2">{l.event_type}</td>
                      <td className="py-2">{l.ip_address || "—"}</td>
                      <td className="py-2">
                        {l.success ? (
                          <span className="text-vg-success">OK</span>
                        ) : (
                          <span className="text-vg-danger">Ошибка</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && (
                <p className="text-vg-muted text-sm py-4">Нет записей</p>
              )}
            </div>
          </Card>
        )}
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-vg-accent/20 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-vg-accent" />
            </div>
            <div>
              <h3 className="font-semibold">{t("security.mfa")}</h3>
              <p className="text-sm text-vg-muted">{t("security.mfa_desc")}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm">{t("security.setup_mfa")}</Button>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-vg-accent" />
              {t("security.change_password")}
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>
              Изменить
            </Button>
          </div>
          {showPasswordForm && (
            <form className="space-y-4 pt-4 border-t border-white/10">
              <input
                type="password"
                placeholder="Текущий пароль"
                className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white"
              />
              <input
                type="password"
                placeholder="Новый пароль"
                className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white"
              />
              <input
                type="password"
                placeholder="Повторите пароль"
                className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white"
              />
              <div className="flex gap-3">
                <Button>{t("common.save")}</Button>
                <Button variant="ghost" type="button" onClick={() => setShowPasswordForm(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-vg-accent" />
            {t("security.sessions")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-vg-surface/50 rounded-lg">
              <div>
                <p className="font-medium">Текущая сессия</p>
                <p className="text-sm text-vg-muted">Chrome, Windows</p>
              </div>
              <span className="text-xs text-vg-success">Активна</span>
            </div>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}
