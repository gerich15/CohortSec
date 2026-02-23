import { useEffect, useRef } from "react";

export default function ParticleFieldPurple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let id: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * 500,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: 0.3 + Math.random() * 0.4,
      });
    }

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles.forEach((p) => {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      });
    };

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const d = Math.hypot(mx - p.x, my - p.y);
        const infl = Math.max(0, 1 - d / 300);
        const alpha = Math.min(1, p.a + infl * 0.6);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + infl * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${alpha})`;
        ctx.fill();

        particles.slice(i + 1).forEach((p2) => {
          const d2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d2 < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.15 * (1 - d2 / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      id = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
