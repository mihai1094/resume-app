"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { RotateCcw, Clock, Save, Loader2, X } from "lucide-react";
import { ResumeVersion, SECTION_LABELS, TrackedSection } from "@/lib/types/version";
import { TemplateId } from "@/lib/constants/templates";
import { ModernTemplate } from "@/components/resume/templates/modern-template";
import { ClassicTemplate } from "@/components/resume/templates/classic-template";
import { MinimalistTemplate } from "@/components/resume/templates/minimalist-template";
import { ExecutiveTemplate } from "@/components/resume/templates/executive-template";
import { CreativeTemplate } from "@/components/resume/templates/creative-template";
import { TechnicalTemplate } from "@/components/resume/templates/technical-template";

interface VersionPreviewDialogProps {
  version: ResumeVersion | null;
  templateId: TemplateId;
  isLoading: boolean;
  onClose: () => void;
  onRestore: (versionId: string) => Promise<boolean>;
}

/**
 * Modal to preview a specific version of a resume
 */
export function VersionPreviewDialog({
  version,
  templateId,
  isLoading,
  onClose,
  onRestore,
}: VersionPreviewDialogProps) {
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (!version) return;
    setIsRestoring(true);
    const success = await onRestore(version.id);
    setIsRestoring(false);
    if (success) {
      setShowRestoreConfirm(false);
      onClose();
    }
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
            Auto-save
          </Badge>
        );
    }
  };

  const formatChangedSections = (sections?: string[]) => {
    if (!sections || sections.length === 0) return null;

    return sections
      .map((s) => SECTION_LABELS[s as TrackedSection] || s)
      .join(", ");
  };

  const renderTemplate = () => {
    if (!version) return null;

    switch (templateId) {
      case "classic":
        return <ClassicTemplate data={version.data} />;
      case "minimalist":
        return <MinimalistTemplate data={version.data} />;
      case "executive":
        return <ExecutiveTemplate data={version.data} />;
      case "creative":
        return <CreativeTemplate data={version.data} />;
      case "technical":
        return <TechnicalTemplate data={version.data} />;
      case "modern":
      default:
        return <ModernTemplate data={version.data} />;
    }
  };

  return (
    <>
      <Dialog open={!!version || isLoading} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2">
                  Version Preview
                  {version && getChangeTypeBadge(version.changeType)}
                </DialogTitle>
                {version && (
                  <DialogDescription className="mt-1">
                    {version.label && (
                      <span className="font-medium">{version.label} - </span>
                    )}
                    {formatDistanceToNow(version.createdAt.toDate(), {
                      addSuffix: true,
                    })}
                    {version.changedSections && version.changedSections.length > 0 && (
                      <span className="block text-xs mt-0.5">
                        Changed: {formatChangedSections(version.changedSections)}
                      </span>
                    )}
                  </DialogDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : version ? (
              <div className="transform scale-[0.6] origin-top">
                {renderTemplate()}
              </div>
            ) : null}
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => setShowRestoreConfirm(true)}
              disabled={isLoading || !version}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restore This Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current resume with this version. Your
              current state will be saved as a snapshot before restoring.
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
    </>
  );
}
