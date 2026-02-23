import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, Mail, Trash2 } from "lucide-react";
import { getFamilyMembers, inviteFamilyMember, removeFamilyMember } from "../api/client";
import toast from "react-hot-toast";
import { useLocale } from "../hooks/useLocale";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";

interface FamilyMember {
  id: number;
  user_id: number;
  display_name: string;
  role: string;
  email?: string;
}

export default function Family() {
  const { t } = useLocale();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getFamilyMembers()
      .then((r) => setMembers(r.data))
      .catch(() => {
        setMembers([]);
        toast.error("Не удалось загрузить семью");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inviteFamilyMember({ email, display_name: displayName || undefined });
      toast.success("Приглашение отправлено на " + email);
      setShowInvite(false);
      setEmail("");
      setDisplayName("");
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Что-то пошло не так");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (memberId: number) => {
    if (!confirm("Удалить из семьи?")) return;
    try {
      await removeFamilyMember(memberId);
      toast.success("Удалено");
      load();
    } catch {
      toast.error("Не удалось удалить");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-vg-muted">{t("common.loading")}</p>
      </div>
    );

  return (
    <div className="space-y-8 max-w-4xl">
      <ScrollReveal>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-vg-accent" />
            {t("family.title")}
          </h1>
          <Button
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => setShowInvite(true)}
            disabled={members.length >= 5}
          >
            {t("family.invite")}
          </Button>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <p className="text-vg-muted">{t("family.add_hint")}</p>
      </ScrollReveal>

      <ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <Card key={m.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-vg-accent/30 flex items-center justify-center text-vg-accent font-semibold">
                    {m.display_name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-semibold">{m.display_name || "Участник"}</p>
                    <p className="text-sm text-vg-muted">{m.email || "—"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(m.id)}>
                  <Trash2 className="w-4 h-4 text-vg-danger" />
                </Button>
              </div>
            </Card>
          ))}
          {members.length < 5 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="border-2 border-dashed border-vg-accent/40 rounded-xl p-6 flex items-center justify-center cursor-pointer hover:bg-vg-accent/5 transition-colors"
              onClick={() => setShowInvite(true)}
            >
              <UserPlus className="w-10 h-10 text-vg-accent mb-2" />
              <p className="text-vg-muted text-sm">Добавить родственника</p>
            </motion.div>
          )}
        </div>
      </ScrollReveal>

      {showInvite && (
        <ScrollReveal>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t("family.invite_title")}</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm text-vg-muted mb-2">{t("family.invite_email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vg-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white"
                    placeholder="example@mail.ru"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-vg-muted mb-2">{t("family.invite_name")}</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-vg-surface border border-white/10 rounded-lg text-white"
                  placeholder="Мама, Папа, Ребёнок"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" loading={submitting}>
                  {t("family.invite_send")}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setShowInvite(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </Card>
        </ScrollReveal>
      )}
    </div>
  );
}
