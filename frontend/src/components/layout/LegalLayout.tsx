import { Outlet, Link, useLocation } from "react-router-dom";
import { ChevronRight, FileText, Shield, Cookie, Scale } from "lucide-react";

const legalLinks = [
  { path: "/legal", label: "Юридическая информация", icon: Scale },
  { path: "/legal/privacy", label: "Политика конфиденциальности", icon: Shield },
  { path: "/legal/terms", label: "Условия использования", icon: FileText },
  { path: "/legal/eula", label: "Лицензионное соглашение (EULA)", icon: FileText },
  { path: "/legal/cookies", label: "Политика cookie", icon: Cookie },
];

export default function LegalLayout() {
  const location = useLocation();

  return (
    <div className="doc-layout">
      <aside className="doc-sidebar">
        <h3 className="font-semibold text-white mb-4">Юридические документы</h3>
        <nav className="space-y-1">
          {legalLinks.map((link) => {
            const isActive = link.path === "/legal"
              ? location.pathname === "/legal"
              : location.pathname === link.path || location.pathname.startsWith(link.path + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-vg-accent/20 text-vg-accent border border-vg-accent/40"
                    : "text-vg-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {link.label}
                <ChevronRight size={16} className="ml-auto opacity-50" />
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="doc-main">
        <Outlet />
      </main>
    </div>
  );
}
