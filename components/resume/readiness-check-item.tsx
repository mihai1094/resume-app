"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ReadinessCheck } from "@/lib/services/resume-readiness";

interface ReadinessCheckItemProps {
  check: ReadinessCheck;
  onFix?: (sectionId: string) => void;
  onDismiss?: () => void;
  index?: number;
}

export function ReadinessCheckItem({ check, onFix, onDismiss, index = 0 }: ReadinessCheckItemProps) {
  const statusConfig = {
    pass: {
      icon: CheckCircle2,
      iconClass: "text-green-500",
      bgClass: "bg-green-500/5 border-green-500/20 hover:bg-green-500/10",
    },
    fail: {
      icon: XCircle,
      iconClass: "text-red-500",
      bgClass: "bg-red-500/5 border-red-500/20 hover:bg-red-500/10",
    },
    warning: {
      icon: AlertCircle,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10",
    },
  };

  const config = statusConfig[check.status];
  const Icon = config.icon;

  return (
    <motion.div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
        config.bgClass
      )}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconClass)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{check.label}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{check.message}</p>
        {check.detail && (
          <p className="text-xs text-muted-foreground/70 mt-0.5">{check.detail}</p>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {check.status !== 'pass' && check.fixAction && onFix && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onFix(check.fixAction!.sectionId)}
          >
            {check.fixAction.label}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        )}
        {check.status !== 'pass' && onDismiss && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={onDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Dismiss this tip</TooltipContent>
          </Tooltip>
        )}
      </div>
    </motion.div>
  );
}
