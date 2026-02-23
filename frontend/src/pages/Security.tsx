import { useState } from "react";
import { Shield, Smartphone, ScanFace, KeyRound, Monitor } from "lucide-react";
import { useLocale } from "../hooks/useLocale";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";

export default function Security() {
  const { t } = useLocale();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl">
      <ScrollReveal>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-7 h-7 text-vg-accent" />
          {t("security.title")}
        </h1>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-vg-accent/20 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-vg-accent" />
            </div>
            <div>
              <h3 className="font-semibold">{t("security.mfa")}</h3>
              <p className="text-sm text-vg-muted">{t("security.mfa_desc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMfaEnabled(!mfaEnabled)} className={"relative w-12 h-6 rounded-full transition-colors " + (mfaEnabled ? "bg-vg-accent" : "bg-vg-surface")}>
              <span className={"absolute top-1 w-4 h-4 rounded-full bg-white transition-all " + (mfaEnabled ? "left-7" : "left-1")} />
            </button>
            <Button variant="secondary" size="sm">{t("security.setup_mfa")}</Button>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-vg-success/20 flex items-center justify-center">
              <ScanFace className="w-6 h-6 text-vg-success" />
            </div>
            <div>
              <h3 className="font-semibold">{t("security.biometric")}</h3>
              <p className="text-sm text-vg-muted">{t("security.biometric_desc")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setBiometricEnabled(!biometricEnabled)} className={"relative w-12 h-6 rounded-full transition-colors " + (biometricEnabled ? "bg-vg-accent" : "bg-vg-surface")}>
              <span className={"absolute top-1 w-4 h-4 rounded-full bg-white transition-all " + (biometricEnabled ? "left-7" : "left-1")} />
            </button>
            <Button variant="secondary" size="sm">{t("security.add_face")}</Button>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-vg-accent" />
              {t("security.change_password")}
            </h3>
            <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}>Изменить</Button>
          </div>
          {showPasswordForm && (
            <form className="space-y-4 pt-4 border-t border-white/10">
              <input type="password" placeholder="Текущий пароль" className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white" />
              <input type="password" placeholder="Новый пароль" className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white" />
              <input type="password" placeholder="Повторите пароль" className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white" />
              <div className="flex gap-3">
                <Button>{t("common.save")}</Button>
                <Button variant="ghost" type="button" onClick={() => setShowPasswordForm(false)}>{t("common.cancel")}</Button>
              </div>
            </form>
          )}
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-vg-accent" />
            {t("security.sessions")}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-vg-surface/50 rounded-lg">
              <div>
                <p className="font-medium">Текущая сессия</p>
                <p className="text-sm text-vg-muted">Chrome, Windows</p>
              </div>
              <span className="text-xs text-vg-success">Активна</span>
            </div>
          </div>
        </Card>
      </ScrollReveal>
    </div>
  );
}
