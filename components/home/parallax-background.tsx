// Static hero background — dot grid + warm radial glow. No JS, no scroll listeners.
export function ParallaxBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground) / 0.07) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Warm radial glow behind hero text */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[800px] h-[600px] rounded-full opacity-30 dark:opacity-[0.15]"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--primary) / 0.08), transparent 70%)",
        }}
      />
    </div>
  );
}
