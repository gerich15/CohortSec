import { useEffect, useState } from "react";
import { Zap, Filter, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { getAnomalies } from "../api/client";
import { useLocale } from "../hooks/useLocale";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";

interface Anomaly {
  id: number;
  action_type: string;
  description: string | null;
  threat_level: string;
  ip_address: string | null;
  geo_location: string | null;
  created_at: string;
}

export default function Anomalies() {
  const { t } = useLocale();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "suspicious" | "danger">("all");

  useEffect(() => {
    getAnomalies({ limit: 100 })
      .then((r) => setAnomalies(r.data))
      .catch(() => setAnomalies([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = anomalies.filter((a) => {
    if (filter === "all") return true;
    if (filter === "suspicious") return a.threat_level === "Medium";
    return a.threat_level === "High";
  });

  const threatLabel: Record<string, string> = { High: "Опасный", Medium: "Подозрительный", Low: "Низкий" };
  const threatColor: Record<string, string> = { High: "text-vg-danger", Medium: "text-vg-warning", Low: "text-vg-muted" };
  const ThreatIcon = ({ level }: { level: string }) => level === "High" ? <AlertTriangle className="w-5 h-5" /> : level === "Medium" ? <AlertCircle className="w-5 h-5" /> : <Info className="w-5 h-5" />;

  if (loading) return <div className="flex items-center justify-center min-h-[200px]"><p className="text-vg-muted">{t("common.loading")}</p></div>;

  return (
    <div className="space-y-8 max-w-4xl">
      <ScrollReveal>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-7 h-7 text-vg-accent" />
          {t("anomalies.title")}
        </h1>
      </ScrollReveal>
      <ScrollReveal>
        <p className="text-vg-muted">Подозрительные входы и действия — проверьте, всё ли это вы</p>
      </ScrollReveal>
      <ScrollReveal>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter("all")} className={"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors " + (filter === "all" ? "bg-vg-accent/20 text-vg-accent" : "bg-vg-surface text-vg-muted hover:text-vg-text")}>
            <Filter className="w-4 h-4" />{t("anomalies.filter_all")}
          </button>
          <button onClick={() => setFilter("suspicious")} className={"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors " + (filter === "suspicious" ? "bg-vg-warning/20 text-vg-warning" : "bg-vg-surface text-vg-muted hover:text-vg-text")}>
            {t("anomalies.filter_suspicious")}
          </button>
          <button onClick={() => setFilter("danger")} className={"flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors " + (filter === "danger" ? "bg-vg-danger/20 text-vg-danger" : "bg-vg-surface text-vg-muted hover:text-vg-text")}>
            {t("anomalies.filter_danger")}
          </button>
        </div>
      </ScrollReveal>
      <ScrollReveal>
        <Card className="overflow-hidden p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-vg-muted">Нет событий</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm text-vg-muted">{t("anomalies.time")}</th>
                    <th className="text-left p-4 text-sm text-vg-muted">{t("anomalies.event")}</th>
                    <th className="text-left p-4 text-sm text-vg-muted">{t("anomalies.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-vg-surface/30">
                      <td className="p-4 text-sm">{new Date(a.created_at).toLocaleString("ru")}</td>
                      <td className="p-4">
                        <p className="font-medium">{a.action_type}</p>
                        <p className="text-sm text-vg-muted">{a.description || "—"}</p>
                        {a.geo_location && <p className="text-xs text-vg-muted">📍 {a.geo_location}</p>}
                      </td>
                      <td className="p-4">
                        <span className={"flex items-center gap-2 font-medium " + threatColor[a.threat_level]}>
                          <ThreatIcon level={a.threat_level} />
                          {threatLabel[a.threat_level] ?? a.threat_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </ScrollReveal>
    </div>
  );
}
