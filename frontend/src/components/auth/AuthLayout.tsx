"use client";

import { Link } from "react-router-dom";
import { Shield, ChevronLeft } from "lucide-react";
import { FloatingPaths } from "../ui/BackgroundPaths";
import Button from "../ui/Button";

const inputBase =
  "flex h-11 w-full rounded-lg border border-white/10 bg-vg-surface px-4 py-2 text-white placeholder-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-accent/50 focus:border-vg-accent/50 transition-all";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="relative min-h-screen md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-vg-bg">
      {/* Левая панель — брендинг + пути */}
      <div className="relative hidden h-full min-h-[280px] flex-col border-r border-white/10 bg-vg-surface/60 p-10 lg:flex">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-vg-bg to-transparent" />
        <div className="relative z-10 flex items-center gap-2">
          <Shield className="h-6 w-6 text-vg-accent" />
          <span className="text-xl font-semibold text-white">CohortSec</span>
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg text-white/80">
              &ldquo;Платформа помогла защитить данные моей семьи и спокойнее чувствовать себя в сети.&rdquo;
            </p>
            <footer className="font-mono text-sm font-semibold text-vg-muted">
              — Пользователь CohortSec
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Правая панель — форма */}
      <div className="relative flex min-h-screen flex-col justify-center p-4 sm:p-6">
        <div
          aria-hidden
          className="absolute inset-0 isolate -z-10 opacity-70 pointer-events-none"
        >
          <div
            className="absolute top-0 right-0 h-80 w-40 -translate-y-1/2 rounded-full opacity-40"
            style={{
              background: "radial-gradient(68% 68% at 55% 31%, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.02) 50%, transparent 80%)",
            }}
          />
          <div
            className="absolute top-0 right-0 h-72 w-56 rounded-full opacity-30"
            style={{
              background: "radial-gradient(50% 50%, rgba(0,255,170,0.08) 0%, rgba(0,255,170,0.02) 80%, transparent 100%)",
              transform: "translate(5%, -50%)",
            }}
          />
        </div>

        <Link
          to="/"
          className="absolute top-6 left-5 inline-flex items-center text-sm text-vg-muted hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          На главную
        </Link>

        <div className="mx-auto w-full max-w-[400px] space-y-5">
          <div className="flex items-center gap-2 lg:hidden">
            <Shield className="h-6 w-6 text-vg-accent" />
            <span className="text-xl font-semibold text-white">CohortSec</span>
          </div>
          <div className="flex flex-col space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-base text-vg-muted">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

export function AuthSeparator() {
  return (
    <div className="flex w-full items-center gap-2">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-xs text-vg-muted">или</span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function AuthInput({
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  icon: Icon,
  id,
  autoComplete,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  id?: string;
  autoComplete?: string;
}) {
  return (
    <div className="relative h-max">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={Icon ? `${inputBase} pl-10` : inputBase}
      />
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-vg-muted">
          <Icon className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

export { Button };
