"use client";

import { Button } from "@/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
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
  hasErrors?: (section: string) => boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  progressPercentage: number;
}

export function SectionNavigation({
  sections,
  activeSection,
  onSectionChange,
  isSectionComplete,
  hasErrors,
  collapsed = false,
  onToggleCollapse,
  progressPercentage,
}: SectionNavigationProps) {
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col gap-3 sticky z-40 transition-all duration-500 ease-out",
        "bg-card/70 backdrop-blur-xl border border-border/40 shadow-lg rounded-[2rem] py-5 px-3",
        collapsed ? "w-20 items-center px-2" : "w-64"
      )}
      style={{
        top: "var(--sticky-offset, 6rem)",
        height: "fit-content",
        maxHeight: "calc(100vh - 8rem)",
      }}
    >
      {/* Header with Toggle */}
      <div
        className={cn(
          "flex items-center pb-2 mb-2 border-b border-border/30",
          collapsed ? "justify-center" : "justify-between px-2"
        )}
      >
        {!collapsed && (
          <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider shrink-0 ml-1">
            Sections
          </h2>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              "h-8 w-8 rounded-full text-muted-foreground hover:bg-muted/80 transition-colors",
              collapsed && "mx-auto"
            )}
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

      <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide px-1">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isComplete = isSectionComplete(section.id);
          const hasError = hasErrors ? hasErrors(section.id) : false;
          const SectionIcon = section.icon;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl text-sm transition-all duration-300 outline-none overflow-hidden",
                collapsed ? "w-12 h-12 mx-auto justify-center px-0 shrink-0" : "w-full px-3 py-3 text-left",
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              title={collapsed ? section.shortLabel : undefined}
            >
              {/* Highlight background strip for active state */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
              )}

              {collapsed ? (
                // Collapsed: Icon only
                <div className="relative flex items-center justify-center w-full h-full">
                  <SectionIcon
                    className={cn(
                      "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                      isActive && "text-primary"
                    )}
                  />
                  {hasError && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card z-10" />
                  )}
                  {isComplete && !isActive && !hasError && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-card" />
                  )}
                </div>
              ) : (
                // Expanded: Icon + Text + Status
                <>
                  <SectionIcon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1 truncate tracking-tight text-[13px]">
                    {section.shortLabel}
                  </span>

                  {hasError && (
                    <div className="w-2 h-2 bg-red-500 rounded-full shrink-0 shadow-sm" title="Needs attention" />
                  )}
                  {isComplete && !hasError && (
                    <Check
                      className={cn(
                        "w-4 h-4 shrink-0 opacity-80",
                        isActive
                          ? "text-primary"
                          : "text-green-500"
                      )}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
