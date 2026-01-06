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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Auto-rotate templates
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentTemplate((prev) => (prev + 1) % PREVIEW_TEMPLATES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTemplate = () => {
    setIsAutoPlaying(false);
    setCurrentTemplate((prev) => (prev + 1) % PREVIEW_TEMPLATES.length);
  };

  const prevTemplate = () => {
    setIsAutoPlaying(false);
    setCurrentTemplate(
      (prev) => (prev - 1 + PREVIEW_TEMPLATES.length) % PREVIEW_TEMPLATES.length
    );
  };

  const template = PREVIEW_TEMPLATES[currentTemplate];

  return (
    <div className="relative">
      {/* Template Switcher Controls */}
      <div className="absolute -top-8 left-0 right-0 flex items-center justify-end gap-2 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={prevTemplate}
          className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
          aria-label="Previous template"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex gap-1.5">
          {PREVIEW_TEMPLATES.map((t, index) => (
            <button
              key={t.id}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentTemplate(index);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                currentTemplate === index
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              aria-label={`Switch to ${t.name} template`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={nextTemplate}
          className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
          aria-label="Next template"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Realistic Resume Preview */}
      <Card className="shadow-2xl border-0 bg-white relative overflow-hidden group rotate-1 hover:rotate-0 transition-all duration-500 aspect-[8.5/11]">
        {/* Resume Content */}
        <div className="p-6 h-full flex flex-col text-[10px] leading-tight">
          {/* Header Section */}
          <div
            className={cn(
              "pb-4 mb-4 border-b-2 transition-colors duration-500",
              template.id === "modern" && "border-blue-600",
              template.id === "professional" && "border-slate-800",
              template.id === "creative" && "border-violet-600"
            )}
          >
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Sarah Johnson
            </h2>
            <p className={cn("text-xs font-medium mt-0.5", template.textAccent)}>
              Senior Product Designer
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-2.5 h-2.5" />
                sarah@email.com
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-2.5 h-2.5" />
                (555) 123-4567
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                San Francisco, CA
              </span>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="mb-4">
            <h3
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider mb-1.5",
                template.textAccent
              )}
            >
              Summary
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Product designer with 8+ years of experience creating user-centered
              digital experiences. Led design for products reaching 2M+ users.
            </p>
          </div>

          {/* Experience */}
          <div className="mb-3">
            <h3
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider mb-1.5",
                template.textAccent
              )}
            >
              Experience
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Lead Product Designer
                    </p>
                    <p className="text-gray-500">TechCorp Inc.</p>
                  </div>
                  <span className="text-gray-400 text-[9px]">2021 - Present</span>
                </div>
                <ul className="mt-1 space-y-0.5 text-gray-600">
                  <li className="flex gap-1">
                    <span className={cn("mt-1", template.textAccent)}>•</span>
                    <span>Redesigned checkout flow, increasing conversions by 34%</span>
                  </li>
                  <li className="flex gap-1">
                    <span className={cn("mt-1", template.textAccent)}>•</span>
                    <span>Led team of 5 designers across 3 product lines</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">Senior UX Designer</p>
                    <p className="text-gray-500">StartupXYZ</p>
                  </div>
                  <span className="text-gray-400 text-[9px]">2018 - 2021</span>
                </div>
                <ul className="mt-1 space-y-0.5 text-gray-600">
                  <li className="flex gap-1">
                    <span className={cn("mt-1", template.textAccent)}>•</span>
                    <span>Built design system used across 12 products</span>
                  </li>
                  <li className="flex gap-1">
                    <span className={cn("mt-1", template.textAccent)}>•</span>
                    <span>Reduced design-to-dev handoff time by 40%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="mb-3">
            <h3
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider mb-1.5",
                template.textAccent
              )}
            >
              Education
            </h3>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">B.A. in Graphic Design</p>
                <p className="text-gray-500">Stanford University</p>
              </div>
              <span className="text-gray-400 text-[9px]">2014 - 2018</span>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-3">
            <h3
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider mb-1.5",
                template.textAccent
              )}
            >
              Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {["Figma", "User Research", "Prototyping", "Design Systems", "A/B Testing", "Sketch"].map(
                (skill) => (
                  <span
                    key={skill}
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors duration-500",
                      template.accentLight,
                      template.textAccent
                    )}
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h3
              className={cn(
                "text-[11px] font-bold uppercase tracking-wider mb-1.5",
                template.textAccent
              )}
            >
              Certifications
            </h3>
            <div className="space-y-0.5 text-gray-600">
              <p>Google UX Design Professional Certificate</p>
              <p>Certified Usability Analyst (CUA)</p>
            </div>
          </div>
        </div>

        {/* AI badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge className="shadow-lg text-[10px] px-2 py-0.5">
            <Sparkles className="w-2.5 h-2.5 mr-1" />
            AI Enhanced
          </Badge>
        </div>

        {/* Template name badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            {template.name}
          </Badge>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Card>

      {/* Floating elements */}
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
    </div>
  );
}
