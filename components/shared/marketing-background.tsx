import { cn } from "@/lib/utils";

interface MarketingBackgroundProps {
  /**
   * `ambient` (default) — a soft top-down wash used by most marketing pages.
   * `hero` — adds two blur orbs behind the hero for higher-attention pages
   * (pricing, homepage reference).
   */
  variant?: "ambient" | "hero";
  className?: string;
}

/**
 * Shared ambient background for marketing pages. Replaces per-page
 * `bg-gradient-to-b from-primary/5 via-background to-background` drift and
 * keeps the hero wash consistent site-wide.
 *
 * Usage:
 *   <div className="min-h-screen relative">
 *     <MarketingBackground />
 *     <main>...</main>
 *   </div>
 */
export function MarketingBackground({
  variant = "ambient",
  className,
}: MarketingBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-10",
        variant === "hero" ? "h-[720px]" : "h-[540px]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-primary/3 to-transparent" />
      {variant === "hero" && (
        <>
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </>
      )}
    </div>
  );
}
