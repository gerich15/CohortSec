import { Outlet, NavLink } from "react-router-dom";
import { Shield, Info, Flame, FileEdit, HelpCircle, BookOpen, Phone, Scale, Globe } from "lucide-react";
import FlowFieldBackground from "../ui/FlowFieldBackground";

const NAV_ITEMS = [
  { to: "/fraud-help", icon: Info, label: "О разделе", end: true },
  { to: "/fraud-help/urgent", icon: Flame, label: "Срочные действия", end: false },
  { to: "/fraud-help/report", icon: FileEdit, label: "Сообщить о мошеннике", end: false },
  { to: "/fraud-help/faq", icon: HelpCircle, label: "Частые вопросы", end: false },
  { to: "/fraud-help/schemes", icon: BookOpen, label: "База знаний: схемы", end: false },
  { to: "/fraud-help/useful-sites", icon: Globe, label: "Полезные сайты", end: false },
  { to: "/fraud-help/contacts", icon: Phone, label: "Контакты для срочной связи", end: false },
  { to: "/fraud-help/complain", icon: Scale, label: "Куда жаловаться (официально)", end: false },
];

export default function FraudHelpLayout() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 z-0 min-h-screen w-full">
        <FlowFieldBackground
          color="#3B82F6"
          trailOpacity={0.1}
          particleCount={600}
          speed={0.8}
        />
      </div>
      <div className="relative z-10 doc-layout">
        <nav className="doc-sidebar">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
            <Shield className="w-8 h-8 text-vg-accent" />
            <span className="font-bold text-lg">Помощь пострадавшим</span>
          </div>
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive ? "text-vg-accent bg-vg-accent/10 font-medium" : "text-vg-muted hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        <main className="doc-main max-w-4xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
