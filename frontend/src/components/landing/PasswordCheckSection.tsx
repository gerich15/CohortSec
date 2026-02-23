import { motion } from "framer-motion";
import { Shield, Lock, Eye } from "lucide-react";
import ScrollReveal from "../animations/ScrollReveal";
import PasswordCheck from "../features/PasswordCheck";

export default function PasswordCheckSection() {
  return (
    <section
      className="py-24 px-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A0A0F 0%, rgba(59,130,246,0.04) 40%, #0A0A0F 100%)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accentPurple/5 to-transparent pointer-events-none" />
      <div className="relative w-full px-3">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accentPurple bg-clip-text text-transparent">
            Проверка утечек паролей
          </h2>
          <p className="text-vg-muted max-w-2xl mx-auto">
            Узнай, не скомпрометированы ли твои пароли, не раскрывая их
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            className="bg-vg-surface/50 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6 hover:border-primary/40 hover:shadow-glow transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h4 className="font-semibold mb-2">Приватность прежде всего</h4>
            <p className="text-sm text-vg-muted">
              Пароль не покидает твоё устройство. Мы получаем только первые
              символы хэша.
            </p>
          </motion.div>
          <motion.div
            className="bg-vg-surface/50 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6 hover:border-primary/40 hover:shadow-glow transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <Lock className="w-12 h-12 text-primary mb-4" />
            <h4 className="font-semibold mb-2">Квантово-устойчивое шифрование</h4>
            <p className="text-sm text-vg-muted">
              Все данные защищены пост-квантовой криптографией
            </p>
          </motion.div>
          <motion.div
            className="bg-vg-surface/50 backdrop-blur-sm border border-secondary/20 rounded-2xl p-6 hover:border-primary/40 hover:shadow-glow transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <Eye className="w-12 h-12 text-primary mb-4" />
            <h4 className="font-semibold mb-2">Мониторинг в реальном времени</h4>
            <p className="text-sm text-vg-muted">
              Подписка на уведомления о новых утечках
            </p>
          </motion.div>
        </div>

        <motion.div
          className="max-w-2xl mx-auto p-6 md:p-8 rounded-2xl bg-vg-bg/80 backdrop-blur-xl border border-accentPurple/30 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <PasswordCheck />
        </motion.div>

        <p className="text-center text-vg-muted text-sm mt-6">
          Бесплатно: 10 проверок в месяц | Семейный: 100 проверок | Премиум: 1000
          проверок
        </p>
      </div>
    </section>
  );
}
