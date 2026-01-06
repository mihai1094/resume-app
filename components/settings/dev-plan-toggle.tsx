"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAICredits } from "@/hooks/use-ai-credits";
import { useUser } from "@/hooks/use-user";
import { shouldShowDevTools } from "@/lib/config/admin";
import { FREE_TIER_LIMITS } from "@/lib/config/credits";
import { Crown, Zap, RefreshCw, Bug } from "lucide-react";
import { toast } from "sonner";

export function DevPlanToggle() {
  const { user } = useUser();
  const { status, isPremium, plan, resetUserCredits, switchPlan, refreshStatus, isLoading } = useAICredits();
  const [isSwitching, setIsSwitching] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Only show for admin users or in development
  if (!shouldShowDevTools(user?.email)) {
    return null;
  }

  const handlePlanSwitch = async () => {
    setIsSwitching(true);
    try {
      const newPlan = isPremium ? "free" : "premium";
      await switchPlan(newPlan);
      toast.success(`Switched to ${newPlan === "premium" ? "Premium" : "Free"} plan`);
    } catch (err) {
      toast.error("Failed to switch plan");
    } finally {
      setIsSwitching(false);
    }
  };

  const handleResetCredits = async () => {
    setIsResetting(true);
    try {
      await resetUserCredits();
      await refreshStatus();
      toast.success("Credits reset to 0");
    } catch (err) {
      toast.error("Failed to reset credits");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="border-amber-500/50 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Bug className="w-5 h-5" />
          Dev Tools
        </CardTitle>
        <CardDescription>
          Admin tools for testing premium features. Only visible to admin accounts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Status</Label>
          <div className="flex items-center gap-3">
            <Badge variant={isPremium ? "default" : "secondary"} className="uppercase">
              {isPremium ? (
                <><Crown className="w-3 h-3 mr-1" /> Premium</>
              ) : (
                "Free"
              )}
            </Badge>
            {status && !isPremium && (
              <span className="text-sm text-muted-foreground">
                {status.creditsUsed} / {FREE_TIER_LIMITS.monthlyAICredits} credits used
              </span>
            )}
            {isPremium && (
              <span className="text-sm text-muted-foreground">
                Unlimited credits
              </span>
            )}
          </div>
        </div>

        {/* Plan Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="plan-toggle" className="text-sm font-medium">
              Premium Plan
            </Label>
            <p className="text-sm text-muted-foreground">
              Toggle between Free and Premium for testing
            </p>
          </div>
          <Switch
            id="plan-toggle"
            checked={isPremium}
            onCheckedChange={handlePlanSwitch}
            disabled={isSwitching || isLoading}
          />
        </div>

        {/* Reset Credits Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Reset Credits</Label>
            <p className="text-sm text-muted-foreground">
              Reset AI credits to 0 for testing exhaustion
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCredits}
            disabled={isResetting || isLoading}
          >
            {isResetting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Reset
          </Button>
        </div>

        {/* Credit Details */}
        {status && (
          <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono space-y-1">
            <p>Plan: {plan}</p>
            <p>Credits Used: {status.creditsUsed}</p>
            <p>Credits Remaining: {status.isPremium ? "∞" : status.creditsRemaining}</p>
            <p>Reset Date: {new Date(status.resetDate).toLocaleDateString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
