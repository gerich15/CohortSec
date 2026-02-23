import ru from "../locales/ru.json";

type LocaleKeys = typeof ru;

function interpolate(str: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), v),
    str
  );
}

export function useLocale() {
  const t = (path: string, vars?: Record<string, string>): string => {
    const keys = path.split(".");
    let value: unknown = ru;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    const str = typeof value === "string" ? value : path;
    return vars ? interpolate(str, vars) : str;
  };
  return { t };
}
