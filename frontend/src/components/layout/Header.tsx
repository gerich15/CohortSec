import { Link, useNavigate } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { useLocale } from "../../hooks/useLocale";
import Button from "../ui/Button";
import { logout as apiLogout } from "../../api/client";

export default function Header() {
  const { t } = useLocale();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      sessionStorage.removeItem("token");
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="h-14 glass border-b border-white/10 flex items-center justify-between px-4">
      <Link to="/" className="flex items-center gap-2" aria-label="На главную CohortSec">
        <Shield className="w-6 h-6 text-vg-accent" />
        <span className="font-semibold">CohortSec</span>
      </Link>
      <Button variant="ghost" size="sm" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />} aria-label="Выйти из аккаунта">
        {t("nav.logout")}
      </Button>
    </header>
  );
}
