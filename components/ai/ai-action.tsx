"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { summarizeContract, AiActionContract } from "@/lib/ai/action-contract";
import { Loader2, Sparkles } from "lucide-react";
import { AiActionStatus } from "@/hooks/use-ai-action";
import { toast } from "sonner";

interface AiActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  status?: AiActionStatus;
  contract?: AiActionContract;
  disabledReason?: string;
}

const statusVariant: Record<AiActionStatus, { label: string; tone: string }> = {
  idle: { label: "Idle", tone: "text-muted-foreground" },
  running: { label: "Thinking…", tone: "text-primary" },
  ready: { label: "Ready", tone: "text-emerald-600" },
  applied: { label: "Applied", tone: "text-emerald-600" },
  error: { label: "Error", tone: "text-destructive" },
};

export function AiAction({
  label,
  description,
  icon,
  status = "idle",
  contract,
  disabledReason,
  className,
  disabled,
  ...props
}: AiActionProps) {
  const statusMeta = statusVariant[status];
  const isDisabled = disabled || !!disabledReason;

  const handleDisabledClick = () => {
    if (disabledReason) {
      toast.info(disabledReason);
    }
  };

  const button = (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-2", className)}
      disabled={isDisabled}
      {...props}
    >
      {icon ?? <Sparkles className="h-4 w-4" />}
      <span className="truncate">{label}</span>
      {status !== "idle" && (
        <Badge
          variant="outline"
          className={cn("text-[10px] font-medium", statusMeta.tone)}
        >
          {statusMeta.label}
        </Badge>
      )}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Wrap in span when disabled so tooltip can still trigger on hover, and tap shows toast on mobile */}
          {isDisabled ? (
            <span
              className="inline-block cursor-not-allowed"
              onClick={handleDisabledClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleDisabledClick();
                }
              }}
            >
              {button}
            </span>
          ) : (
            button
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1">
          {isDisabled && disabledReason ? (
            <p className="text-sm">{disabledReason}</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">AI Assist</span>
              </div>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {summarizeContract(contract)}
              </p>
            </>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
