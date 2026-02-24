import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Brush,
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieChartIcon, ExternalLink, Info } from "lucide-react";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";
import { DottedSurface } from "../components/ui/DottedSurface";
import { CyberCrimePresentation } from "../components/presentation/CyberCrimePresentation";
import { yearlyTotals, categories, sources, lastUpdateYear } from "../data/cybercrimeStats";

function formatThousands(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + " млн";
  return Math.round(n).toLocaleString("ru-RU") + " тыс.";
}

export default function CybercrimeStats() {
  const [pieActiveIndex, setPieActiveIndex] = useState<number | undefined>(undefined);

  const lineData = useMemo(
    () =>
      yearlyTotals.map((y) => ({
        year: String(y.year),
        total: y.total,
        share: y.shareOfAllCrimesPercent,
      })),
    []
  );

  const barData = useMemo(() => {
    const latest = lastUpdateYear;
    return categories.map((c) => ({
      name: c.shortLabel,
      value: c.byYear[latest] ?? 0,
      fill: c.color,
    }));
  }, []);

  const pieData = useMemo(() => {
    const latest = lastUpdateYear;
    return categories
      .map((c) => ({
        name: c.shortLabel,
        value: c.byYear[latest] ?? 0,
        color: c.color,
      }))
      .filter((d) => d.value > 0);
  }, []);

  const latestYearStats = useMemo(
    () => yearlyTotals.find((y) => y.year === lastUpdateYear),
    []
  );

  return (
    <>
      {/* Hero: презентация на весь экран */}
      <section className="min-h-screen w-full relative z-20" aria-label="Презентация о киберпреступности">
        <CyberCrimePresentation embedded />
      </section>

      {/* Статистика */}
      <DottedSurface>
        <div id="stats" className="relative z-10 space-y-10 max-w-5xl mx-auto py-8 px-4 scroll-mt-4">
          <ScrollReveal>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-vg-accent/20 text-vg-accent">
              <BarChart3 className="w-6 h-6" />
            </span>
            Статистика киберпреступлений в РФ
          </h1>
          <p className="text-vg-muted">
            Официальные данные по зарегистрированным преступлениям с использованием IT: мошенничество, взломы, кража данных и др. Источники: МВД России, Генпрокуратура, Банк России.
          </p>
        </div>
      </ScrollReveal>

      {latestYearStats && (
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center" hover={false}>
              <p className="text-sm text-vg-muted mb-1">Зарегистрировано ({lastUpdateYear})</p>
              <p className="text-2xl font-bold text-white">{formatThousands(latestYearStats.total)}</p>
            </Card>
            <Card className="p-4 text-center" hover={false}>
              <p className="text-sm text-vg-muted mb-1">Доля от всех преступлений</p>
              <p className="text-2xl font-bold text-vg-accent">{latestYearStats.shareOfAllCrimesPercent ?? "—"}%</p>
            </Card>
            {latestYearStats.damageBillionRub != null && (
              <Card className="p-4 text-center" hover={false}>
                <p className="text-sm text-vg-muted mb-1">Ущерб (оценка)</p>
                <p className="text-2xl font-bold text-vg-warning">{latestYearStats.damageBillionRub} млрд ₽</p>
              </Card>
            )}
            {latestYearStats.victimsThousand != null && (
              <Card className="p-4 text-center" hover={false}>
                <p className="text-sm text-vg-muted mb-1">Потерпевшие</p>
                <p className="text-2xl font-bold text-vg-danger">{Math.round(latestYearStats.victimsThousand)} тыс.</p>
              </Card>
            )}
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal>
        <Card className="p-6" hover={false}>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-vg-accent" />
            Динамика: число IT-преступлений по годам
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="year" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(v) => v + " тыс."} />
                <Tooltip
                  contentStyle={{ background: "var(--vg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: number) => [formatThousands(value), "зарегистрировано"]}
                  labelFormatter={(label) => `Год ${label}`}
                  cursor={{ stroke: "var(--vg-accent)", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Legend wrapperStyle={{ cursor: "pointer" }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Зарегистрировано (тыс.)"
                  stroke="var(--vg-accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--vg-accent)", r: 4 }}
                  activeDot={{ r: 6, fill: "var(--vg-accent)", stroke: "white", strokeWidth: 2 }}
                />
                <Brush
                  dataKey="year"
                  height={24}
                  stroke="var(--vg-accent)"
                  fill="var(--vg-surface)"
                  travellerWidth={10}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6" hover={false}>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-vg-accent" />
            По видам преступлений ({lastUpdateYear} г.)
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickFormatter={(v) => v + " тыс."} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} width={75} />
                <Tooltip
                  contentStyle={{ background: "var(--vg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  formatter={(value: number) => [formatThousands(value), "случаев"]}
                  cursor={{ fill: "rgba(0,255,170,0.1)" }}
                />
                <Bar dataKey="value" name="Зарегистрировано (тыс.)" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6" hover={false}>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-vg-accent" />
            Доля видов киберпреступлений ({lastUpdateYear} г.)
          </h2>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  paddingAngle={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "rgba(255,255,255,0.4)" }}
                  activeIndex={pieActiveIndex}
                  onMouseEnter={(_, index) => setPieActiveIndex(index)}
                  onMouseLeave={() => setPieActiveIndex(undefined)}
                  activeShape={{ outerRadius: 120, stroke: "var(--vg-accent)", strokeWidth: 2 }}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="var(--vg-bg)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--vg-surface)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  formatter={(value: number) => [formatThousands(value), "случаев"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6" hover={false}>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-vg-accent" />
            Источники данных
          </h2>
          <p className="text-sm text-vg-muted mb-4">
            Цифры приведены по официальным отчётам. Обновление данных — по мере публикации МВД и Генпрокуратуры.
          </p>
          <ul className="space-y-2">
            {sources.map((s) => (
              <li key={s.name} className="flex items-center gap-2 text-sm">
                <span className="text-white font-medium">{s.name}</span>
                {s.description && <span className="text-vg-muted">— {s.description}</span>}
                {s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vg-accent hover:underline inline-flex items-center gap-1 ml-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </ScrollReveal>
        </div>
      </DottedSurface>
    </>
  );
}
