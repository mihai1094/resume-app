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

interface AiActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  status?: AiActionStatus;
  contract?: AiActionContract;
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
  className,
  ...props
}: AiActionProps) {
  const statusMeta = statusVariant[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
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
        </TooltipTrigger>
        <TooltipContent className="max-w-xs space-y-1">
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
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


