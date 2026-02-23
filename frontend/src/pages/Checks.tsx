import { useState } from "react";
import { Search, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import Card from "../components/ui/Card";
import ScrollReveal from "../components/animations/ScrollReveal";
import PasswordCheck from "../components/features/PasswordCheck";
import { searchUsername, validatePhone } from "../api/client";

export default function Checks() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [usernameResult, setUsernameResult] = useState<{
    found: { site: string; url: string }[];
    total: number;
  } | null>(null);
  const [phoneResult, setPhoneResult] = useState<{
    valid: boolean;
    formatted?: string;
    country?: string;
    number_type?: string;
  } | null>(null);

  const onUsernameSearch = async () => {
    if (!username.trim()) return;
    setUsernameLoading(true);
    setUsernameResult(null);
    try {
      const { data } = await searchUsername(username.trim());
      setUsernameResult({ found: data.found, total: data.total });
    } catch {
      setUsernameResult({ found: [], total: 0 });
    } finally {
      setUsernameLoading(false);
    }
  };

  const onPhoneValidate = async () => {
    if (!phone.trim()) return;
    setPhoneLoading(true);
    setPhoneResult(null);
    try {
      const { data } = await validatePhone(phone.trim());
      setPhoneResult({
        valid: data.valid,
        formatted: data.formatted,
        country: data.country,
        number_type: data.number_type,
      });
    } catch {
      setPhoneResult({ valid: false });
    } finally {
      setPhoneLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <ScrollReveal>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-7 h-7 text-vg-accent" />
          Проверки
        </h1>
        <p className="text-vg-muted mt-1">
          Проверка паролей, поиск username по соцсетям (Sherlock), валидация номера
        </p>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6">
          <PasswordCheck />
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-vg-accent" />
            Поиск username (Sherlock)
          </h3>
          <p className="text-vg-muted text-sm mb-4">
            Поиск имени пользователя на 400+ соцсетях и сервисах
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-vg-muted focus:outline-none focus:border-primary/50"
            />
            <motion.button
              onClick={onUsernameSearch}
              disabled={usernameLoading || !username.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium disabled:opacity-50"
            >
              {usernameLoading ? "Ищем..." : "Искать"}
            </motion.button>
          </div>
          {usernameResult && (
            <motion.div
              className="mt-4 p-4 rounded-xl bg-vg-surface/50 border border-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-vg-muted mb-2">
                Найдено на {usernameResult.total} сайтах
              </p>
              {usernameResult.found.length > 0 ? (
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {usernameResult.found.slice(0, 30).map((r) => (
                    <li key={r.site} className="flex items-center gap-2 text-sm">
                      <span className="text-vg-accent font-medium">{r.site}</span>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary truncate hover:underline"
                      >
                        {r.url}
                      </a>
                    </li>
                  ))}
                  {usernameResult.found.length > 30 && (
                    <li className="text-vg-muted text-sm">...и ещё {usernameResult.found.length - 30}</li>
                  )}
                </ul>
              ) : (
                <p className="text-vg-muted text-sm">Не найдено</p>
              )}
            </motion.div>
          )}
        </Card>
      </ScrollReveal>

      <ScrollReveal>
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <Phone className="w-5 h-5 text-vg-accent" />
            Валидация номера телефона
          </h3>
          <p className="text-vg-muted text-sm mb-4">
            Проверка формата, определение страны и типа номера
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 999 123-45-67"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-vg-muted focus:outline-none focus:border-primary/50"
            />
            <motion.button
              onClick={onPhoneValidate}
              disabled={phoneLoading || !phone.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium disabled:opacity-50"
            >
              {phoneLoading ? "Проверяю..." : "Проверить"}
            </motion.button>
          </div>
          {phoneResult && (
            <motion.div
              className={`mt-4 p-4 rounded-xl ${phoneResult.valid ? "bg-primary/10 border border-primary/30" : "bg-red-500/10 border border-red-500/30"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {phoneResult.valid ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-primary">Валидный номер</p>
                  {phoneResult.formatted && <p>Формат: {phoneResult.formatted}</p>}
                  {phoneResult.country && <p>Страна: {phoneResult.country}</p>}
                  {phoneResult.number_type && <p>Тип: {phoneResult.number_type}</p>}
                </div>
              ) : (
                <p className="text-red-400">Некорректный номер</p>
              )}
            </motion.div>
          )}
        </Card>
      </ScrollReveal>
    </div>
  );
}
