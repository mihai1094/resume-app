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
  onChangeTemplate?: () => void;
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
  onChangeTemplate,
}: SectionNavigationProps) {
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col gap-4 sticky top-24 transition-all duration-300 ease-in-out h-[calc(100vh-8rem)]",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header with Toggle */}
      <div
        className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between px-2"
        )}
      >
        {!collapsed && (
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider shrink-0">
            Sections
          </h2>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn("h-8 w-8 p-0 hover:bg-muted/80", collapsed && "mx-auto")}
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

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-hide">
        {sections.map((section, index) => {
          const isActive = activeSection === section.id;
          const isComplete = isSectionComplete(section.id);
          const SectionIcon = section.icon;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 outline-none",
                collapsed ? "w-10 h-10 mx-auto justify-center px-0" : "w-full",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? section.shortLabel : undefined}
            >
              {collapsed ? (
                // Collapsed: Icon only
                <div className="relative flex items-center justify-center w-full h-full">
                  <SectionIcon
                    className={cn(
                      "w-5 h-5 transition-transform group-hover:scale-110",
                      isActive && "text-primary-foreground"
                    )}
                  />
                  {isComplete && !isActive && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-background" />
                  )}
                </div>
              ) : (
                // Expanded: Icon + Text + Status
                <>
                  <SectionIcon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1 text-left truncate">
                    {section.shortLabel}
                  </span>
                  {isComplete && (
                    <Check className={cn("w-4 h-4 shrink-0", isActive ? "text-primary-foreground/70" : "text-green-500")} />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-auto pt-4 border-t px-2">
          <div className="bg-muted/50 rounded-lg p-3 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Completion</span>
                <span className="font-bold text-primary">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="h-1.5 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-2 rounded-md bg-background border shadow-sm cursor-pointer hover:border-primary/50 transition-colors",
                !onChangeTemplate && "cursor-default"
              )}
              onClick={onChangeTemplate}
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Template</span>
                <span className="text-xs font-medium capitalize">{templateId}</span>
              </div>
              {onChangeTemplate && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
