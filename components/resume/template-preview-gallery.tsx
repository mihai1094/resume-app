"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Sparkles,
  X,
} from "lucide-react";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { TemplateRenderer } from "./template-renderer";
import {
  templates as TEMPLATE_DATA,
  TEMPLATE_STYLE_CATEGORIES,
  TemplateId,
} from "@/lib/constants/templates";
import { cn } from "@/lib/utils";

const SAMPLE_PREVIEW_DATA: ResumeData = {
  personalInfo: {
    firstName: "Jordan",
    lastName: "Lee",
    email: "jordan.lee@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    website: "jordanlee.dev",
    linkedin: "linkedin.com/in/jordanlee",
    github: "github.com/jordanlee",
    summary:
      "Product-oriented software engineer specializing in front-end systems and performance.",
  },
  workExperience: [
    {
      id: "exp-1",
      company: "Nova Systems",
      position: "Senior Software Engineer",
      location: "New York, NY",
      startDate: "2021-03",
      endDate: "2024-08",
      current: false,
      description: [
        "Led the UI revamp for a B2B analytics suite, improving task success by 28%.",
        "Shipped performance optimizations that reduced bundle size by 35% and TTI by 22%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      degree: "B.Sc. Computer Science",
      field: "Software Engineering",
      location: "Boston, MA",
      startDate: "2014-09",
      endDate: "2018-06",
      current: false,
      gpa: "3.8",
      description: ["Coursework: Algorithms, Distributed Systems, HCI."],
    },
  ],
  skills: [
    { id: "skill-1", name: "React", category: "Frontend" },
    { id: "skill-2", name: "TypeScript", category: "Frontend" },
    { id: "skill-3", name: "Node.js", category: "Backend" },
    { id: "skill-4", name: "AWS", category: "Cloud" },
  ],
  projects: [
    {
      id: "proj-1",
      name: "Analytics Dashboard",
      description: "Built a modular analytics dashboard with role-based access.",
      technologies: ["Next.js", "GraphQL", "PostgreSQL"],
      url: "https://example.com",
    },
  ],
  languages: [
    { id: "lang-1", name: "English", level: "native" },
    { id: "lang-2", name: "Spanish", level: "conversational" },
  ],
  certifications: [],
  courses: [],
  hobbies: [],
  extraCurricular: [],
  customSections: [],
};

interface TemplatePreviewGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  customization?: TemplateCustomization;
  activeTemplateId: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export function TemplatePreviewGallery({
  open,
  onOpenChange,
  resumeData,
  customization,
  activeTemplateId,
  onSelectTemplate,
}: TemplatePreviewGalleryProps) {
  const [previewTemplate, setPreviewTemplate] =
    useState<TemplateId>(activeTemplateId);
  const [isMobile, setIsMobile] = useState(false);

  const hasUserData = useMemo(() => {
    const p = resumeData?.personalInfo || {};
    const hasName = !!(p.firstName?.trim() || p.lastName?.trim());
    const hasExperience = (resumeData?.workExperience || []).length > 0;
    const hasEducation = (resumeData?.education || []).length > 0;
    const hasSkills = (resumeData?.skills || []).length > 0;
    return hasName || hasExperience || hasEducation || hasSkills;
  }, [resumeData]);

  const previewData = useMemo(
    () => (hasUserData ? resumeData : SAMPLE_PREVIEW_DATA),
    [hasUserData, resumeData]
  );

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (open) {
      setPreviewTemplate(activeTemplateId);
    }
  }, [open, activeTemplateId]);

  const previewTemplateMeta = useMemo(
    () => TEMPLATE_DATA.find((tpl) => tpl.id === previewTemplate),
    [previewTemplate]
  );

  const handleApplyTemplate = () => {
    onSelectTemplate(previewTemplate);
    onOpenChange(false);
  };

  const handleApplyMobileTemplate = () => {
    onSelectTemplate(previewTemplate);
    onOpenChange(false);
  };

  // Carousel navigation
  const currentTemplateIndex = TEMPLATE_DATA.findIndex(
    (t) => t.id === previewTemplate
  );

  const goToNextTemplate = () => {
    const nextIndex = (currentTemplateIndex + 1) % TEMPLATE_DATA.length;
    setPreviewTemplate(TEMPLATE_DATA[nextIndex].id);
  };

  const goToPreviousTemplate = () => {
    const prevIndex =
      currentTemplateIndex === 0
        ? TEMPLATE_DATA.length - 1
        : currentTemplateIndex - 1;
    setPreviewTemplate(TEMPLATE_DATA[prevIndex].id);
  };

  const goToTemplate = (index: number) => {
    setPreviewTemplate(TEMPLATE_DATA[index].id);
  };

  // Desktop Layout Content - Carousel
  const DesktopContent = (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-[family-name:var(--font-display)]">
          <LayoutGrid className="w-5 h-5" />
          Choose Template
        </DialogTitle>
        <DialogDescription>
          Navigate through templates to see how your resume looks in different layouts.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Template Info Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold capitalize">
              {previewTemplateMeta?.name || "Template"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {previewTemplateMeta?.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {previewTemplate === activeTemplateId && (
              <Badge variant="secondary">Current</Badge>
            )}
            <Badge variant="outline" className="capitalize">
              <Sparkles className="w-3 h-3 mr-1" />
              {previewTemplateMeta?.category}
            </Badge>
          </div>
        </div>

        {/* Preview with Navigation */}
        <div className="relative flex-1 bg-muted/30 rounded-lg overflow-hidden">
          {/* Previous Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={goToPreviousTemplate}
            className="absolute left-4 top-4 z-10 h-12 w-12 rounded-full shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Scrollable Template Preview */}
          <div className="w-full h-full overflow-y-auto overflow-x-hidden">
            <div className="flex justify-center py-8 px-20 min-h-full">
              <div style={{ width: "210mm", zoom: 0.45 }}>
                <TemplateRenderer
                  templateId={previewTemplate}
                  data={previewData}
                  customization={customization}
                />
              </div>
            </div>
          </div>

          {/* Next Button */}
          <Button
            variant="secondary"
            size="icon"
            onClick={goToNextTemplate}
            className="absolute right-4 top-4 z-10 h-12 w-12 rounded-full shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2 mt-4 flex-shrink-0">
          {TEMPLATE_DATA.map((template, index) => (
            <button
              key={template.id}
              onClick={() => goToTemplate(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentTemplateIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              title={template.name}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleApplyTemplate}
            disabled={previewTemplate === activeTemplateId}
          >
            {previewTemplate === activeTemplateId ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Current Template
              </>
            ) : (
              `Use ${previewTemplateMeta?.name || "Template"}`
            )}
          </Button>
        </div>
      </div>
    </>
  );

  // Mobile carousel state
  const [mobileCategory, setMobileCategory] = useState<string>("all");
  const carouselRef = useRef<HTMLDivElement>(null);
  const isScrollingToCard = useRef(false);

  const filteredTemplates = useMemo(
    () =>
      mobileCategory === "all"
        ? TEMPLATE_DATA
        : TEMPLATE_DATA.filter((t) => t.styleCategory === mobileCategory),
    [mobileCategory]
  );

  const activeFilteredIndex = useMemo(
    () => filteredTemplates.findIndex((t) => t.id === previewTemplate),
    [filteredTemplates, previewTemplate]
  );

  const CATEGORY_LABELS: Record<string, string> = {
    all: "All",
    modern: "Modern",
    classic: "Classic",
    creative: "Creative",
    "ats-optimized": "ATS-Safe",
  };

  // Scroll carousel to card by index
  const scrollToCard = useCallback(
    (index: number, behavior: ScrollBehavior = "instant") => {
      const el = carouselRef.current;
      if (!el) return;
      const cards = el.querySelectorAll<HTMLElement>("[data-template-card]");
      const card = cards[index];
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const scrollTarget = cardCenter - el.clientWidth / 2;
      isScrollingToCard.current = true;
      el.scrollTo({ left: scrollTarget, behavior });
      // Reset flag after scroll settles
      setTimeout(() => {
        isScrollingToCard.current = false;
      }, behavior === "instant" ? 50 : 350);
    },
    []
  );

  // Track which card is centered on scroll
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (isScrollingToCard.current) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      const cards = el.querySelectorAll<HTMLElement>("[data-template-card]");
      let closestIndex = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIndex = i;
        }
      });
      const template = filteredTemplates[closestIndex];
      if (template && template.id !== previewTemplate) {
        setPreviewTemplate(template.id);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [filteredTemplates, previewTemplate]);

  // When filter changes or dialog opens, scroll to the active template
  useEffect(() => {
    if (!isMobile || !open) return;
    const idx = filteredTemplates.findIndex((t) => t.id === previewTemplate);
    if (idx >= 0) {
      // Small delay to let the DOM render cards
      requestAnimationFrame(() => scrollToCard(idx, "instant"));
    } else if (filteredTemplates.length > 0) {
      setPreviewTemplate(filteredTemplates[0].id);
      requestAnimationFrame(() => scrollToCard(0, "instant"));
    }
  }, [mobileCategory, open, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile Layout Content - Swipeable Carousel
  const MobileContent = (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>Choose Template</DialogTitle>
        <DialogDescription>
          Browse and select from {TEMPLATE_DATA.length} available templates
        </DialogDescription>
      </DialogHeader>

      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10 gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg">Choose Template</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="shrink-0"
          aria-label="Close template gallery"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Category filter pills */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide flex-shrink-0">
          {(["all", ...TEMPLATE_STYLE_CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setMobileCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                mobileCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Horizontal swipe carousel */}
        <div
          ref={carouselRef}
          className="flex gap-4 px-[15vw] py-4 overflow-x-auto scrollbar-hide flex-shrink-0"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              data-template-card
              className={cn(
                "flex-shrink-0 rounded-lg border-2 overflow-hidden bg-background shadow-lg transition-all",
                template.id === previewTemplate
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              )}
              style={{
                width: "70vw",
                scrollSnapAlign: "center",
                contentVisibility: "auto",
              }}
              onClick={() => {
                setPreviewTemplate(template.id);
                const idx = filteredTemplates.findIndex((t) => t.id === template.id);
                scrollToCard(idx, "smooth");
              }}
            >
              <div
                style={{
                  transform: "scale(0.55)",
                  transformOrigin: "top left",
                  width: `${100 / 0.55}%`,
                  pointerEvents: "none",
                }}
              >
                <TemplateRenderer
                  templateId={template.id as TemplateId}
                  data={previewData}
                  customization={customization}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Template info below carousel */}
        <div className="px-4 pb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold">
            {previewTemplateMeta?.name ?? "Template"}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="capitalize text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              {previewTemplateMeta?.styleCategory?.replace("-", " ") ?? previewTemplateMeta?.category}
            </Badge>
            {previewTemplate === activeTemplateId && (
              <Badge variant="secondary" className="text-xs">Current</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
            {previewTemplateMeta?.description}
          </p>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-1.5 pb-2 flex-shrink-0">
          {filteredTemplates.map((template, index) => (
            <button
              key={template.id}
              onClick={() => {
                setPreviewTemplate(template.id);
                scrollToCard(index, "smooth");
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activeFilteredIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30"
              )}
              aria-label={`Go to ${template.name}`}
            />
          ))}
        </div>

        {/* Spacer for fixed bottom buttons */}
        <div className="h-24 flex-shrink-0" />

        {/* Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t safe-area-inset-bottom">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleApplyMobileTemplate}
              disabled={previewTemplate === activeTemplateId}
            >
              {previewTemplate === activeTemplateId ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Current Template
                </>
              ) : (
                `Use ${previewTemplateMeta?.name}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          isMobile
            ? "fixed inset-0 w-full h-full max-w-none translate-x-0 translate-y-0 top-0 left-0 rounded-none p-0 flex flex-col data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:slide-out-to-bottom-4"
            : "flex max-w-6xl w-full flex-col max-h-[90vh]"
        )}
      >
        {isMobile ? MobileContent : DesktopContent}
      </DialogContent>
    </Dialog>
  );
}
