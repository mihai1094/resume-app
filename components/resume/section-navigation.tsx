"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionNavigationProps {
  sections: Section[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  isSectionComplete: (section: string) => boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  templateId?: string;
  progressPercentage: number;
}

export function SectionNavigation({
  sections,
  activeSection,
  onSectionChange,
  isSectionComplete,
  collapsed = false,
  onToggleCollapse,
  templateId = "modern",
  progressPercentage,
}: SectionNavigationProps) {
  return (
    <div
      className={cn(
        "hidden lg:block transition-all duration-300",
        collapsed ? "lg:col-span-1" : "lg:col-span-3"
      )}
    >
      <Card className={cn("p-4", !collapsed && "w-full")}>
        {/* Header with Toggle */}
        <div
          className={cn(
            "flex items-center mb-3",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          {!collapsed && (
            <h2 className="font-semibold text-sm shrink-0">Resume Sections</h2>
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className={cn("h-7 w-7 p-0 shrink-0", collapsed && "mx-auto")}
              title={collapsed ? "Expand Navigation" : "Collapse Navigation"}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        <nav
          className={cn(
            "space-y-1",
            collapsed && "overflow-y-auto max-h-[calc(100vh-20rem)]"
          )}
        >
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isComplete = isSectionComplete(section.id);
            const SectionIcon = section.icon;

            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  collapsed ? "w-auto mx-auto justify-center px-2" : "w-full",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
                title={collapsed ? section.shortLabel : undefined}
              >
                {collapsed ? (
                  // Collapsed: Show icon with optional checkmark
                  <div className="relative">
                    <SectionIcon
                      className={cn(
                        "w-5 h-5",
                        isActive && "text-primary-foreground"
                      )}
                    />
                    {isComplete && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                ) : (
                  // Expanded: Show number/checkmark circle + text
                  <>
                    <div
                      className={cn(
                        "flex items-center justify-center w-5 h-5 min-w-[20px] rounded-full text-xs font-medium shrink-0",
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : isComplete
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isComplete ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span className="tabular-nums">{index + 1}</span>
                      )}
                    </div>
                    <span className="flex-1 text-left min-w-0 truncate">
                      {section.shortLabel}
                    </span>
                    <div className="w-4 h-4 min-w-[16px] shrink-0 flex items-center justify-center">
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </nav>

              {!collapsed && (
                <>
                  <Separator className="my-4" />

                  {/* Quick Stats */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Template</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {templateId}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
      </Card>
    </div>
  );
}
