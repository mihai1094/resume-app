"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  SuggestedSkill,
  SuggestedSkillSource,
} from "@/lib/ai/content-types";

const DEMONSTRABLE_SOURCES: readonly SuggestedSkillSource[] = [
  "experience",
  "projects",
  "certifications",
];

export function isDemonstrable(source: SuggestedSkillSource): boolean {
  return DEMONSTRABLE_SOURCES.includes(source);
}

export interface SkillSuggestionCardProps {
  suggestion: SuggestedSkill;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  /** Stable DOM id — used to wire checkbox + label. */
  id: string;
}

/**
 * A single skill suggestion row with checkbox, name, relevance, citation, and
 * collapsible reason. Left border is warm amber for demonstrable skills
 * (experience/projects/certs) and neutral for aspirational ones.
 */
export function SkillSuggestionCard({
  suggestion,
  checked,
  disabled,
  onToggle,
  id,
}: SkillSuggestionCardProps) {
  const [showReason, setShowReason] = React.useState(false);
  const demonstrable = isDemonstrable(suggestion.source);
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;
  const reasonId = `${id}-reason`;

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg border bg-card pl-4 pr-3 py-2.5 transition-colors",
        "hover:bg-muted/30",
        demonstrable
          ? "border-l-[3px] border-l-amber-400/70"
          : "border-l border-l-border",
        checked && "bg-primary/[0.04] border-primary/25",
        disabled && "opacity-60"
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={() => onToggle()}
        aria-labelledby={labelId}
        aria-describedby={suggestion.citedFrom ? descId : undefined}
        className="mt-1 shrink-0"
      />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <label
            id={labelId}
            htmlFor={id}
            className="font-medium text-sm leading-tight cursor-pointer"
          >
            {suggestion.name}
          </label>
          <RelevanceDot relevance={suggestion.relevance} />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
            {suggestion.category}
          </span>
          {suggestion.pairedWith && (
            <span className="text-[10px] text-amber-800/80 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">
              pairs with {suggestion.pairedWith}
            </span>
          )}
        </div>
        {suggestion.citedFrom && (
          <p
            id={descId}
            className="font-serif italic text-[13px] leading-snug text-muted-foreground/80"
          >
            From {suggestion.citedFrom}
          </p>
        )}
        <div>
          <button
            type="button"
            onClick={() => setShowReason((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-expanded={showReason}
            aria-controls={reasonId}
          >
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform",
                showReason && "rotate-180"
              )}
            />
            {showReason ? "Hide reason" : "Why this skill"}
          </button>
          {showReason && (
            <p
              id={reasonId}
              className="text-xs text-muted-foreground leading-relaxed pt-1"
            >
              {suggestion.reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RelevanceDot({ relevance }: { relevance: "high" | "medium" }) {
  return (
    <span
      role="img"
      aria-label={relevance === "high" ? "High relevance" : "Medium relevance"}
      title={relevance === "high" ? "High relevance" : "Medium relevance"}
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        relevance === "high" ? "bg-amber-400" : "bg-muted-foreground/30"
      )}
    />
  );
}
