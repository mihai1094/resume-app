"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

type UpgradeReason = "credits_exhausted" | "premium_feature" | "storage_limit" | "general";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: UpgradeReason;
  featureName?: string;
  creditsRemaining?: number;
  resetDate?: string;
}

const UPGRADE_CONTENT: Record<UpgradeReason, { title: string; description: string }> = {
  credits_exhausted: {
    title: "You've used all your AI credits",
    description: "Upgrade to Premium for unlimited AI-powered features and never run out of credits again.",
  },
  premium_feature: {
    title: "Unlock Premium Features",
    description: "This feature is available for Premium members. Upgrade to access advanced AI capabilities.",
  },
  storage_limit: {
    title: "Storage Limit Reached",
    description: "You've reached the maximum number of resumes on the free plan. Upgrade for unlimited storage.",
  },
  general: {
    title: "Upgrade to Premium",
    description: "Get unlimited access to all AI features and take your career to the next level.",
  },
};

const PREMIUM_BENEFITS = [
  "Unlimited AI credits every month",
  "Unlimited resumes and cover letters",
  "All templates included",
  "Basic AI writing tools",
  "PDF + JSON export",
  "Priority support",
];

export function UpgradeModal({
  open,
  onOpenChange,
  reason = "general",
  featureName,
  creditsRemaining,
  resetDate,
}: UpgradeModalProps) {
  const content = UPGRADE_CONTENT[reason];
  const resetDateFormatted = resetDate
    ? new Date(resetDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">
            {featureName ? `${featureName} is a Premium feature` : content.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {/* Credit exhaustion specific info */}
        {reason === "credits_exhausted" && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">
                {creditsRemaining ?? 0} credits remaining
              </span>
            </div>
            {resetDateFormatted && (
              <p className="text-sm text-muted-foreground">
                Your credits will reset on {resetDateFormatted}
              </p>
            )}
          </div>
        )}

        {/* Premium benefits */}
        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Premium includes:
          </p>
          <ul className="space-y-2">
            {PREMIUM_BENEFITS.slice(0, 4).map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg p-4 text-center space-y-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold">€12</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">Cancel anytime</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            asChild
          >
            <Link href="/pricing">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Premium
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </div>

        {/* Coming soon note */}
        <p className="text-xs text-center text-muted-foreground">
          Premium subscriptions are launching soon. Sign up to be notified!
        </p>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook for easily managing upgrade modal state
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<UpgradeReason>("general");
  const [featureName, setFeatureName] = useState<string | undefined>();

  const showUpgradeModal = (opts?: { reason?: UpgradeReason; featureName?: string }) => {
    setReason(opts?.reason ?? "general");
    setFeatureName(opts?.featureName);
    setIsOpen(true);
  };

  return {
    isOpen,
    setIsOpen,
    reason,
    featureName,
    showUpgradeModal,
  };
}
