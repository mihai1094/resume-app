"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Download,
  Trash2,
  Calendar,
  FileJson,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
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
      "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:opacity-80 transition-opacity",
    modern:
      "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:opacity-80 transition-opacity",
    minimal:
      "bg-slate-100 dark:bg-slate-950/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity",
    creative:
      "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:opacity-80 transition-opacity",
    executive:
      "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:opacity-80 transition-opacity",
  };
  return colors[templateId] || colors.professional;
};

// Single neutral gradient — template badge carries the per-card color signal.
const CARD_GRADIENT = "from-muted/60 via-muted/30 to-background";

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
  const completionScore = Math.round((completedItems / 4) * 100);
  const isComplete = completedItems === 4;

  // Initials from sender name; fallback to letter name initials, then "?"
  const initials = useMemo(() => {
    const source = letter.data.senderName?.trim() || letter.name?.trim() || "";
    const parts = source.split(/\s+/).filter(Boolean);
    const chars = `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
    return chars || "?";
  }, [letter.data.senderName, letter.name]);

  const displayName = letter.data.senderName?.trim() || letter.name;
  const jobTitle = letter.data.jobTitle;

  // Content fingerprint — job title + company when both exist
  const contentSummary = useMemo(() => {
    const job = letter.data.jobTitle;
    const company = letter.data.recipient.company;
    if (job && company) return `${job} at ${company}`;
    if (job) return job;
    if (company) return company;
    return null;
  }, [letter.data.jobTitle, letter.data.recipient.company]);

  const handleEdit = () => router.push(`/cover-letter?id=${letter.id}`);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col h-full border-muted/60 hover:border-primary/30">
      {/* Thumbnail */}
      <div
        className={cn(
          "relative h-44 overflow-hidden cursor-pointer bg-gradient-to-br",
          CARD_GRADIENT
        )}
        onClick={handleEdit}
      >
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* Centered identity */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-background/80 backdrop-blur border border-border/40 shadow-md flex items-center justify-center">
            <span className="text-xl font-bold text-foreground/80">{initials}</span>
          </div>
          {/* Name */}
          <div className="text-center max-w-[200px]">
            <p className="font-semibold text-sm text-foreground/90 truncate leading-tight">{displayName}</p>
            {jobTitle && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{jobTitle}</p>
            )}
          </div>
        </div>

        {/* Top-left: more menu */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/60 hover:bg-background/90 backdrop-blur-sm shadow-sm rounded-full"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {onExportJSON && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onExportJSON();
                  }}
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(letter);
                    }}
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

        {/* Top-right: template + completion badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1.5 z-10 pointer-events-none">
          <Badge
            className={cn(
              "capitalize text-[10px] h-5 px-2 shadow-sm backdrop-blur-sm",
              getTemplateBadgeColor(letter.data.templateId)
            )}
          >
            {letter.data.templateId}
          </Badge>
          <Badge
            className={cn(
              "flex items-center gap-1 text-[10px] h-5 px-2 shadow-sm backdrop-blur-sm font-medium",
              isComplete
                ? "bg-green-100/90 text-green-700 border-green-300 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800"
                : "bg-amber-100/90 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
            )}
          >
            {isComplete
              ? <CheckCircle2 className="w-2.5 h-2.5" />
              : <AlertCircleIcon className="w-2.5 h-2.5" />}
            {isComplete ? "Complete" : `${completedItems}/4`}
          </Badge>
        </div>
      </div>

      {/* Info + Actions Area */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-card">
        <div className="mb-3">
          <h3 className="font-semibold text-sm truncate" title={letter.name}>
            {letter.name}
          </h3>
          {contentSummary && (
            <p className="text-xs text-muted-foreground/80 truncate mt-0.5" title={contentSummary}>
              {contentSummary}
            </p>
          )}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Completeness</span>
              <span className={cn(
                "font-semibold",
                isComplete ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
              )}>
                {completionScore}%
              </span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isComplete ? "bg-green-500" : "bg-amber-500"
                )}
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>
          <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-1">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>Edited {format(new Date(letter.updatedAt), "MMM d, yyyy, h:mm a")}</span>
          </div>
        </div>

        {/* Primary action row — always visible on all devices */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            className="min-h-[44px] text-xs font-medium"
            onClick={handleEdit}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                onClick={() => onPreview?.()}
                disabled={!onPreview}
                aria-label={`Preview ${letter.name}`}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="min-h-[44px] min-w-[44px]"
                onClick={() => onExportPDF?.()}
                disabled={isExportingPdf || !onExportPDF}
                aria-label={`Export ${letter.name} as PDF`}
              >
                {isExportingPdf
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export PDF</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
