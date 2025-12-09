"use client";

import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiActionContract, summarizeContract } from "@/lib/ai/action-contract";
import { AiActionStatus } from "@/hooks/use-ai-action";
import { AI_LENGTH_OPTIONS, AI_TONE_OPTIONS, AiLength, AiTone } from "@/hooks/use-ai-preferences";
import { cn } from "@/lib/utils";
import { Loader2, RotateCcw } from "lucide-react";

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
}: AiPreviewSheetProps) {
  const statusBadge = getStatusBadge(status);
  const hasDiff = Boolean(previousText);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl">
        <SheetHeader className="space-y-2 text-left">
          <div className="flex items-center gap-3">
            <SheetTitle>{title}</SheetTitle>
            {statusBadge && (
              <Badge variant="outline" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
            )}
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
            <div className={cn("p-4 space-y-3", hasDiff && "grid gap-4 sm:grid-cols-2")}>
              {hasDiff && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>Current</span>
                  </div>
                  <Textarea readOnly value={previousText} className="min-h-[360px] font-mono text-sm" />
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>AI suggestion</span>
                  {status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
                <Textarea
                  readOnly
                  value={suggestion || "No suggestion yet"}
                  className="min-h-[360px] font-mono text-sm"
                />
              </div>
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
              <Button type="button" size="sm" onClick={onApply} disabled={!suggestion || isApplying} className="gap-2">
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

