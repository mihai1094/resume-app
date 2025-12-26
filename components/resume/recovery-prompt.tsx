"use client";

import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecoveryPromptProps {
  open: boolean;
  onRecover: () => void;
  onDiscard: () => void;
  lastModified: Date;
}

/**
 * Dialog that appears when unsaved changes are detected in sessionStorage.
 * Allows user to recover or discard the draft.
 */
export function RecoveryPrompt({
  open,
  onRecover,
  onDiscard,
  lastModified,
}: RecoveryPromptProps) {
  const timeAgo = formatDistanceToNow(lastModified, { addSuffix: true });

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Recover unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes from {timeAgo}. Would you like to recover
            them or start fresh?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onDiscard}>
            Discard
          </AlertDialogCancel>
          <AlertDialogAction onClick={onRecover}>
            Recover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
