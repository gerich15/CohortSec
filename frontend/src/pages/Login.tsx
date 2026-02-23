import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocale } from "../hooks/useLocale";
import { login, verifyMFA } from "../api/client";
import {
  AuthLayout,
  AuthSeparator,
  AuthInput,
  Button,
} from "../components/auth/AuthLayout";
import { Github } from "lucide-react";
import toast from "react-hot-toast";
import { GoogleIcon, YandexIcon } from "../components/auth/SocialIcons";

export default function Login() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login(username, password);
      if (data.access_token) sessionStorage.setItem("token", data.access_token);
      if (data.mfa_required) {
        setMfaRequired(true);
      } else {
        navigate("/app", { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await verifyMFA(mfaCode);
      if (data.access_token) sessionStorage.setItem("token", data.access_token);
      navigate("/app", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: string) => {
    // Когда бэкенд добавит OAuth: window.location.href = `/api/v1/auth/oauth/${provider}`;
    toast("Вход через соцсети скоро будет доступен");
  };

  if (mfaRequired) {
    return (
      <AuthLayout title={t("auth.mfa_title")} subtitle={t("auth.mfa_hint")}>
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleMFA}
          className="space-y-4"
          aria-label="Ввод кода двухфакторной аутентификации"
        >
          <input
            type="text"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoFocus
            className="flex h-12 w-full rounded-lg border border-white/10 bg-vg-surface px-4 py-2 text-white text-center text-2xl tracking-[0.5em] placeholder-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-accent/50"
          />
          {error && <p className="text-sm text-vg-danger">{error}</p>}
          <Button
            type="submit"
            loading={loading}
            disabled={mfaCode.length !== 6}
            className="w-full"
            aria-label="Подтвердить код"
          >
            Подтвердить
          </Button>
        </motion.form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Вход" subtitle="Войдите в личный кабинет CohortSec">
      <div className="space-y-4">
        <div className="space-y-2">
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => handleSocial("google")}
            leftIcon={<GoogleIcon className="h-4 w-4" />}
          >
            Войти через Google
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => handleSocial("yandex")}
            leftIcon={<YandexIcon className="h-4 w-4" />}
          >
            Войти через Яндекс
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => handleSocial("github")}
            leftIcon={<Github className="h-4 w-4" />}
          >
            Войти через GitHub
          </Button>
        </div>

        <AuthSeparator />

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleLogin}
          className="space-y-3"
          aria-label="Форма входа"
        >
          <p className="text-xs text-vg-muted">Логин и пароль</p>
          <AuthInput
            placeholder={t("auth.username")}
            value={username}
            onChange={setUsername}
            required
            autoComplete="username"
          />
          <AuthInput
            type="password"
            placeholder={t("auth.password")}
            value={password}
            onChange={setPassword}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-sm text-vg-danger">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" aria-label="Войти">
            {t("auth.submit")}
          </Button>
        </motion.form>

        <p className="text-xs text-vg-muted">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-vg-accent hover:underline">
            {t("auth.register")}
          </Link>
        </p>
        <p className="text-xs text-vg-muted">Демо: admin / admin</p>
      </div>
    </AuthLayout>
  );
}
