"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlanLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit?: number;
  resourceType?: string; // e.g., "resumes", "cover letters", "job applications"
  onUpgrade?: () => void;
  onManage?: () => void;
}

export function PlanLimitDialog({
  open,
  onOpenChange,
  limit = 3,
  resourceType = "resumes",
  onUpgrade,
  onManage,
}: PlanLimitDialogProps) {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Free plan limit reached</DialogTitle>
          <DialogDescription>
            You can keep up to {limit} {resourceType} on the free plan. Remove one of
            your current {resourceType} or upgrade to create more.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-3">
          {onManage && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onManage}
            >
              Manage {resourceType}
            </Button>
          )}
          <div className="flex w-full sm:w-auto justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleUpgrade}>
              Upgrade plan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}






