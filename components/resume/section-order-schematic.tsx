"use client";

import { cn } from "@/lib/utils";

/**
 * Tiny stacked-rectangles schematic showing the position of the Skills block
 * relative to a resume's other sections. Used in the SkillsForm segmented
 * control and the TemplateCustomizer Layout section to communicate at a
 * glance what "Skills first" means.
 *
 * The shape renders with pure CSS (no assets) and respects the caller's
 * accent color via CSS custom properties.
 */

export interface SectionOrderSchematicProps {
  order: "experience-first" | "skills-first";
  /** Controls padding and rectangle sizing. */
  size?: "sm" | "md";
  /** When true, the Skills rectangle is rendered in the accent color. */
  highlighted?: boolean;
  /** Dim the whole schematic (used for disabled/unsupported state). */
  muted?: boolean;
  className?: string;
}

export function SectionOrderSchematic({
  order,
  size = "sm",
  highlighted = true,
  muted = false,
  className,
}: SectionOrderSchematicProps) {
  const isSkillsFirst = order === "skills-first";

  // Order of bars from top to bottom. Each entry is either "exp" | "skills" |
  // "other". "other" bars just represent visual context (education, summary).
  const bars: Array<"exp" | "skills" | "other"> = isSkillsFirst
    ? ["other", "skills", "exp", "exp", "other"]
    : ["other", "exp", "exp", "skills", "other"];

  const barSizes = {
    sm: "h-[3px]",
    md: "h-[5px]",
  } as const;

  const gap = {
    sm: "gap-[3px]",
    md: "gap-[5px]",
  } as const;

  const box = {
    sm: "w-10 p-1.5",
    md: "w-16 p-2",
  } as const;

  return (
    <div
      className={cn(
        "flex flex-col rounded-[3px] bg-background/60 ring-1 ring-border/60 shrink-0",
        box[size],
        gap[size],
        muted && "opacity-50",
        className
      )}
      aria-hidden="true"
    >
      {bars.map((kind, i) => {
        const isSkills = kind === "skills";
        const isOther = kind === "other";
        return (
          <span
            key={i}
            className={cn(
              "block rounded-[1.5px] w-full",
              barSizes[size],
              isSkills && highlighted
                ? "bg-[var(--schematic-accent,theme(colors.primary.DEFAULT))]"
                : isSkills
                  ? "bg-foreground/60"
                  : isOther
                    ? "bg-muted-foreground/25"
                    : "bg-muted-foreground/45",
              // Shorter lengths for variety — "other" bars are narrower to
              // feel like secondary sections.
              isOther && "w-[70%]",
              !isSkills && !isOther && "w-[88%]"
            )}
          />
        );
      })}
    </div>
  );
}
