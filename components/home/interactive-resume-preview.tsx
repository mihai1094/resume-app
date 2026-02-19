"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const PREVIEW_TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    accent: "bg-blue-600",
    accentLight: "bg-blue-50",
    textAccent: "text-blue-600",
  },
  {
    id: "professional",
    name: "Classic",
    accent: "bg-slate-800",
    accentLight: "bg-slate-50",
    textAccent: "text-slate-800",
  },
  {
    id: "creative",
    name: "Creative",
    accent: "bg-violet-600",
    accentLight: "bg-violet-50",
    textAccent: "text-violet-600",
  },
];

export function InteractiveResumePreview() {
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);

  // Auto-rotate templates
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentTemplate((prev) => (prev + 1) % PREVIEW_TEMPLATES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTemplate = () => {
    setIsAutoPlaying(false);
    setDirection(1);
    setCurrentTemplate((prev) => (prev + 1) % PREVIEW_TEMPLATES.length);
  };

  const prevTemplate = () => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setCurrentTemplate(
      (prev) =>
        (prev - 1 + PREVIEW_TEMPLATES.length) % PREVIEW_TEMPLATES.length,
    );
  };

  const template = PREVIEW_TEMPLATES[currentTemplate];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <div
      className="relative group perspective-[1000px]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Floating Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/10 rounded-[2rem] blur-3xl -z-10 group-hover:scale-110 transition-transform duration-1000" />

      {/* Premium Pill Controller */}
      <div className="absolute -top-[39px] right-4 flex items-center justify-center p-1.5 gap-2 z-40 bg-background/80 backdrop-blur-xl border border-border/50 rounded-full shadow-lg opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevTemplate}
          className="h-7 w-7 rounded-full hover:bg-muted"
          aria-label="Previous template"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1.5 px-2">
          {PREVIEW_TEMPLATES.map((t, index) => (
            <button
              key={t.id}
              onClick={() => {
                setIsAutoPlaying(false);
                setDirection(index > currentTemplate ? 1 : -1);
                setCurrentTemplate(index);
              }}
              className="relative py-2 flex items-center justify-center"
              aria-label={`Switch to ${t.name} template`}
            >
              <motion.div
                className={cn(
                  "h-1.5 rounded-full",
                  currentTemplate === index
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                )}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextTemplate}
          className="h-7 w-7 rounded-full hover:bg-muted"
          aria-label="Next template"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Realistic Resume Preview Card */}
      <motion.div
        className="relative transform-gpu transition-all duration-500 will-change-transform aspect-[8.5/11]"
        initial={{ rotateX: 2, rotateY: -2 }}
        whileHover={{ rotateX: 0, rotateY: 0, scale: 1.02 }}
      >
        <Card className="shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-border/50 bg-background overflow-hidden relative w-full h-full rounded-xl">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentTemplate}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
                scale: { duration: 0.3 }
              }}
              className="absolute inset-0 p-6 sm:p-8 flex flex-col text-[10px] sm:text-xs leading-relaxed bg-white dark:bg-zinc-950"
            >
              {/* Decorative Header Accent */}
              {template.id === "modern" && (
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
              )}
              {template.id === "creative" && (
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 to-fuchsia-600" />
              )}

              {/* Header Section */}
              <div
                className={cn(
                  "pb-5 mb-5 border-b transition-colors duration-500",
                  template.id === "professional" && "border-slate-300 dark:border-slate-800 border-b-2",
                  template.id !== "professional" && "border-slate-100 dark:border-zinc-800"
                )}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                  Sarah Johnson
                </h2>
                <p
                  className={cn("text-sm font-medium mt-1 uppercase tracking-widest", template.textAccent)}
                >
                  Senior Product Designer
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-zinc-500 dark:text-zinc-400 font-medium text-[9px] sm:text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3" />
                    sarah.johnson@example.com
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    (555) 123-4567
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    San Francisco, CA
                  </span>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="mb-5">
                <h3
                  className={cn(
                    "font-bold uppercase tracking-wider mb-2",
                    template.textAccent,
                    template.id === "professional" && "text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1"
                  )}
                >
                  Summary
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  Strategic Product Designer with 8+ years of experience leading design for enterprise SaaS applications. Specializes in complex workflows and translating user research into scalable design systems. Increased user retention by 24% for flagship products.
                </p>
              </div>

              {/* Experience */}
              <div className="mb-5 flex-1">
                <h3
                  className={cn(
                    "font-bold uppercase tracking-wider mb-3 flex items-center gap-2",
                    template.textAccent,
                    template.id === "professional" && "text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1"
                  )}
                >
                  {template.id === "creative" && <Briefcase className="w-3.5 h-3.5" />}
                  Professional Experience
                </h3>
                <div className="space-y-4">
                  <div className="relative">
                    {template.id === "modern" && (
                      <div className="absolute -left-3 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          Lead Product Designer
                        </p>
                        <p className="text-zinc-500 font-medium">Acme Corp • FinTech</p>
                      </div>
                      <span className="text-zinc-400 font-medium">
                        2021 - Present
                      </span>
                    </div>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-300">
                      <li className="flex gap-2">
                        <span className={cn("mt-0.5 font-bold", template.textAccent)}>•</span>
                        <span>
                          Spearheaded the redesign of the core dashboard, resulting in a 34% increase in daily active users and a 12% drop in support tickets.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className={cn("mt-0.5 font-bold", template.textAccent)}>•</span>
                        <span>Managed a team of 4 designers, establishing a unified design system that accelerated development velocity by 40%.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="relative">
                    {template.id === "modern" && (
                      <div className="absolute -left-3 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-300" />
                    )}
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                          Senior UX Designer
                        </p>
                        <p className="text-zinc-500 font-medium">Globex Inc</p>
                      </div>
                      <span className="text-zinc-400 font-medium">2018 - 2021</span>
                    </div>
                    <ul className="space-y-1 text-zinc-600 dark:text-zinc-300">
                      <li className="flex gap-2">
                        <span className={cn("mt-0.5 font-bold", template.textAccent)}>•</span>
                        <span>Conducted 50+ generative research sessions to identify pain points in the onboarding flow, improving completion rate from 45% to 82%.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Two Column Layout at Bottom */}
              <div className="grid grid-cols-2 gap-6 mt-auto">
                {/* Skills */}
                <div>
                  <h3
                    className={cn(
                      "font-bold uppercase tracking-wider mb-2",
                      template.textAccent,
                      template.id === "professional" && "text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1"
                    )}
                  >
                    Core Skills
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Figma",
                      "User Research",
                      "Prototyping",
                      "Design Systems",
                      "Webflow",
                      "HTML/CSS",
                    ].map((skill) => (
                      <span
                        key={skill}
                        className={cn(
                          "px-2 py-1 rounded-md font-semibold transition-colors duration-500 shadow-sm border border-black/5 dark:border-white/5",
                          template.id === "modern" ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 rounded-lg" : template.accentLight,
                          template.id !== "modern" && template.textAccent,
                        )}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3
                    className={cn(
                      "font-bold uppercase tracking-wider mb-2 flex items-center gap-2",
                      template.textAccent,
                      template.id === "professional" && "text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-1"
                    )}
                  >
                    {template.id === "creative" && <GraduationCap className="w-3.5 h-3.5" />}
                    Education
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        B.F.A. Interactive Design
                      </p>
                      <div className="flex justify-between items-center text-zinc-500">
                        <span>Rhode Island School of Design</span>
                        <span className="text-[9px]">2014 - 2018</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* AI badge overlay */}
          <div className="absolute top-4 right-4 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur animate-pulse" />
              <Badge className="relative shadow-xl hover:scale-105 transition-transform cursor-default bg-background text-foreground border-primary/20 backdrop-blur-md">
                <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
                AI Enhanced
              </Badge>
            </div>
          </div>

          {/* Template name indicator */}
          <div className="absolute bottom-4 left-4 z-20 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", template.accent)} />
            <span className="text-xs font-medium text-foreground">{template.name}</span>
          </div>

          {/* Glass Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
        </Card>
      </motion.div>

      {/* Depth Shadow */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/20 dark:bg-black/40 blur-xl rounded-full -z-10 group-hover:scale-110 transition-transform duration-500" />
    </div>
  );
}
