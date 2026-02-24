import { clsx } from "clsx";

/** Dotted grid background in project colors (#00FFAA, #3B82F6, #8B5CF6). */
export function DottedSurface({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={clsx("relative min-h-screen", className)}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: "var(--vg-bg)",
          backgroundImage: `
            radial-gradient(circle, rgba(0, 255, 170, 0.28) 1.5px, transparent 1.5px),
            radial-gradient(circle, rgba(59, 130, 246, 0.2) 1.5px, transparent 1.5px),
            radial-gradient(circle, rgba(139, 92, 246, 0.12) 1.5px, transparent 1.5px)
          `,
          backgroundSize: "24px 24px, 32px 32px, 40px 40px",
          backgroundPosition: "0 0, 8px 8px, 16px 16px",
        }}
        aria-hidden
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 left-1/2 z-0 size-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,255,170,0.12),transparent_50%)] blur-[40px]"
      />
      {children}
    </div>
  );
}
