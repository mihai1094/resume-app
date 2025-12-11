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
    <Card className="hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Header with title, template badge, and menu */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-semibold text-base truncate">{letter.name}</h3>
              <Badge
                className={cn(
                  "capitalize text-[10px] h-5 px-1.5",
                  getTemplateBadgeColor(letter.data.templateId)
                )}
              >
                {letter.data.templateId}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(letter.updatedAt), "MMM d, yyyy")}</span>
              <span>•</span>
              <span
                className={cn(
                  "flex items-center gap-1",
                  isComplete
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {isComplete ? "Complete" : `${completedItems}/4 sections`}
              </span>
            </div>
          </div>

          {/* More menu for secondary actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
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
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Job & Company Info */}
        <div className="flex items-center gap-4 text-sm">
          {letter.data.recipient.company && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{letter.data.recipient.company}</span>
            </div>
          )}
          {letter.data.jobTitle && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="truncate max-w-[120px]">{letter.data.jobTitle}</span>
            </div>
          )}
        </div>

        {/* Primary Actions Row */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push(`/edit-cover-letter?id=${letter.id}`)}
            className="h-9"
          >
            <Edit className="w-4 h-4 mr-1.5" />
            Edit
          </Button>
          {onPreview ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="h-9"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Preview
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/edit-cover-letter?id=${letter.id}&preview=1`)}
              className="h-9"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Preview
            </Button>
          )}
        </div>

        {/* Export Row */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPDF}
            disabled={isExportingPdf || !onExportPDF}
            className="h-9"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 mr-1.5" />
            )}
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete ? () => onDelete(letter) : undefined}
            disabled={!onDelete}
            className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
