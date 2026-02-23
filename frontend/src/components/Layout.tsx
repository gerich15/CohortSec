import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import OnboardingTour from "./OnboardingTour";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-dark)",
      }}
    >
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-card)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
          CohortSec — персональный телохранитель
        </h1>
        <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Панель
          </NavLink>
          <NavLink
            to="/anomalies"
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            События
          </NavLink>
          <NavLink
            to="/backup"
            style={({ isActive }) => ({
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Бэкап
          </NavLink>
        </nav>
        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Выход
        </button>
      </header>
      <main style={{ flex: 1, padding: "1rem", maxWidth: "100%", overflowX: "hidden" }}>
        <Outlet />
      </main>
      <OnboardingTour run={location.pathname === "/"} />
    </div>
  );
}
