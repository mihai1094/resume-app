"use client";

import { useAICredits } from "@/hooks/use-ai-credits";
import { useUser } from "@/hooks/use-user";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CreditsDisplayProps {
  variant?: "compact" | "full" | "pill";
  showUpgrade?: boolean;
  className?: string;
}

export function CreditsDisplay({
  variant = "compact",
  showUpgrade = true,
  className,
}: CreditsDisplayProps) {
  const { user } = useUser();
  const { status, isPremium, isLoading } = useAICredits();

  if (!user || isLoading || !status) {
    return null;
  }

  // Premium users see a simple badge
  if (isPremium) {
    if (variant === "pill") {
      return (
        <Badge variant="default" className={cn("bg-gradient-to-r from-amber-500 to-orange-500", className)}>
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      );
    }

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
        <span className="text-sm text-muted-foreground">Unlimited AI</span>
      </div>
    );
  }

  // Free users see credit usage
  const { creditsUsed, creditsRemaining, totalCredits, percentageUsed, resetDate } = status;
  const resetDateFormatted = new Date(resetDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Color based on usage
  const getProgressColor = () => {
    if (percentageUsed >= 90) return "bg-red-500";
    if (percentageUsed >= 70) return "bg-amber-500";
    return "bg-primary";
  };

  if (variant === "pill") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={percentageUsed >= 90 ? "destructive" : "secondary"}
              className={cn("cursor-help", className)}
            >
              <Zap className="w-3 h-3 mr-1" />
              {creditsRemaining}/{totalCredits}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI Credits: {creditsRemaining} remaining</p>
            <p className="text-xs text-muted-foreground">Resets {resetDateFormatted}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2">
          <Zap className={cn("w-4 h-4", percentageUsed >= 90 ? "text-red-500" : "text-primary")} />
          <span className="text-sm font-medium">
            {creditsRemaining}/{totalCredits}
          </span>
        </div>
        <div className="w-20">
          <Progress value={100 - percentageUsed} className="h-2" />
        </div>
        {showUpgrade && creditsRemaining < 10 && (
          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
            <Link href="/pricing">Upgrade</Link>
          </Button>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn("bg-card border rounded-xl p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center",
            percentageUsed >= 90 ? "bg-red-500/10" : "bg-primary/10"
          )}>
            <Sparkles className={cn("h-5 w-5",
              percentageUsed >= 90 ? "text-red-500" : "text-primary"
            )} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">AI Credits</p>
            <p className="text-xl font-bold">
              {creditsRemaining}
              <span className="text-sm text-muted-foreground font-normal"> / {totalCredits}</span>
            </p>
          </div>
        </div>
        {showUpgrade && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/pricing">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <Progress value={100 - percentageUsed} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Resets {resetDateFormatted}
        </p>
      </div>

      {percentageUsed >= 90 && (
        <p className="text-xs text-red-500">
          Running low on credits! Upgrade for unlimited AI features.
        </p>
      )}
    </div>
  );
}
