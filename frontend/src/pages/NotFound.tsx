import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ShieldOff } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-vg-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <ShieldOff className="w-24 h-24 text-vg-muted mx-auto mb-6 opacity-50" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-vg-muted mb-8">Страница не найдена</p>
        <Link to="/">
          <Button leftIcon={<Home className="w-4 h-4" />}>Вернуться на главную</Button>
        </Link>
      </motion.div>
    </div>
  );
}
