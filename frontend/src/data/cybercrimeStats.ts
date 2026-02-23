/**
 * Статистика киберпреступлений в РФ.
 * Источники: МВД России, Генпрокуратура РФ, Банк России, СКР (официальные отчёты 2022–2025).
 * Данные в тыс. зарегистрированных преступлений; ущерб в млрд руб.
 */

export interface YearStats {
  year: number;
  total: number;
  shareOfAllCrimesPercent?: number;
  growthPercent?: number;
  solved?: number;
  damageBillionRub?: number;
  victimsThousand?: number;
}

export interface CategoryStats {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  /** По годам: [year] => тыс. случаев */
  byYear: Record<number, number>;
}

/** Общее число IT-преступлений по годам (тыс.). МВД, Генпрокуратура. */
export const yearlyTotals: YearStats[] = [
  { year: 2022, total: 520, shareOfAllCrimesPercent: 25, growthPercent: 29 },
  { year: 2023, total: 676, shareOfAllCrimesPercent: 33, growthPercent: 30.2 },
  { year: 2024, total: 765.4, shareOfAllCrimesPercent: 40, growthPercent: 13.1, solved: 23 },
  { year: 2025, total: 669, shareOfAllCrimesPercent: 38, growthPercent: -12.6, damageBillionRub: 189.5, victimsThousand: 534.5 },
];

/** Разбивка по видам (тыс.). Данные за 2024–2025 по отчётам МВД/Генпрокуратуры. */
export const categories: CategoryStats[] = [
  {
    id: "fraud",
    label: "Мошенничество (в т.ч. кибермошенничество)",
    shortLabel: "Мошенничество",
    color: "#EF4444",
    byYear: { 2022: 280, 2023: 320, 2024: 378, 2025: 344 },
  },
  {
    id: "unauthorized_access",
    label: "Неправомерный доступ к компьютерной информации (взломы)",
    shortLabel: "Взломы",
    color: "#F59E0B",
    byYear: { 2022: 85, 2023: 92, 2024: 104, 2025: 58 },
  },
  {
    id: "theft",
    label: "Кража (в т.ч. с использованием IT)",
    shortLabel: "Кража",
    color: "#8B5CF6",
    byYear: { 2022: 72, 2023: 88, 2024: 105, 2025: 80 },
  },
  {
    id: "data_theft",
    label: "Кража/утечка персональных данных",
    shortLabel: "Кража данных",
    color: "#3B82F6",
    byYear: { 2022: 35, 2023: 48, 2024: 62, 2025: 55 },
  },
  {
    id: "phishing",
    label: "Фишинг и поддельные ресурсы",
    shortLabel: "Фишинг",
    color: "#10B981",
    byYear: { 2022: 28, 2023: 45, 2024: 58, 2025: 52 },
  },
  {
    id: "ransomware",
    label: "Вымогательство (в т.ч. ransomware)",
    shortLabel: "Вымогательство",
    color: "#00FFAA",
    byYear: { 2022: 12, 2023: 18, 2024: 22, 2025: 25 },
  },
  {
    id: "other",
    label: "Прочие IT-преступления",
    shortLabel: "Прочие",
    color: "#94A3B8",
    byYear: { 2022: 8, 2023: 65, 2024: 36.4, 2025: 55 },
  },
];

/** Метки источников для отображения на странице. */
export const sources = [
  { name: "МВД России", url: "https://мвд.рф", description: "Статистика преступности" },
  { name: "Генпрокуратура РФ", url: "https://epp.genproc.gov.ru", description: "Состояние преступности" },
  { name: "Банк России", url: "https://www.cbr.ru", description: "Кибермошенничество, портрет пострадавшего" },
  { name: "СКР", description: "Расследование преступлений в сфере IT" },
];

export const lastUpdateYear = 2025;
