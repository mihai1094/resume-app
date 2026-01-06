"use client";

import { useState, useCallback } from "react";
import { useAICredits, AIOperation } from "@/hooks/use-ai-credits";
import { UpgradeModal } from "./upgrade-modal";
import { isPremiumOnlyFeature, getCreditCost } from "@/lib/config/credits";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Zap, Lock } from "lucide-react";

interface CreditCheckProps {
  operation: AIOperation;
  children: React.ReactNode;
  onInsufficientCredits?: () => void;
}

/**
 * Wraps a child element and shows credit cost on hover.
 * Does NOT prevent clicks - use useCreditGate for that.
 */
export function CreditCheck({ operation, children }: CreditCheckProps) {
  const { canUseCredits, isPremium, status } = useAICredits();
  const creditCost = getCreditCost(operation);
  const isPremiumOnly = isPremiumOnlyFeature(operation);
  const hasCredits = canUseCredits(operation);

  // Premium users see no tooltip about credits
  if (isPremium) {
    return <>{children}</>;
  }

  // Show tooltip with credit cost
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top">
          {isPremiumOnly ? (
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              <span>Premium only</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" />
              <span>
                {creditCost} credit{creditCost !== 1 ? "s" : ""}
              </span>
              {!hasCredits && status && (
                <span className="text-red-400 ml-1">
                  ({status.creditsRemaining} remaining)
                </span>
              )}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Hook for gating actions behind credit checks.
 * Shows upgrade modal if insufficient credits.
 */
export function useCreditGate() {
  const { canUseCredits, useCredits, status, isPremium } = useAICredits();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<"credits_exhausted" | "premium_feature">("credits_exhausted");

  const gate = useCallback(
    async (operation: AIOperation): Promise<boolean> => {
      // Premium users always pass
      if (isPremium) return true;

      // Check if premium-only feature
      if (isPremiumOnlyFeature(operation)) {
        setUpgradeReason("premium_feature");
        setShowUpgrade(true);
        return false;
      }

      // Check credits
      if (!canUseCredits(operation)) {
        setUpgradeReason("credits_exhausted");
        setShowUpgrade(true);
        return false;
      }

      return true;
    },
    [canUseCredits, isPremium]
  );

  /**
   * Gate and deduct credits in one operation.
   * Returns true if successful, false if blocked.
   */
  const gateAndDeduct = useCallback(
    async (operation: AIOperation): Promise<boolean> => {
      const canProceed = await gate(operation);
      if (!canProceed) return false;

      const result = await useCredits(operation);
      if (!result.success) {
        // Edge case: credits depleted between check and use
        setUpgradeReason("credits_exhausted");
        setShowUpgrade(true);
        return false;
      }

      return true;
    },
    [gate, useCredits]
  );

  const UpgradeModalComponent = () => (
    <UpgradeModal
      open={showUpgrade}
      onOpenChange={setShowUpgrade}
      reason={upgradeReason}
      creditsRemaining={status?.creditsRemaining}
      resetDate={status?.resetDate}
    />
  );

  return {
    gate,
    gateAndDeduct,
    showUpgrade,
    setShowUpgrade,
    UpgradeModal: UpgradeModalComponent,
  };
}
