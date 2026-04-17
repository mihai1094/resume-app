"use client";

/**
 * BulletProofMarks — margin-only, typographic feedback for bullet writing.
 *
 * Replaces the decorative bullet dot with 5 tiny stacked ticks (one per
 * trait: verb · metric · specific · concise · active). Filled = pass,
 * ghosted = fail. No labels, no color, no chrome, no hover reveal.
 *
 * Design rules:
 *  - Lives in the left gutter, never in the content flow
 *  - Collapses back to a single dot when the bullet is empty, too short,
 *    or already strong on every trait — the marks only appear when there
 *    is something worth noticing
 *  - Monochromatic on purpose; the warmth of the palette is reserved for
 *    things the user needs to act on (errors, primary CTAs)
 *  - Native `title` carries the full breakdown for keyboard / pointer
 *    discovery — no popover, no portal, no layout shift
 */

import type { Tip } from "@/hooks/use-bullet-tips";
import { cn } from "@/lib/utils";

type TraitId = "verb" | "metric" | "specific" | "concise" | "active";

interface Trait {
  id: TraitId;
  label: string;
  passed: boolean;
}

interface BulletProofMarksProps {
  tips: Tip[];
  className?: string;
}

function deriveTraits(tips: Tip[]): Trait[] {
  const byId = new Map(tips.map((t) => [t.id, t]));
  const get = (id: string) => byId.get(id);
  const isSuccess = (id: string) => get(id)?.type === "success";

  const vagueOrCliche = get("vague") || get("cliche");
  const hedgingOrPassive = get("hedging") || get("passive");

  return [
    { id: "verb", label: "verb", passed: isSuccess("action-verb") },
    { id: "metric", label: "metric", passed: isSuccess("metric") },
    { id: "specific", label: "specific", passed: !vagueOrCliche },
    { id: "concise", label: "concise", passed: isSuccess("length") },
    { id: "active", label: "active", passed: !hedgingOrPassive },
  ];
}

export function BulletProofMarks({ tips, className }: BulletProofMarksProps) {
  // Bullet is empty or near-empty → render the familiar neutral dot.
  // We don't judge a bullet that hasn't been written yet.
  const isInactive =
    tips.length === 0 || (tips.length === 1 && tips[0].id === "empty");

  if (isInactive) {
    return (
      <div
        className={cn(
          "mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  const traits = deriveTraits(tips);
  const score = traits.filter((t) => t.passed).length;
  const allPassing = score === traits.length;

  // When every trait passes, collapse back to a single mark so the margin
  // stays calm. A faint solid dot reads as "all clear" without ceremony.
  if (allPassing) {
    return (
      <div
        className={cn(
          "mt-2.5 w-1.5 h-1.5 rounded-full bg-foreground/70 shrink-0",
          className
        )}
        title="Strong on verb · metric · specific · concise · active"
        aria-label="Bullet is strong on all five traits"
      />
    );
  }

  const breakdown = traits
    .map((t) => `${t.label}: ${t.passed ? "ok" : "needs work"}`)
    .join(" · ");

  return (
    <div
      className={cn(
        // Align the column so its vertical center sits near the first-line
        // baseline of the adjacent textarea. `mt-[3px]` keeps it tucked high
        // without overlapping the line above.
        "mt-[3px] flex flex-col gap-[3px] shrink-0",
        className
      )}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={traits.length}
      aria-label={`Bullet strength: ${score} of ${traits.length}`}
      title={breakdown}
    >
      {traits.map((t) => (
        <span
          key={t.id}
          aria-hidden="true"
          className={cn(
            "block h-[2px] w-[6px] rounded-[1px] transition-colors duration-200",
            t.passed ? "bg-foreground/70" : "bg-foreground/20"
          )}
        />
      ))}
    </div>
  );
}
