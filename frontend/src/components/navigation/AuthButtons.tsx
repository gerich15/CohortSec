import { Link } from "react-router-dom";

interface AuthButtonsProps {
  mobile?: boolean;
}

export function AuthButtons({ mobile = false }: AuthButtonsProps) {
  return (
    <div className={`auth-buttons ${mobile ? "auth-buttons-mobile" : ""}`}>
      <Link to="/login" className="auth-button login">
        Войти
      </Link>
      <Link to="/register" className="auth-button register">
        Регистрация
      </Link>
    </div>
  );
}
