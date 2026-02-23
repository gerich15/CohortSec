import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface NavLinksProps {
  mobile?: boolean;
  onItemClick?: () => void;
}

interface LinkItem {
  href: string;
  label: string;
  end: boolean;
}

const mainLinks: LinkItem[] = [
  { href: "/", label: "Главная", end: true },
  { href: "/products", label: "Продукты", end: false },
  { href: "/fraud-help", label: "Помощь пострадавшим", end: false },
  { href: "/pricing", label: "Цены", end: false },
];

const moreLinks: LinkItem[] = [
  { href: "/your-security", label: "Ваша безопасность", end: false },
  { href: "/why-us", label: "Почему мы", end: false },
  { href: "/about", label: "О нас", end: false },
  { href: "/news", label: "Новости", end: false },
  { href: "/cybercrime-stats", label: "Статистика киберпреступлений", end: true },
  { href: "/docs", label: "Документация", end: false },
];

const allLinks = [...mainLinks, ...moreLinks];

function NavItem({ link, mobile, onItemClick }: { link: LinkItem; mobile?: boolean; onItemClick?: () => void }) {
  return (
    <NavLink
      to={link.href}
      end={link.end}
      onClick={onItemClick}
      className={({ isActive }) =>
        `nav-link ${isActive ? "active" : ""} ${mobile ? "nav-link-mobile" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          {link.label}
          {isActive && (
            <motion.span
              className="nav-indicator"
              layoutId="nav-indicator"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export function NavLinks({ mobile = false, onItemClick }: NavLinksProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const isMoreActive = moreLinks.some(
    (l) => (l.end && location.pathname === l.href) || (!l.end && location.pathname.startsWith(l.href))
  );

  if (mobile) {
    return (
      <>
        {allLinks.map((link) => (
          <NavItem key={link.href} link={link} mobile onItemClick={onItemClick} />
        ))}
      </>
    );
  }

  return (
    <>
      {mainLinks.map((link) => (
        <NavItem key={link.href} link={link} />
      ))}
      <div
        className="nav-dropdown-wrapper"
        onMouseEnter={() => setIsMoreOpen(true)}
        onMouseLeave={() => setIsMoreOpen(false)}
      >
        <span className={`nav-link nav-link-dropdown-trigger ${isMoreOpen || isMoreActive ? "active" : ""}`}>
          Ещё <ChevronDown className={`nav-chevron ${isMoreOpen ? "open" : ""}`} size={16} />
        </span>
        {isMoreOpen && (
          <div className="nav-dropdown">
            {moreLinks.map((link) => {
              const isActive =
                (link.end && location.pathname === link.href) ||
                (!link.end && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`nav-dropdown-item ${isActive ? "active" : ""}`}
                  onClick={() => setIsMoreOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
