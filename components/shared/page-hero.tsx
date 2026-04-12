import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PageHeroProps {
  /** Optional eyebrow badge above the headline (e.g., "AI Resume Builder"). */
  eyebrow?: {
    icon?: LucideIcon;
    label: string;
  };
  /**
   * Main headline. A plain string renders as-is; pass a `ReactNode` to apply
   * italic-coral emphasis on part of the title (e.g.
   * `<>Start free. <HeroAccent>Upgrade only when you need to.</HeroAccent></>`).
   */
  title: React.ReactNode;
  /** Optional descriptive paragraph under the headline. */
  description?: React.ReactNode;
  /** Optional footnote rendered below the CTAs (e.g., "Last verified…"). */
  footnote?: React.ReactNode;
  /** CTA buttons (Link-wrapped Button elements typically). */
  actions?: React.ReactNode;
  /** Max width for the column. Defaults to `max-w-4xl`. */
  maxWidth?: string;
  className?: string;
}

/**
 * Italic-coral accent for hero headlines. Matches the homepage pattern
 * (`<span className="text-primary italic">…</span>`) so every marketing
 * headline uses the same emphasis style.
 */
export function HeroAccent({ children }: { children: React.ReactNode }) {
  return <span className="text-primary italic">{children}</span>;
}

/**
 * Shared marketing hero layout. Eliminates the per-page drift of
 * `Badge + h1 (serif) + subhead + CTA row` across pricing, ai-resume-builder,
 * vs/[competitor], templates/[id], and friends.
 *
 * Typography is locked: `font-serif font-medium tracking-tight` headlines at
 * `text-4xl md:text-5xl`. Use `<HeroAccent>` inside `title` for emphasis.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  footnote,
  actions,
  maxWidth = "max-w-4xl",
  className,
}: PageHeroProps) {
  const EyebrowIcon = eyebrow?.icon;
  return (
    <section
      className={cn(
        "mx-auto space-y-6 text-center",
        maxWidth,
        className
      )}
    >
      {eyebrow && (
        <Badge variant="secondary" className="gap-1">
          {EyebrowIcon && <EyebrowIcon className="w-3 h-3" />}
          {eyebrow.label}
        </Badge>
      )}
      <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.08]">
        {title}
      </h1>
      {description && (
        <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto">
          {description}
        </p>
      )}
      {actions && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actions}
        </div>
      )}
      {footnote && (
        <p className="text-sm text-muted-foreground">{footnote}</p>
      )}
    </section>
  );
}
