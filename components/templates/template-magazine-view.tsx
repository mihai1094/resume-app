"use client";

import React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Filter, ArrowRight, FileText, Clock } from "lucide-react";
import { capture } from "@/lib/analytics/events";

import {
  TEMPLATES,
  type Template,
  type ATSCompatibility,
  getATSBadgeInfo,
  hasTemplatePhotoSupport,
} from "@/lib/constants/templates";
import {
  getTemplateColorOptions,
  getTemplateDefaultColor,
} from "@/lib/constants/color-palettes";
import { useTemplateGallery } from "@/hooks/use-template-gallery";
import { useLastUsedTemplate } from "@/hooks/use-last-used-template";
import { BackButton } from "@/components/shared/back-button";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { TemplateGalleryPreview } from "./template-gallery-preview";
import { ColorSwatchSelector } from "./color-swatch-selector";
import { TemplatePreviewLightbox } from "./template-preview-lightbox";
import { TemplateGalleryFilters } from "./template-gallery-filters";

const LAYOUT_LABEL: Record<Template["layout"], string> = {
  "single-column": "Single column",
  "two-column": "Two columns",
  sidebar: "Sidebar",
};

function formatTemplateMetadata(template: Template): string {
  const style =
    template.styleCategory === "ats-optimized"
      ? "ATS-optimized"
      : template.styleCategory.charAt(0).toUpperCase() +
        template.styleCategory.slice(1);
  const layout = LAYOUT_LABEL[template.layout];
  const photo = hasTemplatePhotoSupport(template) ? "Photo" : "No photo";
  return `${style} · ${layout} · ${photo}`;
}

const ATS_DOT_COLOR: Record<ATSCompatibility, string> = {
  excellent: "bg-emerald-500",
  good: "bg-green-400",
  moderate: "bg-amber-400",
  low: "bg-rose-400",
};

