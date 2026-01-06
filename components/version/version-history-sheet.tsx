"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
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
import {
  History,
  Clock,
  RotateCcw,
  Save,
  Eye,
  Trash2,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ResumeVersionMeta, SECTION_LABELS, TrackedSection } from "@/lib/types/version";
import { cn } from "@/lib/utils";

interface VersionHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: ResumeVersionMeta[];
  isLoading: boolean;
  error: string | null;
  isPremium: boolean;
  versionLimit: number;
  canSaveManualVersion: boolean;
  onPreview: (versionId: string) => void;
  onRestore: (versionId: string) => Promise<boolean>;
  onDelete: (versionId: string) => Promise<boolean>;
  onSaveManualVersion: (label?: string) => Promise<boolean>;
}

/**
 * Sheet component displaying version history for a resume
 */
export function VersionHistorySheet({
  open,
  onOpenChange,
  versions,
  isLoading,
  error,
  isPremium,
  versionLimit,
  canSaveManualVersion,
  onPreview,
  onRestore,
  onDelete,
  onSaveManualVersion,
}: VersionHistorySheetProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [restoreVersionId, setRestoreVersionId] = useState<string | null>(null);
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveSnapshot = async () => {
    setIsSaving(true);
    const success = await onSaveManualVersion(snapshotLabel || undefined);
    setIsSaving(false);
    if (success) {
      setShowSaveDialog(false);
      setSnapshotLabel("");
    }
  };

  const handleRestore = async () => {
    if (!restoreVersionId) return;
    setIsRestoring(true);
    await onRestore(restoreVersionId);
    setIsRestoring(false);
    setRestoreVersionId(null);
  };

  const handleDelete = async () => {
    if (!deleteVersionId) return;
    setIsDeleting(true);
    await onDelete(deleteVersionId);
    setIsDeleting(false);
    setDeleteVersionId(null);
  };

  const getChangeTypeBadge = (changeType: string) => {
    switch (changeType) {
      case "manual":
        return (
          <Badge variant="default" className="text-[10px]">
            <Save className="w-3 h-3 mr-1" />
            Snapshot
          </Badge>
        );
      case "restore":
        return (
          <Badge variant="secondary" className="text-[10px]">
            <RotateCcw className="w-3 h-3 mr-1" />
            Restored
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            <Clock className="w-3 h-3 mr-1" />
            Auto
          </Badge>
        );
    }
  };

  const formatChangedSections = (sections?: string[]) => {
    if (!sections || sections.length === 0) return null;

    const labels = sections
      .slice(0, 3)
      .map((s) => SECTION_LABELS[s as TrackedSection] || s);

    if (sections.length > 3) {
      return `${labels.join(", ")} +${sections.length - 3} more`;
    }

    return labels.join(", ");
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Version History
            </SheetTitle>
            <SheetDescription>
              View and restore previous versions of your resume.
              {!isPremium && (
                <span className="block mt-1 text-amber-600">
                  Free plan: Last {versionLimit} auto-saves only
                </span>
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Save Snapshot Button (Premium only) */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                disabled={!canSaveManualVersion}
                className={cn(
                  "gap-2",
                  !canSaveManualVersion && "opacity-60"
                )}
              >
                <Save className="w-4 h-4" />
                Save Snapshot
                {!isPremium && <Crown className="w-3 h-3 text-amber-500" />}
              </Button>

              {!isPremium && (
                <Button variant="link" size="sm" className="text-primary" asChild>
                  <a href="/pricing">Upgrade for more</a>
                </Button>
              )}
            </div>

            {/* Version List */}
            <ScrollArea className="h-[calc(100vh-280px)]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No version history yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Versions are saved automatically every 5 minutes.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pr-4">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={cn(
                        "group p-3 rounded-lg border transition-colors hover:bg-muted/50",
                        index === 0 && "border-primary/30 bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getChangeTypeBadge(version.changeType)}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(
                                version.createdAt.toDate(),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>

                          {version.label && (
                            <p className="text-sm font-medium mt-1 truncate">
                              {version.label}
                            </p>
                          )}

                          {version.changedSections && version.changedSections.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Changed: {formatChangedSections(version.changedSections)}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onPreview(version.id)}
                            title="Preview this version"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setRestoreVersionId(version.id)}
                            title="Restore this version"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                          {version.changeType === "manual" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteVersionId(version.id)}
                              title="Delete this snapshot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Premium Upsell for Free Users */}
            {!isPremium && versions.length > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Unlock unlimited version history
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Save manual snapshots with labels and restore any version
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-amber-700 dark:text-amber-300"
                      asChild
                    >
                      <a href="/pricing">Upgrade to Premium</a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Save Snapshot Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Snapshot</AlertDialogTitle>
            <AlertDialogDescription>
              Create a named snapshot of your current resume. You can restore
              this version at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Optional label (e.g., 'Before applying to Google')"
              value={snapshotLabel}
              onChange={(e) => setSnapshotLabel(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveSnapshot} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Snapshot"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={!!restoreVersionId}
        onOpenChange={(open) => !open && setRestoreVersionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current resume with this version. A
              snapshot of your current state will be saved before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Restore Version"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteVersionId}
        onOpenChange={(open) => !open && setDeleteVersionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this snapshot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              snapshot from your version history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Snapshot"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
