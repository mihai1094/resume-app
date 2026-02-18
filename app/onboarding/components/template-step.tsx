"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TEMPLATES } from "@/lib/constants/templates";
import { TemplateId } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
import { Check, Sparkles, ChevronDown, ChevronUp, ZoomIn } from "lucide-react";
// import { Goal } from "./goal-step";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";
import { ATSBadge } from "@/components/resume/template-badges";

export type Goal = "job-application" | "career-change" | "general-update";

interface TemplateStepProps {
  goal?: Goal;
  jobTitle: string;
  selectedTemplate: TemplateId | null;
  onSelectTemplate: (templateId: TemplateId) => void;
}

// Job category mappings for template recommendations
type JobCategory =
  | "tech"
  | "business"
  | "creative"
  | "management"
  | "sales"
  | "other";

const JOB_TITLE_CATEGORIES: Record<string, JobCategory> = {
  "Software Engineer": "tech",
  "Data Scientist": "tech",
  "UX Designer": "tech",
  "Product Manager": "management",
  "Project Manager": "management",
  "Operations Manager": "management",
  "Human Resources Manager": "management",
  "Financial Analyst": "business",
  "Business Analyst": "business",
  "Account Executive": "business",
  "Marketing Manager": "creative",
  "Content Writer": "creative",
  "Sales Representative": "sales",
  "Customer Success Manager": "sales",
};

// Template recommendations by job category
const CATEGORY_TEMPLATES: Record<JobCategory, TemplateId[]> = {
  tech: ["technical", "modern", "minimalist"],
  business: ["executive", "ivy", "classic"],
  creative: ["creative", "timeline", "modern"],
  management: ["executive", "modern", "classic"],
  sales: ["modern", "classic", "executive"],
  other: ["adaptive", "modern", "classic"],
};

// Fallback recommendations by goal (when job title doesn't match any category)
const GOAL_TEMPLATES: Record<Goal, TemplateId[]> = {
  "job-application": ["modern", "executive", "technical"],
  "career-change": ["creative", "minimalist", "adaptive"],
  "general-update": ["classic", "modern", "adaptive"],
};

function getJobCategory(jobTitle: string): JobCategory {
  // First check exact match
  if (JOB_TITLE_CATEGORIES[jobTitle]) {
    return JOB_TITLE_CATEGORIES[jobTitle];
  }

  // Then check if job title contains any keywords
  const lowerTitle = jobTitle.toLowerCase();

  // Tech keywords
  if (
    lowerTitle.includes("engineer") ||
    lowerTitle.includes("developer") ||
    lowerTitle.includes("programmer") ||
    lowerTitle.includes("data") ||
    lowerTitle.includes("devops") ||
    lowerTitle.includes("architect") ||
    lowerTitle.includes("qa") ||
    lowerTitle.includes("test") ||
    lowerTitle.includes("security") ||
    lowerTitle.includes("cloud") ||
    lowerTitle.includes("ux") ||
    lowerTitle.includes("ui")
  ) {
    return "tech";
  }

  // Business/Finance keywords
  if (
    lowerTitle.includes("financial") ||
    lowerTitle.includes("finance") ||
    lowerTitle.includes("analyst") ||
    lowerTitle.includes("accountant") ||
    lowerTitle.includes("consultant") ||
    lowerTitle.includes("advisor") ||
    lowerTitle.includes("investment") ||
    lowerTitle.includes("banking")
  ) {
    return "business";
  }

  // Creative keywords
  if (
    lowerTitle.includes("designer") ||
    lowerTitle.includes("creative") ||
    lowerTitle.includes("artist") ||
    lowerTitle.includes("writer") ||
    lowerTitle.includes("content") ||
    lowerTitle.includes("marketing") ||
    lowerTitle.includes("brand") ||
    lowerTitle.includes("media") ||
    lowerTitle.includes("graphic")
  ) {
    return "creative";
  }

  // Management keywords
  if (
    lowerTitle.includes("manager") ||
    lowerTitle.includes("director") ||
    lowerTitle.includes("head of") ||
    lowerTitle.includes("lead") ||
    lowerTitle.includes("chief") ||
    lowerTitle.includes("vp") ||
    lowerTitle.includes("president") ||
    lowerTitle.includes("coordinator") ||
    lowerTitle.includes("supervisor")
  ) {
    return "management";
  }

  // Sales keywords
  if (
    lowerTitle.includes("sales") ||
    lowerTitle.includes("account") ||
    lowerTitle.includes("business development") ||
    lowerTitle.includes("customer") ||
    lowerTitle.includes("client") ||
    lowerTitle.includes("representative")
  ) {
    return "sales";
  }

  return "other";
}