function LayoutDiagram({ layout }: { layout: Template["layout"] }) {
  const line = "h-[2px] rounded-full bg-muted-foreground/50";

  if (layout === "single-column") {
    return (
      <div
        className="w-[18px] h-3 rounded-[2px] border border-muted-foreground/20 p-[2px] flex flex-col justify-between shrink-0"
        aria-label="Single column"
      >
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-[80%]")} />
        <div className={cn(line, "w-[90%]")} />
      </div>
    );
  }

  if (layout === "two-column") {
    return (
      <div
        className="w-[18px] h-3 rounded-[2px] border border-muted-foreground/20 p-[2px] flex gap-[2px] shrink-0"
        aria-label="Two columns"
      >
        <div className="flex-1 flex flex-col justify-between">
          <div className={cn(line, "w-full")} />
          <div className={cn(line, "w-[70%]")} />
          <div className={cn(line, "w-full")} />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div className={cn(line, "w-full")} />
          <div className={cn(line, "w-[60%]")} />
          <div className={cn(line, "w-[80%]")} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-[18px] h-3 rounded-[2px] border border-muted-foreground/20 p-[2px] flex gap-[2px] shrink-0"
      aria-label="Sidebar layout"
    >
      <div className="w-[5px] flex flex-col justify-between">
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-full")} />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className={cn(line, "w-full")} />
        <div className={cn(line, "w-[75%]")} />
        <div className={cn(line, "w-[85%]")} />
      </div>
    </div>
  );
}

function TemplateMetaIcons({ template }: { template: Template }) {
  const hasPhoto = hasTemplatePhotoSupport(template);
  const ats = template.features.atsCompatibility;
  const dotColor = ATS_DOT_COLOR[ats];
  const atsLabel = ats.charAt(0).toUpperCase() + ats.slice(1);

  return (
    <div className="mt-1.5 pl-5 flex items-center gap-2">
      <LayoutDiagram layout={template.layout} />
      <span className="text-muted-foreground/25 text-[10px]">·</span>
      <span
        className={cn("w-[7px] h-[7px] rounded-full shrink-0", dotColor)}
        title={`ATS ${atsLabel}`}
        aria-label={`ATS ${atsLabel}`}
      />
      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/50">
        ATS
      </span>
      <span className="text-muted-foreground/25 text-[10px]">·</span>
      {hasPhoto ? (
        <span
          className="w-[14px] h-[14px] rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0"
          title="Photo supported"
          aria-label="Photo supported"
        >
          <span className="w-[6px] h-[6px] rounded-full bg-primary/50" />
        </span>
      ) : (
        <span
          className="w-[14px] h-[14px] rounded-full border border-dashed border-muted-foreground/25 shrink-0"
          title="No photo"
          aria-label="No photo"
        />
      )}
    </div>
  );
}

/**
 * Editorial "magazine spread" layout for the template gallery (desktop, lg+).
 *
 * Left:  typographic table of contents — 22 template names in Playfair, with
 *        small uppercase metadata beneath. Hover previews, click commits.
 * Right: large live preview stage with the currently displayed template,
 *        color swatches, ATS badge, "Full preview" and "Use this template" CTAs.
 *
 * Mobile (<lg) keeps the existing grid-card view, rendered by the parent.
 */
export function TemplateMagazineView() {
  const router = useRouter();
  const {
    filters,
    updateFilter,
    clearFilters,
    activeFilterCount,
    filteredTemplates,
    templateCount,
    setTemplateColor,
    getTemplateColor,
    selectTemplate,
    availableStyles,
    filterOptionCounts,
  } = useTemplateGallery();

  const { lastUsed } = useLastUsedTemplate();

  // Local state: which template the stage is currently showing.
  // Click-only: no hover preview. Hover-to-preview creates involuntary state
  // changes as the cursor drifts across the list — users find it disorienting.
  // Focus (click or keyboard Tab/Arrow) is explicit intent; we honor that.
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [lightboxTemplate, setLightboxTemplate] = useState<Template | null>(
    null
  );
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(0.6);

  // A4 at 96 DPI (matches `min-h-[297mm]` in every template component)
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  // Once last-used has loaded from localStorage, seed focusedId with it so
  // landing on /templates already shows that template in the stage.
  useEffect(() => {
    if (focusedId) return;
    if (lastUsed && filteredTemplates.some((t) => t.id === lastUsed.template.id)) {
      setFocusedId(lastUsed.template.id);
    }
  }, [lastUsed, filteredTemplates, focusedId]);

  // If filters change and the currently-focused template is no longer in the
  // list, drop the focus so the fallback (first filtered) takes over.
  useEffect(() => {
    if (focusedId && !filteredTemplates.some((t) => t.id === focusedId)) {
      setFocusedId(null);
    }
  }, [filteredTemplates, focusedId]);

  const displayedId = focusedId ?? filteredTemplates[0]?.id ?? null;
  const displayedTemplate = useMemo(
    () =>
      displayedId
        ? (TEMPLATES.find((t) => t.id === displayedId) ?? null)
        : null,
    [displayedId]
  );

  // Measure stage container dimensions → compute preview scale using the
  // BINDING constraint (smaller of width/height scale). This guarantees the
  // A4 template content (794×1123) fits entirely inside the card without
  // clipping, regardless of whether the card is width-bound (tall viewport)
  // or height-bound (short viewport like a 14" MacBook).
  useEffect(() => {
    const updateScale = () => {
      if (stageRef.current) {
        const w = stageRef.current.offsetWidth;
        const h = stageRef.current.offsetHeight;
        const scaleW = w / A4_WIDTH;
        const scaleH = h / A4_HEIGHT;
        setStageScale(Math.min(scaleW, scaleH));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [displayedId]);

  const handleFocusItem = useCallback((id: string) => {
    setFocusedId(id);
  }, []);

  // Clicking a TOC item sets it as the focused template in the stage.
  // It does NOT navigate — the user still needs to pick a color, then click
  // "Use this template" in the stage to commit and go to the editor.
  const handleSelectInTOC = useCallback((id: string) => {
    setFocusedId(id);
  }, []);

  // Only the Stage's "Use this template" button commits to the editor.
  const handleCommit = useCallback(
    (id: string) => {
      selectTemplate(id);
    },
    [selectTemplate]
  );

  // Keyboard: Arrow Up/Down moves focus through the TOC. Enter commits the
  // currently displayed template (matches the Stage button).
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      if (filteredTemplates.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (currentIndex + 1) % filteredTemplates.length;
        setFocusedId(filteredTemplates[next].id);
        requestAnimationFrame(() => {
          const btn = document.querySelector<HTMLButtonElement>(
            `[data-toc-item="${filteredTemplates[next].id}"]`
          );
          btn?.focus();
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev =
          (currentIndex - 1 + filteredTemplates.length) %
          filteredTemplates.length;
        setFocusedId(filteredTemplates[prev].id);
        requestAnimationFrame(() => {
          const btn = document.querySelector<HTMLButtonElement>(
            `[data-toc-item="${filteredTemplates[prev].id}"]`
          );
          btn?.focus();
        });
      }
    },
    [filteredTemplates]
  );

  if (lightboxTemplate) {
    return (
      <TemplatePreviewLightbox
        template={lightboxTemplate}
        onClose={() => setLightboxTemplate(null)}
        onNavigate={(id) => {
          const t = TEMPLATES.find((t) => t.id === id);
          if (t) setLightboxTemplate(t);
        }}
      />
    );
  }

  const displayedColor = displayedTemplate
    ? getTemplateColor(displayedTemplate.id)
    : null;
  const displayedATSBadge = displayedTemplate
    ? getATSBadgeInfo(displayedTemplate.features.atsCompatibility)
    : null;

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex items-center gap-3 pb-2 border-b border-border/40 shrink-0 min-w-0">
        <BackButton
          fallback="/"
          label="Back"
          variant="secondary"
          size="sm"
          className="rounded-full shadow-sm shrink-0"
        />
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <div className="text-lg xl:text-xl font-semibold tracking-tight whitespace-nowrap">
            Resume Templates
          </div>
          <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <span className="px-2 py-1 rounded-full bg-muted text-foreground font-medium whitespace-nowrap">
              {templateCount} layouts
            </span>
            <span className="whitespace-nowrap">ATS-friendly</span>
            <span aria-hidden="true" className="text-muted-foreground/50">•</span>
            <span className="whitespace-nowrap">Free PDF export</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 max-h-[70vh] overflow-y-auto">
              <TemplateGalleryFilters
                filters={filters}
                onChange={updateFilter}
                onClear={clearFilters}
                activeFilterCount={activeFilterCount}
                availableStyles={availableStyles}
                templateCount={templateCount}
                filterOptionCounts={filterOptionCounts}
              />
            </PopoverContent>
          </Popover>
          <span className="text-xs text-muted-foreground whitespace-nowrap xl:hidden">
            {templateCount} template{templateCount !== 1 ? "s" : ""}
          </span>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
          <Link
            href="/editor/new"
            className="text-[11px] whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-dotted"
          >
            Skip — use default
          </Link>
        </div>
      </div>

      {/* Magazine body: TOC + Stage */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl border border-dashed border-border/60 bg-muted/30">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
            <FileText className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2 tracking-tight">
            No templates found
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            We couldn&apos;t find any templates matching your current filters. Try adjusting them to see more options.
          </p>
          <Button variant="default" onClick={clearFilters} className="shadow-md">
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(360px,440px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)] gap-10 2xl:gap-14 flex-1 min-h-0">
          {/* ─── Table of Contents ─── */}
          <div className="overflow-y-auto pr-6 -mr-6 pb-20">
            <ol className="flex flex-col">
              {lastUsed && (
                <li className="relative">
                  <button
                    type="button"
                    aria-label={`Continue editing ${lastUsed.template.name}`}
                    onClick={() => {
                      capture("template_picked", {
                        templateId: lastUsed.template.id,
                        colorId: lastUsed.color.id,
                        source: "quick_start",
                      });
                      router.push(
                        `/editor/new?template=${lastUsed.template.id}&color=${lastUsed.color.id}`
                      );
                    }}
                    className="group w-full text-left py-3 pl-5 pr-2 border-b border-border/30 transition-colors cursor-pointer outline-none border-l-[3px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                    style={{ borderLeftColor: lastUsed.color.primary }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">
                          <Clock className="w-3 h-3" />
                          Continue editing
                        </div>
                        <h3 className="font-serif text-lg xl:text-xl font-medium tracking-tight text-foreground truncate">
                          {lastUsed.template.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {lastUsed.color.name}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </li>
              )}
              {filteredTemplates.map((template, index) => {
                const isDisplayed = template.id === displayedId;
                const identityColor = getTemplateDefaultColor(template.id).primary;
                return (
                  <li key={template.id} className="relative">
                    <button
                      type="button"
                      data-toc-item={template.id}
                      aria-label={`Show ${template.name} in preview`}
                      aria-current={isDisplayed ? "true" : undefined}
                      tabIndex={
                        isDisplayed || (!focusedId && index === 0) ? 0 : -1
                      }
                      onFocus={() => handleFocusItem(template.id)}
                      onClick={() => handleSelectInTOC(template.id)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={cn(
                        "group w-full text-left py-3 pl-5 pr-2 border-b border-border/30 transition-colors duration-200 cursor-pointer outline-none",
                        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm",
                        "border-l-[3px]"
                      )}
                      style={{
                        borderLeftColor: isDisplayed
                          ? identityColor
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisplayed) {
                          (e.currentTarget as HTMLButtonElement).style.borderLeftColor =
                            `${identityColor}60`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisplayed) {
                          (e.currentTarget as HTMLButtonElement).style.borderLeftColor =
                            "transparent";
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0 transition-transform duration-200",
                            isDisplayed ? "scale-100" : "scale-75 group-hover:scale-100"
                          )}
                          style={{ backgroundColor: identityColor }}
                          aria-hidden="true"
                        />
                        <h3
                          className={cn(
                            "font-serif text-lg xl:text-xl font-medium tracking-tight transition-colors duration-200",
                            isDisplayed
                              ? "text-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          {template.name}
                        </h3>
                      </div>
                      <TemplateMetaIcons template={template} />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* ─── Stage ─── */}
          {/* Preview + CTA stay grouped together; shorter viewports can scroll
              the page instead of clipping critical actions. */}
          <div className="sticky top-4 self-start w-full flex flex-col items-center max-h-[calc(100dvh-6rem)]">
            {displayedTemplate && displayedColor && (
              <>
                <div
                  ref={stageRef}
                  className="relative aspect-[210/297] rounded-xl bg-white shadow-2xl shadow-primary/10 ring-1 ring-border/60 overflow-hidden group/preview"
                  style={{
                    "--preview-scale": stageScale,
                    width: "min(920px, calc((100dvh - 14rem) * 210 / 297), calc(100% - 2rem))",
                  } as React.CSSProperties}
                >
                  <TemplateGalleryPreview
                    templateId={displayedTemplate.id}
                    primaryColor={displayedColor.primary}
                    secondaryColor={displayedColor.secondary}
                    ideThemeId={displayedColor.ideTheme?.id}
                  />
                  {/* Color swatches overlaid on the preview */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-background/70 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg ring-1 ring-border/30 transition-opacity duration-200">
                    <ColorSwatchSelector
                      palettes={getTemplateColorOptions(displayedTemplate.id)}
                      selected={displayedColor}
                      onChange={(color) =>
                        setTemplateColor(displayedTemplate.id, color)
                      }
                      size="sm"
                    />
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Sticky commit bar ─── */}
      {displayedTemplate && displayedColor && (
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="mx-auto max-w-screen-2xl px-6 py-3 flex items-center gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-serif text-sm font-medium truncate text-foreground">
                {displayedTemplate.name}
              </span>
              {displayedATSBadge && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-2 py-0.5 font-normal border-transparent shrink-0",
                    displayedATSBadge.bgColor,
                    displayedATSBadge.color
                  )}
                >
                  {displayedATSBadge.label}
                </Badge>
              )}
              <span className="hidden sm:block text-xs text-muted-foreground truncate">
                {formatTemplateMetadata(displayedTemplate)}
              </span>
            </div>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLightboxTemplate(displayedTemplate)}
            >
              Full preview
            </Button>
            <Button
              size="default"
              className="shadow-md rounded-full px-6"
              onClick={() => handleCommit(displayedTemplate.id)}
            >
              Use this template
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
