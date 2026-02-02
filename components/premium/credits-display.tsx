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
import { Zap, Crown, Sparkles, Infinity, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Premium perks for the full display
const PREMIUM_PERKS = [
  "Unlimited AI generations",
  "Priority processing",
  "All premium templates",
];

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

  // Premium users see an elevated premium display
  if (isPremium) {
    if (variant === "pill") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="default"
                className={cn(
                  "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] animate-shimmer cursor-default",
                  className,
                )}
              >
                <Infinity className="w-3 h-3 mr-1" />
                <span>Unlimited</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="font-medium">Premium Member</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Unlimited AI credits
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (variant === "compact") {
      return (
        <div className={cn("flex items-center gap-3", className)}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-500 to-orange-500">
              <Crown className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Premium
            </span>
            <div className="w-px h-4 bg-amber-500/20" />
            <div className="flex items-center gap-1 text-amber-600">
              <Infinity className="w-4 h-4" />
              <span className="text-sm font-medium">Unlimited</span>
            </div>
          </div>
        </div>
      );
    }

    // Full variant - Premium card
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-amber-500/20",
          "bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-amber-500/5",
          className,
        )}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

        <div className="relative p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">Premium</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 border-amber-500/30 text-amber-600 bg-amber-500/10"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Infinity className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Unlimited AI Credits
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Perks */}
          <div className="space-y-1.5 pt-2 border-t border-amber-500/10">
            {PREMIUM_PERKS.map((perk) => (
              <div
                key={perk}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="w-3.5 h-3.5 text-amber-500" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Free users see credit usage
  const {
    creditsUsed,
    creditsRemaining,
    totalCredits,
    percentageUsed,
    resetDate,
  } = status;
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
            <p className="text-xs text-muted-foreground">
              Resets {resetDateFormatted}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2">
          <Zap
            className={cn(
              "w-4 h-4",
              percentageUsed >= 90 ? "text-red-500" : "text-primary",
            )}
          />
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
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              percentageUsed >= 90 ? "bg-red-500/10" : "bg-primary/10",
            )}
          >
            <Sparkles
              className={cn(
                "h-5 w-5",
                percentageUsed >= 90 ? "text-red-500" : "text-primary",
              )}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              AI Credits
            </p>
            <p className="text-xl font-bold">
              {creditsRemaining}
              <span className="text-sm text-muted-foreground font-normal">
                {" "}
                / {totalCredits}
              </span>
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
