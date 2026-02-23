import { forwardRef } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, className, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-vg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-vg-accent hover:bg-vg-accent-hover text-white shadow-glow hover:shadow-glow-hover",
      secondary: "glass text-vg-accent hover:shadow-glow",
      ghost: "text-vg-muted hover:text-vg-text hover:bg-vg-surface",
      danger: "bg-vg-danger/20 text-vg-danger hover:bg-vg-danger/30",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          leftIcon && <span className="mr-2">{leftIcon}</span>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