function getRecommendedTemplates(jobTitle: string, goal?: Goal): TemplateId[] {
  const category = getJobCategory(jobTitle);

  // If job title matches a specific category, use those recommendations
  if (category !== "other") {
    return CATEGORY_TEMPLATES[category];
  }

  // Fall back to goal-based recommendations if goal exists
  if (goal) {
    return GOAL_TEMPLATES[goal];
  }

  // Default fallback if neither matches
  return ["modern", "classic", "minimalist"];
}

export function TemplateStep({
  goal,
  jobTitle,
  selectedTemplate,
  onSelectTemplate,
}: TemplateStepProps) {
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<
    (typeof TEMPLATES)[number] | null
  >(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const recommendedTemplateIds = getRecommendedTemplates(jobTitle, goal);
  const recommendedTemplates = TEMPLATES.filter((t) =>
    recommendedTemplateIds.includes(t.id as TemplateId),
  );
  const otherTemplates = TEMPLATES.filter(
    (t) => !recommendedTemplateIds.includes(t.id as TemplateId),
  );

  // All visible templates for keyboard navigation
  const visibleTemplates = useMemo(
    () => showAllTemplates ? [...recommendedTemplates, ...otherTemplates] : recommendedTemplates,
    [showAllTemplates, recommendedTemplates, otherTemplates]
  );

  // Keyboard navigation for templates
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't handle if dialog is open or no templates to focus
      if (previewTemplate || visibleTemplates.length === 0) return;

      const columnsPerRow = 3; // md:grid-cols-3
      const maxIndex = visibleTemplates.length - 1;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + columnsPerRow, maxIndex));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - columnsPerRow, 0));
          break;
        case " ":
        case "Enter":
          if (visibleTemplates[focusedIndex]) {
            e.preventDefault();
            onSelectTemplate(visibleTemplates[focusedIndex].id as TemplateId);
          }
          break;
      }
    },
    [focusedIndex, visibleTemplates, previewTemplate, onSelectTemplate],
  );

  // Keep focusedIndex in bounds when visible templates list changes (e.g. filter)
  useEffect(() => {
    if (visibleTemplates.length === 0) {
      setFocusedIndex(0);
      return;
    }
    setFocusedIndex((prev) => Math.min(prev, visibleTemplates.length - 1));
  }, [visibleTemplates.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Update focused index when selected template changes
  useEffect(() => {
    if (selectedTemplate) {
      const index = visibleTemplates.findIndex(
        (t) => t.id === selectedTemplate,
      );
      if (index !== -1) {
        setFocusedIndex(index);
      }
    }
  }, [selectedTemplate, visibleTemplates]);

  // Get the job category for display
  const jobCategory = getJobCategory(jobTitle);
  const categoryLabels: Record<JobCategory, string> = {
    tech: "tech professionals",
    business: "finance & business roles",
    creative: "creative professionals",
    management: "leadership roles",
    sales: "sales & customer-facing roles",
    other: "your goal",
  };

  const TemplateCard = ({
    template,
    isRecommended = false,
    isFocused = false,
    index,
  }: {
    template: (typeof TEMPLATES)[number];
    isRecommended?: boolean;
    isFocused?: boolean;
    index: number;
  }) => {
    const isSelected = selectedTemplate === template.id;

    return (
      <Card
        key={template.id}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        aria-label={`${template.name} template${
          isRecommended ? ", recommended" : ""
        }${isSelected ? ", selected" : ""}`}
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          "border-2 outline-none",
          isSelected
            ? "border-primary ring-2 ring-primary/20 shadow-lg"
            : "border-border hover:border-primary/50",
          isFocused &&
            !isSelected &&
            "ring-2 ring-primary/40 border-primary/60",
        )}
        onClick={() => onSelectTemplate(template.id as TemplateId)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectTemplate(template.id as TemplateId);
          }
        }}
        onFocus={() => setFocusedIndex(index)}
      >
        {/* Recommended Badge */}
        {isRecommended && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-primary/90 text-primary-foreground text-[10px] gap-1">
              <Sparkles className="w-3 h-3" />
              Recommended
            </Badge>
          </div>
        )}

        {/* Selected Checkmark */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        )}

        {/* Template Preview */}
        <div className="h-40 overflow-hidden relative group/preview">
          <TemplateMiniPreview templateId={template.id} />
          {/* Mobile preview quick-action (kept small so card tap still selects template) */}
          <button
            className="absolute bottom-2 right-2 md:hidden w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewTemplate(template);
            }}
            aria-label={`Preview ${template.name} template`}
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Template Info */}
        <div className="p-4 space-y-3 bg-background">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{template.name}</h3>
              {template.popularity >= 90 && !isRecommended && (
                <Badge variant="secondary" className="text-[10px]">
                  Popular
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>

          <div className="pb-2">
            <ATSBadge
              compatibility={template.features.atsCompatibility}
              size="sm"
              showTooltip={false}
            />
          </div>

          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onSelectTemplate(template.id as TemplateId);
            }}
          >
            {isSelected ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Selected
              </>
            ) : (
              "Select"
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">
          Choose your starting point
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Based on your role as{" "}
          <span className="font-medium text-foreground">
            {jobTitle || "professional"}
          </span>
          , we've selected the best templates for {categoryLabels[jobCategory]}.
        </p>
      </div>

      {/* Recommended Templates */}
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Recommended for {jobTitle || "you"}
          </h3>
        </div>
        <div
          className="grid md:grid-cols-3 gap-4"
          ref={gridRef}
          role="listbox"
          aria-label="Template selection"
        >
          {recommendedTemplates.map((template, idx) => (
            <TemplateCard
              key={template.id}
              template={template}
              isRecommended
              isFocused={focusedIndex === idx}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* Show More Templates Toggle */}
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          className="w-full py-6 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all"
          onClick={() => setShowAllTemplates(!showAllTemplates)}
        >
          {showAllTemplates ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide other templates
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Browse {otherTemplates.length} more templates
            </>
          )}
        </Button>
      </div>

      {/* Other Templates */}
      {showAllTemplates && (
        <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            All templates
          </h3>
          <div
            className="grid md:grid-cols-3 lg:grid-cols-4 gap-4"
            role="listbox"
            aria-label="More templates"
          >
            {otherTemplates.map((template, idx) => (
              <TemplateCard
                key={template.id}
                template={template}
                isFocused={focusedIndex === recommendedTemplates.length + idx}
                index={recommendedTemplates.length + idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Template Preview Modal */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden md:hidden">
          {previewTemplate && (
            <>
              <DialogHeader className="px-4 pt-4 pb-2">
                <DialogTitle className="flex items-center gap-2">
                  {previewTemplate.name}
                  {recommendedTemplateIds.includes(
                    previewTemplate.id as TemplateId,
                  ) && (
                    <Badge className="bg-primary/90 text-primary-foreground text-[10px] gap-1">
                      <Sparkles className="w-3 h-3" />
                      Recommended
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {previewTemplate.description}
                </p>
              </DialogHeader>

              {/* Large Preview */}
              <div className="px-4 py-2">
                <div className="h-[50vh] rounded-lg overflow-hidden border shadow-inner">
                  <TemplateMiniPreview
                    templateId={previewTemplate.id}
                    className="scale-100"
                  />
                </div>
              </div>

              {/* ATS Badge */}
              <div className="px-4 py-2">
                <ATSBadge
                  compatibility={previewTemplate.features.atsCompatibility}
                  size="sm"
                  showTooltip={false}
                />
              </div>

              <DialogFooter className="px-4 pb-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onSelectTemplate(previewTemplate.id as TemplateId);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1"
                >
                  {selectedTemplate === previewTemplate.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    "Select Template"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
