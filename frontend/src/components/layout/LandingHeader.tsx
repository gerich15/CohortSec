import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";
import { NavLinks } from "../navigation/NavLinks";
import { AuthButtons } from "../navigation/AuthButtons";

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const token = sessionStorage.getItem("token");

  return (
    <motion.header
      className={`landing-header relative z-50 ${isScrolled ? "landing-header-scrolled" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-container">
        <Link to="/" className="logo">
          <Shield className="logo-icon" />
          <span className="logo-text">CohortSec</span>
        </Link>

        <nav className="desktop-nav">
          <NavLinks />
        </nav>

        <div className="desktop-auth">
          {token ? (
            <Link to="/app" className="auth-button register">
              Личный кабинет
            </Link>
          ) : (
            <AuthButtons />
          )}
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Меню"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="mobile-nav">
              <NavLinks mobile onItemClick={() => setIsMobileMenuOpen(false)} />
              {token ? (
                <Link
                  to="/app"
                  className="auth-button register auth-button-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Личный кабинет
                </Link>
              ) : (
                <AuthButtons mobile />
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
