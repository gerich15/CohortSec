import { Link, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, HardDrive, Shield, Zap, Search, MessageCircle } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import { clsx } from "clsx";

const items = [
  { to: "/app", icon: LayoutDashboard, key: "overview" },
  { to: "/app/checks", icon: Search, key: "checks" },
  { to: "/app/family", icon: Users, key: "family" },
  { to: "/app/backup", icon: HardDrive, key: "backup" },
  { to: "/app/security", icon: Shield, key: "security" },
  { to: "/app/events", icon: Zap, key: "events" },
  { to: "/app/support", icon: MessageCircle, key: "support" },
];

export default function Sidebar() {
  const { t } = useLocale();

  return (
    <aside className="w-56 glass border-r border-white/10 flex flex-col py-4">
      <Link to="/" className="flex items-center gap-2 px-4 mb-6">
        <Shield className="w-7 h-7 text-vg-accent" />
        <span className="font-bold text-lg">CohortSec</span>
      </Link>
      <nav className="flex flex-col gap-1 px-3">
        {items.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/app"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive
                  ? "bg-vg-accent/20 text-vg-accent border border-vg-accent/30"
                  : "text-vg-muted hover:text-vg-text hover:bg-vg-surface/50"
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span>{t("nav." + key)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
