"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuantificationSuggestion } from "@/lib/ai/content-types";
import { authPost } from "@/lib/api/auth-fetch";

interface UseBulletAIProps {
  expId: string;
  bulletIndex: number;
  bullet: string;
  onUpdate: (newValue: string) => void;
}

export function useBulletAI({ expId, bulletIndex, bullet, onUpdate }: UseBulletAIProps) {
  const [isImproving, setIsImproving] = useState(false);
  const [isQuantifying, setIsQuantifying] = useState(false);
  const [improveDialogOpen, setImproveDialogOpen] = useState(false);
  const [improveResult, setImproveResult] = useState<{ improvedVersion: string; suggestions: string[] } | null>(null);
  const [quantifyDialogOpen, setQuantifyDialogOpen] = useState(false);
  const [quantifySuggestions, setQuantifySuggestions] = useState<QuantificationSuggestion[]>([]);

  const handleImprove = useCallback(async () => {
    if (bullet.trim().length < 10) {
      toast.error("Bullet point must be at least 10 characters to improve");
      return;
    }

    setIsImproving(true);
    try {
      const response = await authPost("/api/ai/improve-bullet", {
        bulletPoint: bullet,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to improve bullet");
      }

      const data = await response.json();
      setImproveResult(data.result);
      setImproveDialogOpen(true);

      if (data.meta.fromCache) {
        toast.success("Improved version loaded from cache! ⚡");
      } else {
        toast.success("Bullet point improved! ✨");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to improve bullet. Please try again."
      );
    } finally {
      setIsImproving(false);
    }
  }, [bullet]);

  const handleQuantify = useCallback(async () => {
    if (bullet.trim().length < 10) {
      toast.error("Bullet point must be at least 10 characters to quantify");
      return;
    }

    setIsQuantifying(true);
    try {
      const response = await authPost("/api/ai/quantify-achievement", {
        statement: bullet,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to quantify achievement");
      }

      const data = await response.json();
      setQuantifySuggestions(data.suggestions);
      setQuantifyDialogOpen(true);

      if (data.meta.fromCache) {
        toast.success("Quantification suggestions loaded from cache! ⚡");
      } else {
        toast.success("Generated quantification suggestions! ✨");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to quantify achievement. Please try again."
      );
    } finally {
      setIsQuantifying(false);
    }
  }, [bullet]);

  const applyImproved = useCallback(() => {
    if (!improveResult) return;
    onUpdate(improveResult.improvedVersion);
    setImproveDialogOpen(false);
    setImproveResult(null);
    toast.success("Bullet point updated!");
  }, [improveResult, onUpdate]);

  const applyQuantified = useCallback((suggestion: QuantificationSuggestion) => {
    onUpdate(suggestion.example);
    setQuantifyDialogOpen(false);
    setQuantifySuggestions([]);
    toast.success("Bullet point updated with metrics!");
  }, [onUpdate]);

  const ImproveDialog = () => (
    <Dialog open={improveDialogOpen} onOpenChange={setImproveDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Improve Bullet Point
          </DialogTitle>
          <DialogDescription>
            Review the improved version and suggestions below
          </DialogDescription>
        </DialogHeader>

        {improveResult && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Original
              </label>
              <div className="p-3 rounded-lg border bg-muted/30 text-sm">
                {bullet}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Improved Version</label>
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-sm">
                {improveResult.improvedVersion}
              </div>
            </div>

            {improveResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Improvements Made</label>
                <ul className="space-y-1">
                  {improveResult.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setImproveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={applyImproved}>
                Apply Improved Version
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const QuantifyDialog = () => (
    <Dialog open={quantifyDialogOpen} onOpenChange={setQuantifyDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Add Metrics to Achievement
          </DialogTitle>
          <DialogDescription>
            Choose a quantified version to replace your bullet point
          </DialogDescription>
        </DialogHeader>

        {quantifySuggestions.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Original
              </label>
              <div className="p-3 rounded-lg border bg-muted/30 text-sm">
                {bullet}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Quantified Suggestions</label>
              {quantifySuggestions.map((suggestion, idx) => (
                <div
                  key={suggestion.id || idx}
                  className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{suggestion.example}</p>
                    <Button
                      size="sm"
                      onClick={() => applyQuantified(suggestion)}
                      className="shrink-0"
                    >
                      Use This
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="font-medium">Metrics added:</span> {suggestion.metrics}
                    </p>
                    <p>
                      <span className="font-medium">Why:</span> {suggestion.reasoning}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setQuantifyDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return {
    isImproving,
    isQuantifying,
    handleImprove,
    handleQuantify,
    ImproveDialog,
    QuantifyDialog,
  };
}


