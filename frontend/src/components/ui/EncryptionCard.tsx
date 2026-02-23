import { motion } from "framer-motion";
import { ReactNode } from "react";

interface EncryptionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  delay?: number;
}

export default function EncryptionCard({ icon, title, children, delay }: EncryptionCardProps) {
  return (
    <motion.div
      className="group relative bg-[rgba(20,20,31,0.7)] backdrop-blur-[10px] border border-accentPurple/30 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-accentPurple hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:-translate-y-1"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay ?? 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accentPurple/60 animate-pulse" />
      <div className="text-accentPurple mb-4 [&>svg]:w-12 [&>svg]:h-12">{icon}</div>
      <h3 className="text-lg font-bold mb-3 text-white">{title}</h3>
      <div className="text-vg-muted text-sm leading-relaxed">{children}</div>
    </motion.div>
  );
}
