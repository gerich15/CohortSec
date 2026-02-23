import React, { useEffect, useRef } from "react";
import { clsx } from "clsx";

interface FlowFieldBackgroundProps {
  className?: string;
  /** Цвет частиц. Если не задан — градиент из трёх цветов проекта (синий, мятный, фиолетовый). */
  color?: string;
  /** Непрозрачность «следа» при перерисовке (0–1). Меньше = длиннее следы. */
  trailOpacity?: number;
  /** Количество частиц. */
  particleCount?: number;
  /** Множитель скорости. */
  speed?: number;
}

// Цвета проекта: vg-accent #3B82F6, mint #00FFAA, purple #8B5CF6
const GRADIENT_COLORS = [
  { r: 59, g: 130, b: 246 },   // #3B82F6
  { r: 0, g: 255, b: 170 },   // #00FFAA
  { r: 139, g: 92, b: 246 },  // #8B5CF6
];

function lerpRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number
) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function gradientColorAt(x: number, y: number, w: number, h: number): string {
  const t = (x / w + y / h) / 2; // 0..1 по диагонали
  const c =
    t < 0.5
      ? lerpRgb(GRADIENT_COLORS[0], GRADIENT_COLORS[1], t * 2)
      : lerpRgb(GRADIENT_COLORS[1], GRADIENT_COLORS[2], (t - 0.5) * 2);
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

export default function FlowFieldBackground({
  className,
  color,
  trailOpacity = 0.1,
  particleCount = 600,
  speed = 1,
}: FlowFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const useGradient = color === undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId: number;
    const mouse = { x: -1000, y: -1000 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      age: number;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      update() {
        const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;
        this.vx += Math.cos(angle) * 0.2 * speed;
        this.vy += Math.sin(angle) * 0.2 * speed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 150;
        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          this.vx -= dx * force * 0.05;
          this.vy -= dy * force * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.age++;
        if (this.age > this.life) this.reset();
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      draw(context: CanvasRenderingContext2D) {
        context.fillStyle = useGradient
          ? gradientColorAt(this.x, this.y, width, height)
          : (color ?? "#3B82F6");
        const alpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
        context.globalAlpha = alpha;
        context.fillRect(this.x, this.y, 1.5, 1.5);
      }
    }

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      particles = Array.from({ length: particleCount }, () => new Particle());
    };

    const animate = () => {
      ctx.fillStyle = `rgba(10, 10, 15, ${trailOpacity})`;
      ctx.fillRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    init();
    animate();
    window.addEventListener("resize", handleResize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, useGradient, trailOpacity, particleCount, speed]);

  return (
    <div
      ref={containerRef}
      className={clsx("relative w-full h-full min-h-screen overflow-hidden bg-vg-bg", className)}
    >
      <canvas ref={canvasRef} className="block w-full h-full" aria-hidden />
    </div>
  );
}
