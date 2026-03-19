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
import {
  getCreditCost,
  isPremiumOnlyFeature,
  type AIOperation,
} from "@/lib/config/credits";

interface AiActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  status?: AiActionStatus;
  contract?: AiActionContract;
  disabledReason?: string;
  creditOperation?: AIOperation;
}

const statusVariant: Record<AiActionStatus, { label: string; tone: string }> = {
  idle: { label: "Idle", tone: "text-muted-foreground" },
  running: { label: "Thinking…", tone: "text-ai-accent" },
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
  creditOperation,
  className,
  disabled,
  ...props
}: AiActionProps) {
  const statusMeta = statusVariant[status];
  const isDisabled = disabled || !!disabledReason;
  const creditCost = creditOperation ? getCreditCost(creditOperation) : null;
  const premiumOnly = creditOperation ? isPremiumOnlyFeature(creditOperation) : false;

  const handleDisabledClick = () => {
    if (disabledReason) {
      toast.info(disabledReason);
    }
  };

  const button = (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-2 border-ai-accent/30 hover:bg-ai-accent/10", className)}
      disabled={isDisabled}
      {...props}
    >
      {icon ?? <Sparkles className="h-4 w-4 text-ai-accent" />}
      <span className="truncate">{label}</span>
      {creditCost != null && (
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] h-5 px-1.5 tabular-nums",
            premiumOnly && "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          )}
          title={`Costs ${creditCost} credit${creditCost !== 1 ? "s" : ""}`}
        >
          {premiumOnly ? `Pro • ${creditCost} cr` : `${creditCost} cr`}
        </Badge>
      )}
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
                <Sparkles className="h-4 w-4 text-ai-accent" />
                <span className="font-medium">AI Assist</span>
              </div>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              {creditCost != null && (
                <p className="text-xs text-muted-foreground">
                  {premiumOnly ? "Premium feature" : "Usage"}: {creditCost} credit
                  {creditCost !== 1 ? "s" : ""} per run
                </p>
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
