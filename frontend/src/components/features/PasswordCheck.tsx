import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import sha1 from "crypto-js/sha1";
import { checkPasswordBreach } from "../../api/client";

export default function PasswordCheck() {
  const [password, setPassword] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    found: boolean;
    count: number;
    message: string;
  } | null>(null);

  const hasToken = !!sessionStorage.getItem("token");

  const checkPassword = async () => {
    if (!password || !hasToken) return;
    setIsChecking(true);
    setResult(null);
    try {
      const hash = sha1(password).toString().toUpperCase();
      const prefix = hash.substring(0, 5);
      const suffix = hash.substring(5);
      const { data } = await checkPasswordBreach(prefix);
      const found = data.suffixes.includes(suffix);
      setResult({
        found,
        count: data.count,
        message: found
          ? "Этот пароль был в утечках. Рекомендуем сменить."
          : "Пароль не найден в базах утечек",
      });
    } catch {
      setResult({ found: false, count: 0, message: "Ошибка проверки. Попробуйте позже." });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h3 className="text-xl font-semibold mb-2">Проверка утечек паролей</h3>
      <p className="text-vg-muted text-sm mb-4">
        Проверь, не был ли твой пароль скомпрометирован. Мы не храним пароль.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введи пароль для проверки"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-vg-muted focus:outline-none focus:border-primary/50"
        />
        {hasToken ? (
          <motion.button
            onClick={checkPassword}
            disabled={isChecking || !password}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium disabled:opacity-50"
          >
            {isChecking ? "Проверяю..." : "Проверить"}
          </motion.button>
        ) : (
          <Link
            to="/login"
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-medium text-center"
          >
            Войти для проверки
          </Link>
        )}
      </div>
      {result && (
        <motion.div
          className={`p-4 rounded-xl ${result.found ? "bg-red-500/10 border border-red-500/30 text-red-400" : "bg-primary/10 border border-primary/30 text-primary"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {result.message}
          {result.found && result.count > 0 && (
            <p className="text-sm mt-2 opacity-80">Пароль в {result.count} базах утечек</p>
          )}
        </motion.div>
      )}
      <p className="mt-4 text-xs text-vg-muted text-center">Пароль не покидает устройство. k-anonymity.</p>
    </motion.div>
  );
}
