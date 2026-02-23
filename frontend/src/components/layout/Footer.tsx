import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer relative z-50">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>CohortSec</h4>
            <p>Твоя цифровая когорта — защита для всей семьи</p>
            <div className="social-links">
              <a href="#" aria-label="VK">VK</a>
              <a href="#" aria-label="Telegram">TG</a>
              <a href="#" aria-label="YouTube">YT</a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Продукты</h4>
            <Link to="/products/family-protection">Семейная защита</Link>
            <Link to="/products/password-monitor">Монитор утечек</Link>
            <Link to="/products/quantum-backup">Квантовый бэкап</Link>
            <Link to="/products/biometric-auth">Биометрический вход</Link>
          </div>
          <div className="footer-section">
            <h4>Компания</h4>
            <Link to="/your-security">Ваша безопасность</Link>
            <Link to="/fraud-help">Помощь пострадавшим</Link>
            <Link to="/legal">Юридические документы</Link>
            <Link to="/about">О нас</Link>
            <Link to="/why-us">Почему мы</Link>
            <Link to="/news">Новости</Link>
            <Link to="/pricing">Цены</Link>
            <Link to="/cybercrime-stats">Статистика киберпреступлений</Link>
          </div>
          <div className="footer-section">
            <h4>Поддержка</h4>
            <Link to="/app/support">Чат поддержки</Link>
            <Link to="/login">Войти</Link>
            <Link to="/register">Регистрация</Link>
            <Link to="/docs">Документация</Link>
            <Link to="/security-whitepaper">Техническая документация</Link>
          </div>
          <div className="footer-section">
            <h4>Юридические документы</h4>
            <Link to="/legal">Юридическая информация</Link>
            <Link to="/legal/privacy">Политика конфиденциальности</Link>
            <Link to="/legal/terms">Условия использования</Link>
            <Link to="/legal/eula">EULA</Link>
            <Link to="/legal/cookies">Политика cookie</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CohortSec. Все права защищены.</p>
          <p className="footer-badge">
            <Shield size={16} />
            Квантово-устойчивое шифрование
          </p>
        </div>
      </div>
    </footer>
  );
}
