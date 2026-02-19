"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiActionContract, summarizeContract } from "@/lib/ai/action-contract";
import { AiActionStatus } from "@/hooks/use-ai-action";
import { AI_LENGTH_OPTIONS, AI_TONE_OPTIONS, AiLength, AiTone } from "@/hooks/use-ai-preferences";
import { cn } from "@/lib/utils";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";

type ToneControl = {
  value: AiTone;
  onChange: (value: AiTone) => void;
};

type LengthControl = {
  value: AiLength;
  onChange: (value: AiLength) => void;
};

export interface AiPreviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  contract?: AiActionContract;
  status: AiActionStatus;
  suggestion?: string;
  previousText?: string;
  isApplying?: boolean;
  onApply?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onDiscard?: () => void;
  toneControl?: ToneControl;
  lengthControl?: LengthControl;
  /** Custom content to render instead of the default textarea */
  children?: React.ReactNode;
}

export function AiPreviewSheet({
  open,
  onOpenChange,
  title,
  description,
  contract,
  status,
  suggestion,
  previousText,
  isApplying,
  onApply,
  onUndo,
  canUndo,
  onDiscard,
  toneControl,
  lengthControl,
  children,
}: AiPreviewSheetProps) {
  const statusBadge = getStatusBadge(status);
  const hasDiff = Boolean(previousText);
  const normalizedPreviousText = previousText?.trim() ?? "";
  const normalizedSuggestion = suggestion?.trim() ?? "";
  const hasSuggestion = normalizedSuggestion.length > 0;
  const currentWords = countWords(normalizedPreviousText);
  const suggestionWords = countWords(normalizedSuggestion);
  const wordsDelta = suggestionWords - currentWords;
  const diffPreview = React.useMemo(() => {
    if (!hasDiff || !hasSuggestion) return null;
    return computeWordDiff(normalizedPreviousText, normalizedSuggestion);
  }, [hasDiff, hasSuggestion, normalizedPreviousText, normalizedSuggestion]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <SheetTitle>{title}</SheetTitle>
            {statusBadge && (
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
            )}
          </div>
          <SheetDescription className={description ? undefined : "sr-only"}>
            {description || "Review the AI suggestion before applying changes."}
          </SheetDescription>
          <p className="text-xs text-muted-foreground">{summarizeContract(contract)}</p>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {toneControl && (
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <Select
                  value={toneControl.value}
                  onValueChange={(value) => toneControl.onChange(value as AiTone)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {lengthControl && (
              <div className="space-y-1.5">
                <Label>Length</Label>
                <Select
                  value={lengthControl.value}
                  onValueChange={(value) => lengthControl.onChange(value as AiLength)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_LENGTH_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <ScrollArea className="h-[420px] rounded-md border">
            <div className={cn("p-4 space-y-4", hasDiff && !children && "lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0")}>
                {hasDiff && (
                  <section className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-sm font-medium">
                      <span>Current</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-medium tabular-nums">
                          {currentWords} words
                        </Badge>
                        {diffPreview && diffPreview.removedCount > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium text-red-700 border-red-300"
                          >
                            -{diffPreview.removedCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="max-h-[42vh] overflow-y-auto rounded-md border bg-background p-3">
                      {diffPreview ? (
                        <DiffText parts={diffPreview.currentParts} highlightType="removed" />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {normalizedPreviousText || "No current text."}
                        </p>
                      )}
                    </div>
                  </section>
                )}
                <section className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>AI suggestion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasSuggestion && (
                        <Badge variant="secondary" className="text-[10px] font-medium tabular-nums">
                          {suggestionWords} words
                        </Badge>
                      )}
                      {diffPreview && diffPreview.addedCount > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium text-emerald-700 border-emerald-300"
                        >
                          +{diffPreview.addedCount}
                        </Badge>
                      )}
                      {hasDiff && hasSuggestion && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-medium tabular-nums",
                            wordsDelta > 0 && "text-emerald-700 border-emerald-300",
                            wordsDelta < 0 && "text-amber-700 border-amber-300",
                            wordsDelta === 0 && "text-muted-foreground"
                          )}
                        >
                          {wordsDelta > 0 ? `+${wordsDelta}` : wordsDelta} words
                        </Badge>
                      )}
                      {status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    </div>
                  </div>
                  <div className="max-h-[42vh] overflow-y-auto rounded-md border bg-background p-3">
                    {hasSuggestion ? (
                      diffPreview ? (
                        <DiffText parts={diffPreview.suggestionParts} highlightType="added" />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {normalizedSuggestion}
                        </p>
                      )
                    ) : status === "running" ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Generating suggestion...
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No suggestion yet.</p>
                    )}
                  </div>
                </section>
              {children && <div className="col-span-full">{children}</div>}
            </div>
          </ScrollArea>

          <div className="flex flex-wrap gap-2 justify-end">
            {onUndo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Undo
              </Button>
            )}
            {onDiscard && (
              <Button type="button" variant="secondary" size="sm" onClick={onDiscard}>
                Discard
              </Button>
            )}
            {onApply && (
              <Button type="button" size="sm" onClick={onApply} disabled={!hasSuggestion || isApplying} className="gap-2">
                {isApplying && <Loader2 className="h-4 w-4 animate-spin" />}
                Apply
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

type DiffPart = {
  value: string;
  type: "equal" | "added" | "removed";
};

function DiffText({
  parts,
  highlightType,
}: {
  parts: DiffPart[];
  highlightType: "added" | "removed";
}) {
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {parts.map((part, index) => (
        <React.Fragment key={`${part.value}-${index}`}>
          {index > 0 && " "}
          <span
            className={cn(
              part.type === highlightType &&
                highlightType === "added" &&
                "bg-emerald-100 text-emerald-800 rounded px-0.5",
              part.type === highlightType &&
                highlightType === "removed" &&
                "bg-red-100 text-red-800 rounded px-0.5 line-through"
            )}
          >
            {part.value}
          </span>
        </React.Fragment>
      ))}
    </p>
  );
}

function computeWordDiff(currentText: string, suggestionText: string): {
  currentParts: DiffPart[];
  suggestionParts: DiffPart[];
  addedCount: number;
  removedCount: number;
} {
  const currentTokens = currentText.split(/\s+/).filter(Boolean);
  const suggestionTokens = suggestionText.split(/\s+/).filter(Boolean);

  const n = currentTokens.length;
  const m = suggestionTokens.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array.from({ length: m + 1 }, () => 0)
  );

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      if (currentTokens[i] === suggestionTokens[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const currentParts: DiffPart[] = [];
  const suggestionParts: DiffPart[] = [];
  let addedCount = 0;
  let removedCount = 0;
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (currentTokens[i] === suggestionTokens[j]) {
      const token = currentTokens[i];
      currentParts.push({ value: token, type: "equal" });
      suggestionParts.push({ value: token, type: "equal" });
      i += 1;
      j += 1;
      continue;
    }

    if (dp[i + 1][j] >= dp[i][j + 1]) {
      currentParts.push({ value: currentTokens[i], type: "removed" });
      removedCount += 1;
      i += 1;
    } else {
      suggestionParts.push({ value: suggestionTokens[j], type: "added" });
      addedCount += 1;
      j += 1;
    }
  }

  while (i < n) {
    currentParts.push({ value: currentTokens[i], type: "removed" });
    removedCount += 1;
    i += 1;
  }

  while (j < m) {
    suggestionParts.push({ value: suggestionTokens[j], type: "added" });
    addedCount += 1;
    j += 1;
  }

  return {
    currentParts,
    suggestionParts,
    addedCount,
    removedCount,
  };
}

function getStatusBadge(
  status: AiActionStatus
): { label: string; className?: string } | null {
  switch (status) {
    case "running":
      return { label: "Thinking", className: "text-primary border-primary/50" };
    case "ready":
      return { label: "Ready", className: "text-emerald-600 border-emerald-200" };
    case "applied":
      return { label: "Applied", className: "text-emerald-600 border-emerald-200" };
    case "error":
      return { label: "Error", className: "text-destructive border-destructive/40" };
    default:
      return null;
  }
}
