"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/constants";
import { ScrollReveal } from "@/components/scroll-reveal";
import { TemplateMiniPreview } from "@/components/home/template-mini-preview";
import { Button } from "@/components/ui/button";

type FilterTab = "all" | "ats" | "creative";

const FILTER_TABS: { key: FilterTab; label: string; count?: number }[] = [
  { key: "all", label: "All" },
  { key: "ats", label: "ATS-Optimized" },
  { key: "creative", label: "Creative" },
];

export function TemplateGallery() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    let pool = [...TEMPLATES];

    if (activeFilter === "ats") {
      pool = pool.filter((t) =>
        ["excellent", "good"].includes(t.features.atsCompatibility),
      );
    } else if (activeFilter === "creative") {
      pool = pool.filter((t) => t.styleCategory === "creative");
    }

    return pool.sort((a, b) => b.popularity - a.popularity);
  }, [activeFilter]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    const card = el.querySelector("[data-template-card]");
    if (card) {
      const cardWidth = card.clientWidth + 24;
      setActiveIndex(Math.round(el.scrollLeft / cardWidth));
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    // Prevent the carousel's overflow-x from trapping vertical scroll.
    // We block ALL wheel events on this container, then manually apply
    // only the horizontal component. Vertical delta is ignored here and
    // the browser propagates it to the page because we don't scroll the
    // container vertically (overflow-y is hidden, nothing to consume).
    const handleWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Pure vertical scroll — prevent the carousel from capturing it
      // by stopping the event and manually scrolling the window instead.
      if (absY > absX) {
        e.preventDefault();
        window.scrollBy({ top: e.deltaY, left: 0 });
        return;
      }

      // Horizontal intent — scroll the carousel
      if (absX > 0) {
        const atStart = el.scrollLeft <= 0;
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;

        if ((atStart && e.deltaX < 0) || (atEnd && e.deltaX > 0)) return;

        e.preventDefault();
        el.scrollLeft += e.deltaX;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      el.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, filtered]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-template-card]")?.clientWidth ?? 300;
    const gap = 24;
    const distance = (cardWidth + gap) * 2;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header row: heading left, filters + arrows right */}
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          {/* Left: Heading */}
          <div className="space-y-3 max-w-xl text-center sm:text-left">
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              <span className="sm:hidden">{TEMPLATES.length} PROFESSIONAL TEMPLATES</span>
              <span className="hidden sm:inline">{TEMPLATES.length} Professional Templates</span>
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight leading-[1.1]">
              Designs that get
              <br className="hidden sm:block" />
              <span className="text-orange-500 italic"> interviews</span>
            </h2>
          </div>

          {/* Right: Filters + Nav arrows */}
          <div className="flex items-center gap-4">
            {/* Filter tabs */}
            <div
              className="flex items-center gap-1 bg-muted/60 rounded-full p-1"
              role="tablist"
              aria-label="Filter templates"
            >
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  type="button"
                  aria-selected={activeFilter === tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    activeFilter === tab.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Nav arrows — desktop only */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll templates left"
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200",
                  canScrollLeft
                    ? "border-border hover:border-foreground hover:bg-foreground hover:text-background cursor-pointer"
                    : "border-border/40 text-muted-foreground/40 cursor-default",
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll templates right"
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200",
                  canScrollRight
                    ? "border-border hover:border-foreground hover:bg-foreground hover:text-background cursor-pointer"
                    : "border-border/40 text-muted-foreground/40 cursor-default",
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Horizontal scroll gallery */}
      <div className="relative -mx-6 px-6">
        {/* Left fade */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300",
            "bg-gradient-to-r from-background to-transparent",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
        />
        {/* Right fade */}
        <div
          className={cn(
            "absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-300",
            "bg-gradient-to-l from-background to-transparent",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scrollRef}
          className="flex gap-5 md:gap-6 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-4 -mb-4 scrollbar-hide touch-pan-y"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filtered.map((template, index) => (
            <ScrollReveal key={template.id} delay={Math.min(index * 30, 200)}>
              <Link
                href={`/templates?highlight=${template.id}`}
                data-template-card
                className="group block snap-start shrink-0 w-[240px] sm:w-[260px] md:w-[280px]"
              >
                {/* Card */}
                <div
                  className={cn(
                    "relative aspect-[8.5/11] rounded-xl overflow-hidden",
                    "bg-white dark:bg-muted/20",
                    "border border-border/60",
                    "transition-all duration-500 ease-out",
                    "group-hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)]",
                    "group-hover:border-primary/30",
                    "group-hover:-translate-y-1.5",
                  )}
                >
                  <TemplateMiniPreview templateId={template.id} />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <span>Use this template</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-medium group-hover:text-primary transition-colors duration-300">
                    {template.name}
                  </span>
                  {template.features.atsCompatibility === "excellent" && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
                      ATS
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {template.styleCategory === "creative"
                    ? "Creative & expressive"
                    : template.features.atsCompatibility === "excellent"
                      ? "Optimized for applicant tracking"
                      : "Professional & versatile"}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Carousel dots */}
      <div className="flex justify-center gap-2 pt-2">
        {filtered.map((template, i) => (
          <button
            key={template.id}
            type="button"
            aria-label={`Go to template ${i + 1}`}
            onClick={() => {
              const el = scrollRef.current;
              if (!el) return;
              const card = el.querySelector("[data-template-card]");
              if (!card) return;
              const cardWidth = card.clientWidth + 24;
              el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
            }}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i === activeIndex
                ? "bg-primary w-4"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>

      {/* Bottom CTA */}
      <ScrollReveal delay={200}>
        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="lg" className="group text-muted-foreground border border-secondary-foreground/30 hover:text-secondary-foreground hover:bg-secondary transition-all duration-300" asChild>
            <Link href="/templates">
              Browse all {TEMPLATES.length} templates
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </ScrollReveal>
    </div>
  );
}
