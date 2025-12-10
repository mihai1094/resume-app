"use client";

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
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

/**
 * Dialog shown when user tries to navigate away with unsaved changes.
 * Offers three options: Save, Discard, or Cancel (stay on page).
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
  onCancel,
  isSaving = false,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes that will be lost if you leave this page.
            What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} disabled={isSaving}>
            Stay on Page
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onDiscard}
            disabled={isSaving}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Discard Changes
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save & Leave"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
