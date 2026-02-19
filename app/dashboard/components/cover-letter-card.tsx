"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Loader2,
  FileText,
  Trash2,
  Calendar,
  FileJson,
  MoreHorizontal,
  Briefcase,
  Building2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { SavedCoverLetter } from "@/lib/types/cover-letter";
import { cn } from "@/lib/utils";

interface CoverLetterCardProps {
  letter: SavedCoverLetter;
  onPreview?: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
  onDelete?: (letter: SavedCoverLetter) => void;
  isExportingPdf?: boolean;
}

// Template badge colors matching resume-card.tsx style
const getTemplateBadgeColor = (templateId: string): string => {
  const colors: Record<string, string> = {
    professional:
      "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    modern:
      "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    minimal:
      "bg-slate-100 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800",
    creative:
      "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    executive:
      "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  };
  return colors[templateId] || colors.professional;
};

export function CoverLetterCard({
  letter,
  onPreview,
  onExportPDF,
  onExportJSON,
  onDelete,
  isExportingPdf = false,
}: CoverLetterCardProps) {
  const router = useRouter();

  // Calculate completion status
  const hasJobTitle = !!letter.data.jobTitle;
  const hasCompany = !!letter.data.recipient.company;
  const hasSender = !!(letter.data.senderName && letter.data.senderEmail);
  const hasContent = !!(
    letter.data.salutation &&
    letter.data.openingParagraph &&
    letter.data.closingParagraph
  );

  const completedItems = [hasJobTitle, hasCompany, hasSender, hasContent].filter(Boolean).length;
  const isComplete = completedItems === 4;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border-muted/60 hover:border-blue-500/30">
      {/* Visual Thumbnail Area */}
      <div
        className="relative h-48 bg-blue-500/5 border-b overflow-hidden cursor-pointer"
        onClick={() => router.push(`/edit-cover-letter?id=${letter.id}`)}
      >
        {/* Abstract representation of a cover letter layout */}
        <div className="absolute inset-0 p-5 opacity-40 flex flex-col gap-3 bg-gradient-to-b from-transparent to-blue-500/5">
          <div className="w-1/4 h-3 bg-blue-500/30 rounded" />

          <div className="w-2/3 h-2 bg-muted-foreground/20 rounded mt-4" />

          <div className="space-y-1.5 mt-2">
            <div className="w-full h-1.5 bg-muted-foreground/20 rounded" />
            <div className="w-full h-1.5 bg-muted-foreground/20 rounded" />
            <div className="w-11/12 h-1.5 bg-muted-foreground/20 rounded" />
            <div className="w-full h-1.5 bg-muted-foreground/20 rounded" />
            <div className="w-4/5 h-1.5 bg-muted-foreground/20 rounded" />
          </div>

          <div className="w-1/3 h-2 bg-muted-foreground/20 rounded mt-4" />
        </div>

        {/* Badges on top */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10 pointer-events-none">
          <Badge
            className={cn(
              "capitalize text-[10px] h-5 px-1.5 shadow-sm",
              getTemplateBadgeColor(letter.data.templateId)
            )}
          >
            {letter.data.templateId}
          </Badge>
          <Badge
            variant={isComplete ? "default" : "secondary"}
            className={cn(
              "flex items-center gap-1 shadow-sm text-[10px] h-5 px-1.5",
              isComplete
                ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300 border-green-200 dark:border-green-800"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800"
            )}
          >
            {isComplete ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {isComplete ? "Complete" : `${completedItems}/4`}
          </Badge>
        </div>

        <div className="absolute top-3 left-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 bg-background/50 hover:bg-background/80 backdrop-blur-sm shadow-sm rounded-full">
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {onPreview && (
                <DropdownMenuItem onClick={onPreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
              )}
              {onExportJSON && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onExportJSON}>
                    <FileJson className="w-4 h-4 mr-2" />
                    Export JSON
                  </DropdownMenuItem>
                </>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(letter)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-0">
          <Button
            variant="default"
            className="w-32 shadow-lg"
            onClick={(e) => { e.stopPropagation(); router.push(`/edit-cover-letter?id=${letter.id}`); }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onPreview) onPreview();
                else router.push(`/edit-cover-letter?id=${letter.id}&preview=1`);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                if (onExportPDF) onExportPDF();
              }}
              disabled={isExportingPdf || !onExportPDF}
            >
              {isExportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            </Button>

            {onDelete && (
              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(letter);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-card">
        <div className="mb-4">
          <h3 className="font-semibold text-base truncate mb-1" title={letter.name}>
            {letter.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            <span>Edited {format(new Date(letter.updatedAt), "MMM d, yyyy")}</span>
          </div>

          {/* Job & Company Info */}
          <div className="space-y-1.5 text-sm mt-2 border-t pt-3">
            {letter.data.recipient.company ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{letter.data.recipient.company}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground/50 italic">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-xs">No company specified</span>
              </div>
            )}

            {letter.data.jobTitle ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="truncate">{letter.data.jobTitle}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground/50 italic">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="text-xs">No job title specified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
