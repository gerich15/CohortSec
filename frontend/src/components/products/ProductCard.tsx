import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Lock, HardDrive, Fingerprint } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "family-protection": Users,
  "password-monitor": Lock,
  "quantum-backup": HardDrive,
  "biometric-auth": Fingerprint,
};

interface Product {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: string;
  popular?: boolean;
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const Icon = ICONS[product.id] || Lock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/products/${product.id}`}>
        <div
          className={`product-card ${product.popular ? "product-card-popular" : ""}`}
        >
          {product.popular && (
            <span className="product-badge">Популярный</span>
          )}
          <div className="product-icon">
            <Icon className="w-8 h-8 text-vg-accent" />
          </div>
          <h3 className="product-title">{product.title}</h3>
          <p className="product-description">{product.description}</p>
          <ul className="product-features">
            {product.features.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
          <p className="product-price">{product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
}
