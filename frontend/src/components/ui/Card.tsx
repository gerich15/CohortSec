import { motion } from "framer-motion";
import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover = true, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)" } : undefined}
      transition={{ duration: 0.2 }}
      className={clsx(
        "rounded-xl glass p-5 transition-all",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
