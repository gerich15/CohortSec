import { motion } from "framer-motion";

interface HackCardProps {
  number: number;
  title: string;
  description: string;
  className?: string;
}

export default function HackCard({ number, title, description, className = "" }: HackCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(0, 255, 170, 0.25)" }}
      transition={{ duration: 0.3 }}
      className={`flex-shrink-0 w-full min-w-[380px] max-w-[440px] rounded-2xl p-8 glass border border-white/10 hover:border-primary/50 transition-all ${className}`}
    >
      <span className="text-sm font-semibold text-primary tracking-wider mb-3 block">ЛАЙФХАК #{number}</span>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-base text-vg-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}
