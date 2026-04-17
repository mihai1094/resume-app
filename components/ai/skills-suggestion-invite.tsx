"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  getCreditCost,
  type AIOperation,
} from "@/lib/config/credits";

const DISMISSAL_KEY = "rz:skills-invite-dismissed";
const OPERATION: AIOperation = "suggest-skills";

export interface SkillsSuggestionInviteProps {
  /** Triggered when the user accepts the invite. */
  onAccept: () => void;
  /** Whether to disable the accept action (e.g. while loading). */
  disabled?: boolean;
  /** Optional className for the outer container. */
  className?: string;
}

/**
 * Empty-state invitation shown in place of the removed auto-fetch.
 * Warm cream card with serif headline; dismissible, remembered forever
 * unless the user resets via AI preferences.
 */
export function SkillsSuggestionInvite({
  onAccept,
  disabled,
  className,
}: SkillsSuggestionInviteProps) {
  const { value: dismissed, setValue: setDismissed } = useLocalStorage(
    DISMISSAL_KEY,
    false
  );
  const creditCost = getCreditCost(OPERATION);

  if (dismissed) return null;

  return (
    <aside
      className={cn(
        "relative rounded-2xl border border-primary/15 bg-primary/[0.03]",
        "px-4 py-3.5 sm:px-5 sm:py-4",
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4",
        className
      )}
      aria-labelledby="skills-invite-heading"
    >
      {/* Left accent bar — warm amber */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-gradient-to-b from-amber-400/70 via-primary/50 to-primary/20"
      />

      <div className="flex items-start gap-3 flex-1 pl-2">
        <span
          aria-hidden="true"
          className="shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-100/60 text-amber-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="space-y-1">
          <p
            id="skills-invite-heading"
            className="font-serif text-[15px] leading-snug text-foreground/90 tracking-tight"
          >
            Let me read your work history and suggest skills you&rsquo;ve actually
            demonstrated.
          </p>
          <p className="text-xs text-muted-foreground/80">
            One suggestion per bullet point &middot; cites the exact role it came
            from &middot; never duplicates what you have.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 sm:justify-end">
        <Button
          type="button"
          size="sm"
          onClick={onAccept}
          disabled={disabled}
          className="h-8 px-3 text-xs gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Try it &middot; {creditCost} cr
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-8 px-2 text-xs text-muted-foreground/70 hover:text-foreground"
        >
          Not now
        </Button>
      </div>
    </aside>
  );
}
