import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "cohortsec_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== "accepted") setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-white/10 bg-vg-surface/95 backdrop-blur-xl p-4 md:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-sm text-white/90">
            Мы используем файлы cookie для удобной работы с сайтом. Продолжая, вы соглашаетесь с{" "}
            <Link to="/legal/cookies" className="text-vg-accent hover:underline">политикой cookie</Link>.
          </p>
          <div className="flex gap-3">
            <Link to="/legal/cookies" className="px-4 py-2 text-sm text-vg-muted hover:text-white">Подробнее</Link>
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-vg-accent text-black hover:bg-vg-accent/90"
            >
              Принять
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
