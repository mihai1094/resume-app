"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TemplatePreviewProvider } from "@/components/resume/templates/shared/template-preview-context";
import {
  MOCK_RESUME_CONDENSED,
  MOCK_RESUME_CONDENSED_NO_PHOTO,
} from "@/lib/constants/mock-resume";
import { getTemplateDefaultColor } from "@/lib/constants/color-palettes";
import type { TemplateCustomization } from "@/components/resume/template-customizer";

import { ModernTemplate } from "@/components/resume/templates/modern-template";
import { ExecutiveTemplate } from "@/components/resume/templates/executive-template";
import { CreativeTemplate } from "@/components/resume/templates/creative-template";
import { IvyTemplate } from "@/components/resume/templates/ivy-template";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const CLIP_RATIO = 0.63;
const AUTO_ROTATE_MS = 4500;

const HERO_TEMPLATES = [
  { id: "modern", name: "Modern", useNoPhoto: false },
  { id: "executive", name: "Executive", useNoPhoto: false },
  { id: "creative", name: "Creative", useNoPhoto: true },
  { id: "ivy", name: "Ivy League", useNoPhoto: false },
] as const;

type HeroTemplateId = (typeof HERO_TEMPLATES)[number]["id"];

function makeCustomization(
  primaryColor: string,
  secondaryColor: string
): TemplateCustomization {
  return {
    primaryColor,
    secondaryColor,
    accentColor: primaryColor,
    fontFamily: "sans",
    fontSize: 13,
    lineSpacing: 1.5,
    sectionSpacing: 16,
  };
}

function RenderTemplate({
  id,
  customization,
}: {
  id: HeroTemplateId;
  customization: TemplateCustomization;
}) {
  const baseProps = { data: MOCK_RESUME_CONDENSED, customization };
  switch (id) {
    case "modern":
      return <ModernTemplate {...baseProps} />;
    case "executive":
      return <ExecutiveTemplate {...baseProps} />;
    case "creative":
      return (
        <CreativeTemplate
          data={MOCK_RESUME_CONDENSED_NO_PHOTO}
          customization={customization}
        />
      );
    case "ivy":
      return <IvyTemplate {...baseProps} />;
  }
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 24 : -24, opacity: 0 }),
};

export function HeroResumeCarouselInner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [scale, setScale] = useState(0.54);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute scale responsively
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / A4_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % HERO_TEMPLATES.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [isAutoPlaying]);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      setIsAutoPlaying(false);
    },
    [currentIndex]
  );

  const template = HERO_TEMPLATES[currentIndex];
  const palette = getTemplateDefaultColor(template.id);
  const customization = useMemo(
    () => makeCustomization(palette.primary, palette.secondary),
    [palette.primary, palette.secondary]
  );
  const containerHeight = Math.round(scale * A4_HEIGHT * CLIP_RATIO) || 380;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Resume card */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden ring-1 ring-black/[0.07] shadow-[0_8px_40px_rgba(0,0,0,0.08)] bg-white"
        style={{ height: containerHeight }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={template.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="absolute inset-0"
          >
            {/* A4 page scaled down */}
            <div
              className="absolute top-0 left-0 origin-top-left bg-white"
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
                transform: `scale(${scale})`,
              }}
            >
              <TemplatePreviewProvider>
                <RenderTemplate id={template.id} customization={customization} />
              </TemplatePreviewProvider>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Fade to white at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, white)" }}
        />

        {/* Auto-rotate progress line */}
        {isAutoPlaying && (
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-black/5 overflow-hidden rounded-b-2xl">
            <motion.div
              key={currentIndex}
              className="h-full bg-primary/50 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTO_ROTATE_MS / 1000, ease: "linear" }}
            />
          </div>
        )}
      </div>

      {/* Template tabs */}
      <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
        {HERO_TEMPLATES.map((t, i) => {
          const p = getTemplateDefaultColor(t.id);
          const isActive = i === currentIndex;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => goTo(i)}
              aria-pressed={isActive}
              aria-label={`Switch to ${t.name} template`}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isActive
                  ? "bg-background border border-border/70 shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 transition-opacity duration-200"
                style={{
                  backgroundColor: p.primary,
                  opacity: isActive ? 1 : 0.35,
                }}
                aria-hidden="true"
              />
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
