import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocale } from "../hooks/useLocale";
import { register } from "../api/client";
import {
  AuthLayout,
  AuthSeparator,
  AuthInput,
  Button,
} from "../components/auth/AuthLayout";
import { Github } from "lucide-react";
import toast from "react-hot-toast";
import { GoogleIcon, YandexIcon } from "../components/auth/SocialIcons";

export default function Register() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
      toast.success("Регистрация успешна. Войдите в аккаунт.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider: string) => {
    toast("Вход через соцсети скоро будет доступен");
  };

  return (
    <AuthLayout title="Регистрация" subtitle="Создайте аккаунт и начните защиту">
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
            Продолжить с Google
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => handleSocial("yandex")}
            leftIcon={<YandexIcon className="h-4 w-4" />}
          >
            Продолжить с Яндекс
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            className="w-full"
            onClick={() => handleSocial("github")}
            leftIcon={<Github className="h-4 w-4" />}
          >
            Продолжить с GitHub
          </Button>
        </div>

        <AuthSeparator />

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-3"
          aria-label="Форма регистрации"
        >
          <p className="text-xs text-vg-muted">Email и пароль</p>
          <AuthInput
            type="email"
            placeholder={t("auth.email")}
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            required
            autoComplete="email"
          />
          <AuthInput
            placeholder={t("auth.username")}
            value={form.username}
            onChange={(v) => setForm((f) => ({ ...f, username: v }))}
            required
            autoComplete="username"
          />
          <AuthInput
            placeholder={t("auth.full_name")}
            value={form.full_name}
            onChange={(v) => setForm((f) => ({ ...f, full_name: v }))}
            autoComplete="name"
          />
          <AuthInput
            type="password"
            placeholder={t("auth.password")}
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            required
            autoComplete="new-password"
          />
          {error && <p className="text-sm text-vg-danger">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" aria-label="Зарегистрироваться">
            {t("auth.register_submit")}
          </Button>
        </motion.form>

        <p className="text-xs text-vg-muted">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="text-vg-accent hover:underline">
            {t("auth.login")}
          </Link>
        </p>
        <p className="text-xs text-vg-muted">
          Продолжая, вы соглашаетесь с{" "}
          <Link to="/legal/terms" className="text-vg-accent hover:underline">
            условиями
          </Link>{" "}
          и{" "}
          <Link to="/legal/privacy" className="text-vg-accent hover:underline">
            политикой конфиденциальности
          </Link>
          .
        </p>
      </div>
    </AuthLayout>
  );
}
