import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, Paperclip, Search } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { api, getMe, getFraudHelpConfig, searchFraudReports } from "../../api/client";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPT = "image/*,.pdf,.txt,.doc,.docx";

export default function FraudHelpReport() {
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    description: "",
    scammer_phone: "",
    scammer_email: "",
    scammer_link: "",
    scammer_nickname: "",
    scammer_card: "",
    scheme_type: "",
    consent_given: false,
  });

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    count: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) return;
    getMe().then((r) => setUser({ full_name: r.data.full_name, email: r.data.email })).catch(() => {});
  }, []);

  useEffect(() => {
    getFraudHelpConfig().then((r) => setRecaptchaSiteKey(r.data.recaptcha_site_key || "")).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, reporter_name: user.full_name || "", reporter_email: user.email || "" }));
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid: File[] = [];
    for (const f of selected) {
      if (f.size <= MAX_FILE_SIZE) valid.push(f);
    }
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (q.length < 4) {
      setSearchResult({ found: false, count: 0, message: "Введите минимум 4 символа" });
      return;
    }
    setSearchLoading(true);
    setSearchResult(null);
    try {
      const { data } = await searchFraudReports(q);
      setSearchResult(data);
    } catch {
      setSearchResult({ found: false, count: 0, message: "Ошибка поиска" });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("reporter_name", form.reporter_name);
      formData.append("reporter_email", form.reporter_email);
      if (form.reporter_phone) formData.append("reporter_phone", form.reporter_phone);
      formData.append("description", form.description);
      if (form.scammer_phone) formData.append("scammer_phone", form.scammer_phone);
      if (form.scammer_email) formData.append("scammer_email", form.scammer_email);
      if (form.scammer_link) formData.append("scammer_link", form.scammer_link);
      if (form.scammer_nickname) formData.append("scammer_nickname", form.scammer_nickname);
      if (form.scammer_card) formData.append("scammer_card", form.scammer_card);
      if (form.scheme_type) formData.append("scheme_type", form.scheme_type);
      formData.append("consent_given", String(form.consent_given));
      if (recaptchaToken) formData.append("recaptcha_token", recaptchaToken);
      for (const f of files) formData.append("files", f);

      const { data } = await api.post("/fraud-help/report", formData, {
        headers: { "Content-Type": undefined } as Record<string, unknown>,
        transformRequest: [
          (d, h) => {
            if (d instanceof FormData) delete (h as Record<string, unknown>)["Content-Type"];
            return d;
          },
        ],
      });
      setSubmitted(data.ticket_number);
    } catch (err: unknown) {
      const res = err as { response?: { data?: { detail?: string } } };
      setError(res?.response?.data?.detail || "Ошибка отправки.");
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-8">
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Спасибо!</h2>
          <p className="text-vg-muted mb-2">Номер обращения: #{submitted}</p>
          <Link to="/fraud-help" className="inline-block mt-6 text-vg-accent hover:underline">
            Вернуться
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl font-bold gradient-text">Сообщить о мошеннике</h1>

      {/* Search */}
      <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6 space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" />
          Проверить в базе
        </h3>
        <p className="text-sm text-vg-muted">
          Введите номер телефона, email или карты — мы покажем, упоминался ли он в обращениях.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="+7 999 123-45-67 или email@example.com"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-4 py-3 bg-vg-accent text-black font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {searchLoading ? "Поиск..." : "Проверить"}
          </button>
        </div>
        {searchResult && (
          <p
            className={
              searchResult.found
                ? "text-amber-400 text-sm"
                : "text-vg-muted text-sm"
            }
          >
            {searchResult.message}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6 space-y-4">
          <h3 className="font-semibold">Ваши данные</h3>
          <input
            type="text"
            required
            placeholder="Ваше имя *"
            value={form.reporter_name}
            onChange={(e) => setForm({ ...form, reporter_name: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
          <input
            type="email"
            required
            placeholder="Email *"
            value={form.reporter_email}
            onChange={(e) => setForm({ ...form, reporter_email: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={form.reporter_phone}
            onChange={(e) => setForm({ ...form, reporter_phone: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
        </div>
        <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6 space-y-4">
          <h3 className="font-semibold">Что случилось? *</h3>
          <textarea
            required
            minLength={10}
            rows={5}
            placeholder="Опишите ситуацию"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted resize-none"
          />
          <div>
            <label className="block font-medium text-sm mb-2">Документы (до {MAX_FILES} файлов, макс. 10 МБ):</label>
            <input
              type="file"
              multiple
              accept={ACCEPT}
              onChange={handleFileChange}
              className="hidden"
              id="fraud-files"
            />
            <label
              htmlFor="fraud-files"
              className="inline-flex items-center gap-2 px-4 py-2 bg-vg-bg border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 text-vg-muted text-sm"
            >
              <Paperclip className="w-4 h-4" />
              {files.length > 0 ? `${files.length} файлов` : "Выбрать файлы"}
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-vg-muted">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="truncate max-w-[200px]">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-red-400 hover:underline"
                    >
                      Удалить
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-vg-surface/30 p-6 space-y-4">
          <h3 className="font-semibold">Данные мошенника</h3>
          <input
            type="tel"
            placeholder="Номер телефона"
            value={form.scammer_phone}
            onChange={(e) => setForm({ ...form, scammer_phone: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.scammer_email}
            onChange={(e) => setForm({ ...form, scammer_email: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
          <input
            type="url"
            placeholder="Ссылка на соцсеть"
            value={form.scammer_link}
            onChange={(e) => setForm({ ...form, scammer_link: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
          <input
            type="text"
            placeholder="Никнейм"
            value={form.scammer_nickname}
            onChange={(e) => setForm({ ...form, scammer_nickname: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
          <input
            type="text"
            placeholder="Номер карты или кошелька"
            value={form.scammer_card}
            onChange={(e) => setForm({ ...form, scammer_card: e.target.value })}
            className="w-full px-4 py-3 bg-vg-bg border border-white/10 rounded-lg text-white placeholder-vg-muted"
          />
        </div>

        {recaptchaSiteKey && (
          <div className="flex justify-start">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={recaptchaSiteKey}
              onChange={(v) => setRecaptchaToken(v)}
              onExpired={() => setRecaptchaToken(null)}
              theme="dark"
            />
          </div>
        )}

        <label className="flex items-start gap-3 p-4 rounded-lg bg-white/5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.consent_given}
            onChange={(e) => setForm({ ...form, consent_given: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm text-vg-muted">
            Даю согласие на обработку персональных данных. Информация может быть передана в соответствующие органы. *
          </span>
        </label>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !form.consent_given}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-semibold rounded-xl disabled:opacity-50"
        >
          <Shield className="w-5 h-5" />
          {loading ? "Отправка..." : "Отправить обращение"}
        </button>
      </form>
    </div>
  );
}
