import { motion } from "framer-motion";
import { Lock, PenTool, RefreshCw } from "lucide-react";
import { LockIcon, FileImageIcon, PeopleIcon, KeyIcon } from "../icons/QuantumIcons";
import ScrollReveal from "../animations/ScrollReveal";
import EncryptionCard from "../ui/EncryptionCard";
import QuantumShield from "../ui/QuantumShield";
import { Link } from "react-router-dom";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function QuantumEncryption() {
  return (
    <section
      id="quantum"
      className="relative py-24 px-0 overflow-hidden min-h-[100vh] flex items-center"
      style={{
        background: "linear-gradient(135deg, #0A0A0F 0%, rgba(139,92,246,0.06) 30%, rgba(59,130,246,0.04) 70%, #0A0A0F 100%)",
      }}
    >

      <div className="relative w-full px-3">
        <ScrollReveal className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 gradient-text">
            Шифрование, которое
            <br />
            переживёт квантовый компьютер
          </h2>
          <p className="text-vg-muted max-w-2xl mx-auto text-lg">
            Мы используем пост-квантовую криптографию (PQC) — новые стандарты
            безопасности, утверждённые NIST в 2024 году. Ваши данные защищены не
            только сегодня, но и через 20 лет.
          </p>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={item}>
            <EncryptionCard
              icon={<Lock className="w-12 h-12" />}
              title="Ключи, которые не взломать"
              delay={0}
            >
              <p>
                Для обмена ключами мы используем ML-KEM (бывший Kyber) —
                алгоритм на основе решёток.
              </p>
              <p className="mt-3">
                Квантовому компьютеру потребуется 10²⁷ лет, чтобы взломать один
                сеанс связи.
              </p>
            </EncryptionCard>
          </motion.div>
          <motion.div variants={item}>
            <EncryptionCard
              icon={<PenTool className="w-12 h-12" />}
              title="Подписи, которым можно верить"
              delay={0.1}
            >
              <p>
                ML-DSA (бывший Dilithium) защищает ваши данные от подделки.
              </p>
              <p className="mt-3">
                Даже если злоумышленник перехватит ваш файл, он не сможет изменить
                его без обнаружения.
              </p>
            </EncryptionCard>
          </motion.div>
          <motion.div variants={item}>
            <EncryptionCard
              icon={<RefreshCw className="w-12 h-12" />}
              title="Двойная защита"
              delay={0.2}
            >
              <p>
                Мы не полагаемся на один алгоритм. Гибридные схемы (классика +
                PQC) защищают вас сегодня и завтра.
              </p>
              <p className="mt-3">
                Если один алгоритм устареет, второй продолжит работу.
              </p>
            </EncryptionCard>
          </motion.div>
        </motion.div>

        <div className="quantum-shield-visualization mb-16">
          <QuantumShield />
        </div>

        <motion.div
          className="flex flex-wrap justify-center items-center gap-4 md:gap-6 my-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="diagram-step text-center min-w-[70px]">
            <div className="w-14 h-14 rounded-full bg-accentPurple/20 border-2 border-accentPurple/50 flex items-center justify-center mx-auto mb-2 font-bold text-accentPurple">
              1
            </div>
            <p className="text-xs text-vg-muted">Твой пароль</p>
          </div>
          <div className="text-2xl text-accentPurple font-bold">→</div>
          <div className="diagram-step text-center min-w-[90px]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accentPurple to-secondary flex items-center justify-center mx-auto mb-2 text-xs font-bold text-white">
              ML-KEM
            </div>
            <p className="text-xs text-vg-muted">Квантовый ключ</p>
          </div>
          <div className="text-2xl text-accentPurple font-bold">→</div>
          <div className="diagram-step text-center min-w-[70px]">
            <div className="w-14 h-14 rounded-full bg-accentPurple/20 border-2 border-accentPurple/50 flex items-center justify-center mx-auto mb-2 font-bold text-accentPurple">
              2
            </div>
            <p className="text-xs text-vg-muted">AES-256</p>
          </div>
          <div className="text-2xl text-accentPurple font-bold">→</div>
          <div className="diagram-step text-center min-w-[70px]">
            <div className="w-14 h-14 rounded-full bg-accentPurple/20 border-2 border-accentPurple/50 flex items-center justify-center mx-auto mb-2 text-accentPurple">
              <LockIcon className="w-6 h-6" />
            </div>
            <p className="text-xs text-vg-muted">Защищённые данные</p>
          </div>
        </motion.div>
        <p className="text-center text-vg-muted text-sm mb-12">
          Гибридная схема: квантово-устойчивый ключ + проверенное симметричное
          шифрование
        </p>

        <ScrollReveal className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Почему тебе это важно?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <motion.div
              className="flex gap-4 p-4 rounded-xl bg-white/5 border border-accentPurple/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 rounded-full bg-accentPurple/20 border border-accentPurple/40 flex items-center justify-center shrink-0">
                <FileImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Твои фото из отпуска</p>
                <p className="text-sm text-vg-muted">
                  Ты хранишь их годами. Мы гарантируем, что через 20 лет никто их
                  не расшифрует.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="flex gap-4 p-4 rounded-xl bg-white/5 border border-accentPurple/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 rounded-full bg-accentPurple/20 border border-accentPurple/40 flex items-center justify-center shrink-0">
                <PeopleIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Данные семьи</p>
                <p className="text-sm text-vg-muted">
                  Пароли, документы, контакты. Защищены на всю жизнь.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="flex gap-4 p-4 rounded-xl bg-white/5 border border-accentPurple/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-12 h-12 rounded-full bg-accentPurple/20 border border-accentPurple/40 flex items-center justify-center shrink-0">
                <KeyIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">
                  «Собери сейчас, расшифруй потом»
                </p>
                <p className="text-sm text-vg-muted">
                  Хакеры уже копят данные. Мы делаем так, чтобы их усилия были
                  бесполезны.
                </p>
              </div>
            </motion.div>
          </div>
        </ScrollReveal>

        <div className="encryption-cta text-center">
          <p className="text-vg-muted mb-2">Хочешь узнать технические детали?</p>
          <Link
            to="/security-whitepaper"
            className="inline-flex items-center gap-2 text-accentPurple hover:text-accentPurple/80 transition-colors font-medium"
          >
            Читать технический документ
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
