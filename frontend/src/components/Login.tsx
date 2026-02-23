import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, verifyMFA } from "../api/client";

export default function Login() {
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
      sessionStorage.setItem("token", data.access_token);
      if (data.mfa_required) {
        setMfaRequired(true);
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Ошибка входа"
      );
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
      sessionStorage.setItem("token", data.access_token);
      navigate("/");
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Неверный код"
      );
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-dark)",
        }}
      >
        <form
          onSubmit={handleMFA}
          style={{
            background: "var(--bg-card)",
            padding: "2rem",
            borderRadius: 12,
            border: "1px solid var(--border)",
            width: 360,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Второй ключ</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Введите 6-значный код из приложения (Google Authenticator, Authy и т.п.)
          </p>
          <input
            type="text"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="000000"
            maxLength={6}
            autoFocus
            style={{
              width: "100%",
              padding: "0.75rem",
              marginBottom: "1rem",
              background: "var(--bg-dark)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--text)",
            }}
          />
          {error && (
            <p style={{ color: "var(--danger)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || mfaCode.length !== 6}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {loading ? "Проверка..." : "Подтвердить"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-dark)",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "var(--bg-card)",
          padding: "2rem",
          borderRadius: 12,
          border: "1px solid var(--border)",
          width: 360,
        }}
      >
        <h2 style={{ marginTop: 0 }}>CohortSec</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          Твой персональный цифровой телохранитель
        </p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Имя пользователя"
          required
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            background: "var(--bg-dark)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text)",
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          required
          style={{
            width: "100%",
            padding: "0.75rem",
            marginBottom: "1rem",
            background: "var(--bg-dark)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--text)",
          }}
        />
        {error && (
          <p style={{ color: "var(--danger)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem" }}>
          По умолчанию: admin / admin
        </p>
      </form>
    </div>
  );
}
