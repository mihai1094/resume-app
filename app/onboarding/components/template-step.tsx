"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES } from "@/lib/constants/templates";
import { TemplateId } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
import { Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Goal } from "./goal-step";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";

interface TemplateStepProps {
  goal: Goal;
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

function getRecommendedTemplates(jobTitle: string, goal: Goal): TemplateId[] {
  const category = getJobCategory(jobTitle);

  // If job title matches a specific category, use those recommendations
  if (category !== "other") {
    return CATEGORY_TEMPLATES[category];
  }

  // Fall back to goal-based recommendations
  return GOAL_TEMPLATES[goal];
}

export function TemplateStep({
  goal,
  jobTitle,
  selectedTemplate,
  onSelectTemplate,
}: TemplateStepProps) {
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  const recommendedTemplateIds = getRecommendedTemplates(jobTitle, goal);
  const recommendedTemplates = TEMPLATES.filter((t) =>
    recommendedTemplateIds.includes(t.id as TemplateId)
  );
  const otherTemplates = TEMPLATES.filter(
    (t) => !recommendedTemplateIds.includes(t.id as TemplateId)
  );

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
  }: {
    template: (typeof TEMPLATES)[number];
    isRecommended?: boolean;
  }) => {
    const isSelected = selectedTemplate === template.id;

    return (
      <Card
        key={template.id}
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
          "border-2",
          isSelected
            ? "border-primary ring-2 ring-primary/20 shadow-lg"
            : "border-border hover:border-primary/50"
        )}
        onClick={() => onSelectTemplate(template.id as TemplateId)}
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
        <div className="h-40 overflow-hidden">
          <TemplateMiniPreview templateId={template.id} />
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
        <div className="grid md:grid-cols-3 gap-4">
          {recommendedTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} isRecommended />
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
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
