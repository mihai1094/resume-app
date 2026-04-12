"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
  const activeIndex = useMemo(
    () => sections.findIndex((s) => s.id === activeSection),
    [sections, activeSection]
  );

  const fillPercent = useMemo(
    () => (sections.length <= 1 ? 100 : (activeIndex / (sections.length - 1)) * 100),
    [activeIndex, sections.length]
  );

  // Track sections that just became complete for bounce animation
  const prevCompleteRef = useRef<Set<string>>(new Set());
  const [recentlyCompleted, setRecentlyCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentComplete = new Set(sections.filter((s) => isSectionComplete(s.id)).map((s) => s.id));
    const newlyCompleted = new Set<string>();
    currentComplete.forEach((id) => {
      if (!prevCompleteRef.current.has(id)) newlyCompleted.add(id);
    });
    prevCompleteRef.current = currentComplete;

    if (newlyCompleted.size === 0) return;

    setRecentlyCompleted(newlyCompleted);
    const timer = setTimeout(() => setRecentlyCompleted(new Set()), 300);
    return () => clearTimeout(timer);
  }, [sections, isSectionComplete]);

  return (
    <div
      className={cn(
        "hidden lg:flex flex-col gap-3 sticky z-40 transition-all duration-500 ease-out",
        "bg-card/70 border border-border/40 shadow-md rounded-xl py-5 px-3",
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
          <h2 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider shrink-0 ml-1 font-[family-name:var(--font-display)]">
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
            aria-label={collapsed ? "Expand section navigation" : "Collapse section navigation"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <nav className={cn(
        "relative flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide py-1.5",
        collapsed ? "px-1" : "pl-5 pr-1"
      )}>
        {/* Vertical progress line — expanded mode only */}
        {!collapsed && (
          <>
            <div
              className="absolute top-0 bottom-0 left-[0.6rem] w-0.5 bg-border rounded-full"
              aria-hidden="true"
            />
            <div
              className="absolute top-0 left-[0.6rem] w-0.5 bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ height: `${fillPercent}%` }}
              aria-hidden="true"
            />
          </>
        )}

        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isComplete = isSectionComplete(section.id);
          const hasError = hasErrors ? hasErrors(section.id) : false;
          const SectionIcon = section.icon;
          const justCompleted = recentlyCompleted.has(section.id);

          // Non-color differentiation for accessibility: screen readers announce
          // the state, and the row body pairs an icon with each non-default state.
          const stateSuffix = hasError
            ? "needs attention"
            : isComplete
              ? "complete"
              : isActive
                ? "in progress"
                : "not started";

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg text-sm transition-all duration-150 outline-none",
                collapsed ? "w-12 h-12 mx-auto justify-center px-0 shrink-0" : "w-full px-3 py-3 text-left",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
              aria-label={`${section.shortLabel} — ${stateSuffix}`}
              aria-current={isActive ? "step" : undefined}
              title={collapsed ? `${section.shortLabel} — ${stateSuffix}` : undefined}
            >
              {/* Dot indicator on progress line — expanded mode only */}
              {!collapsed && (
                <div
                  className={cn(
                    "absolute z-10 flex items-center justify-center -left-[0.85rem]",
                    justCompleted && "motion-safe:animate-[scale-bounce_0.3s_ease-out]"
                  )}
                  aria-hidden="true"
                >
                  {isComplete && !hasError ? (
                    <div className="w-2 h-2 rounded-full bg-success ring-2 ring-card" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-primary ring-2 ring-card motion-safe:animate-pulse" />
                  ) : hasError ? (
                    <div className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
                  ) : (
                    <div className="w-2 h-2 rounded-full border border-muted-foreground/40 bg-card ring-2 ring-card" />
                  )}
                </div>
              )}

              {/* Highlight background strip for active state */}
              {isActive && !collapsed && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full" />
              )}

              {collapsed ? (
                // Collapsed: Icon only
                <div className="relative flex items-center justify-center w-full h-full">
                  <SectionIcon
                    className={cn(
                      "w-5 h-5 transition-transform duration-150 group-hover:scale-110",
                      isActive && "text-primary"
                    )}
                  />
                  {hasError && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card z-10" />
                  )}
                  {isComplete && !isActive && !hasError && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-success rounded-full ring-2 ring-card" />
                  )}
                </div>
              ) : (
                // Expanded: Icon + Text + Status
                <>
                  <SectionIcon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="flex-1 truncate tracking-tight text-[13px]">
                    {section.shortLabel}
                  </span>

                  {/* Non-color status indicator — distinct icons so colorblind
                      users can tell complete vs error apart at a glance. */}
                  {hasError && (
                    <AlertCircle
                      className="w-4 h-4 shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                  )}
                  {isComplete && !hasError && (
                    <Check
                      className={cn(
                        "w-4 h-4 shrink-0 opacity-80",
                        isActive
                          ? "text-primary"
                          : "text-success"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Completion percentage footer */}
      <div
        className={cn(
          "pt-3 mt-2 border-t border-border/30",
          collapsed ? "flex justify-center" : "px-3"
        )}
      >
        {collapsed ? (
          <span
            className="text-xs font-semibold text-primary tabular-nums"
            title={`${progressPercentage}% complete`}
            aria-label={`${progressPercentage}% complete`}
          >
            {progressPercentage}%
          </span>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {progressPercentage}% complete
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
