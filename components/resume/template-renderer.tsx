"use client";

import {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  type ComponentType,
  type CSSProperties,
} from "react";
import { Loader2 } from "lucide-react";
import {
  CURRENT_RESUME_SCHEMA_VERSION,
  ResumeData,
} from "@/lib/types/resume";
import { TemplateCustomization } from "./template-customizer";
import { TemplateId } from "@/lib/constants/templates";
import { prepareResumeDataForTemplateDisplay } from "@/lib/resume/skills-display";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import { cn } from "@/lib/utils";

const ModernTemplate = lazy(() =>
  import("./templates/modern-template").then((mod) => ({
    default: mod.ModernTemplate,
  }))
);
const ClassicTemplate = lazy(() =>
  import("./templates/classic-template").then((mod) => ({
    default: mod.ClassicTemplate,
  }))
);
const ExecutiveTemplate = lazy(() =>
  import("./templates/executive-template").then((mod) => ({
    default: mod.ExecutiveTemplate,
  }))
);
const MinimalistTemplate = lazy(() =>
  import("./templates/minimalist-template").then((mod) => ({
    default: mod.MinimalistTemplate,
  }))
);
const CreativeTemplate = lazy(() =>
  import("./templates/creative-template").then((mod) => ({
    default: mod.CreativeTemplate,
  }))
);
const TechnicalTemplate = lazy(() =>
  import("./templates/technical-template").then((mod) => ({
    default: mod.TechnicalTemplate,
  }))
);
const TimelineTemplate = lazy(() =>
  import("./templates/timeline-template").then((mod) => ({
    default: mod.TimelineTemplate,
  }))
);
const IvyTemplate = lazy(() =>
  import("./templates/ivy-template").then((mod) => ({
    default: mod.IvyTemplate,
  }))
);
const ATSClarityTemplate = lazy(() =>
  import("./templates/ats-clarity-template").then((mod) => ({
    default: mod.ATSClarityTemplate,
  }))
);
const ATSStructuredTemplate = lazy(() =>
  import("./templates/ats-structured-template").then((mod) => ({
    default: mod.ATSStructuredTemplate,
  }))
);
const ATSCompactTemplate = lazy(() =>
  import("./templates/ats-compact-template").then((mod) => ({
    default: mod.ATSCompactTemplate,
  }))
);
const DublinTemplate = lazy(() =>
  import("./templates/dublin-template").then((mod) => ({
    default: mod.DublinTemplate,
  }))
);
const InfographicTemplate = lazy(() =>
  import("./templates/infographic-template").then((mod) => ({
    default: mod.InfographicTemplate,
  }))
);
const CubicTemplate = lazy(() =>
  import("./templates/cubic-template").then((mod) => ({
    default: mod.CubicTemplate,
  }))
);
const BoldTemplate = lazy(() =>
  import("./templates/bold-template").then((mod) => ({
    default: mod.BoldTemplate,
  }))
);
const SimpleTemplate = lazy(() =>
  import("./templates/simple-template").then((mod) => ({
    default: mod.SimpleTemplate,
  }))
);
const IconicTemplate = lazy(() =>
  import("./templates/iconic-template").then((mod) => ({
    default: mod.IconicTemplate,
  }))
);
const StudentTemplate = lazy(() =>
  import("./templates/student-template").then((mod) => ({
    default: mod.StudentTemplate,
  }))
);
const FunctionalTemplate = lazy(() =>
  import("./templates/functional-template").then((mod) => ({
    default: mod.FunctionalTemplate,
  }))
);
const NotionTemplate = lazy(() =>
  import("./templates/notion-template").then((mod) => ({
    default: mod.NotionTemplate,
  }))
);
const NordicTemplate = lazy(() =>
  import("./templates/nordic-template").then((mod) => ({
    default: mod.NordicTemplate,
  }))
);
const HorizonTemplate = lazy(() =>
  import("./templates/horizon-template").then((mod) => ({
    default: mod.HorizonTemplate,
  }))
);
const ATSPureTemplate = lazy(() =>
  import("./templates/ats-pure-template").then((mod) => ({
    default: mod.ATSPureTemplate,
  }))
);
const ContemporaryTemplate = lazy(() =>
  import("./templates/contemporary-template").then((mod) => ({
    default: mod.ContemporaryTemplate,
  }))
);

const templateComponents: Record<TemplateId, ComponentType<any>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  executive: ExecutiveTemplate,
  minimalist: MinimalistTemplate,
  creative: CreativeTemplate,
  technical: TechnicalTemplate,
  timeline: TimelineTemplate,
  ivy: IvyTemplate,
  "ats-clarity": ATSClarityTemplate,
  "ats-structured": ATSStructuredTemplate,
  "ats-compact": ATSCompactTemplate,
  dublin: DublinTemplate,
  infographic: InfographicTemplate,
  cubic: CubicTemplate,
  bold: BoldTemplate,
  simple: SimpleTemplate,
  iconic: IconicTemplate,
  student: StudentTemplate,
  functional: FunctionalTemplate,
  notion: NotionTemplate,
  nordic: NordicTemplate,
  horizon: HorizonTemplate,
  "ats-pure": ATSPureTemplate,
  contemporary: ContemporaryTemplate,
};

export const TemplateRendererFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

interface TemplateRendererProps {
  templateId: TemplateId;
  data: ResumeData;
  customization?: TemplateCustomization;
  className?: string;
}

export function TemplateRenderer({
  templateId,
  data,
  customization,
  className,
}: TemplateRendererProps) {
  const TemplateComponent =
    templateComponents[templateId as TemplateId] || templateComponents.modern;

  const safeData = useMemo<ResumeData>(() => {
    const emptyArray: never[] = [];
    const normalized: ResumeData = {
      schemaVersion: data.schemaVersion ?? CURRENT_RESUME_SCHEMA_VERSION,
      personalInfo: {
        ...data.personalInfo,
        firstName: data.personalInfo?.firstName || "",
        lastName: data.personalInfo?.lastName || "",
        email: data.personalInfo?.email || "",
        phone: data.personalInfo?.phone || "",
        location: data.personalInfo?.location || "",
        website: data.personalInfo?.website || "",
        linkedin: data.personalInfo?.linkedin || "",
        github: data.personalInfo?.github || "",
        summary: data.personalInfo?.summary || "",
      },
      workExperience: data.workExperience || emptyArray,
      education: data.education || emptyArray,
      skills: data.skills || emptyArray,
      projects: data.projects || emptyArray,
      languages: data.languages || emptyArray,
      certifications: data.certifications || emptyArray,
      courses: data.courses || emptyArray,
      hobbies: data.hobbies || emptyArray,
      extraCurricular: data.extraCurricular || emptyArray,
      customSections: data.customSections || emptyArray,
    };
    return prepareResumeDataForTemplateDisplay(normalized, templateId);
  }, [data, templateId]);

  useEffect(() => {
    const startMark = `render-${templateId}-start`;
    const endMark = `render-${templateId}-end`;
    performance.mark(startMark);
    return () => {
      performance.mark(endMark);
      performance.measure(
        `render-${templateId}`,
        startMark,
        endMark
      );
    };
  }, [templateId, safeData]);

  const templateScaleStyle = useMemo<CSSProperties>(() => {
    const baseline = DEFAULT_TEMPLATE_CUSTOMIZATION.fontSize;
    const configuredFontSize = customization?.fontSize ?? baseline;
    const normalizedScale = Number((configuredFontSize / baseline).toFixed(4));
    return {
      ["--resume-text-scale" as string]: normalizedScale,
    };
  }, [customization?.fontSize]);

  return (
    <div className={cn("resume-template-scale", className)} style={templateScaleStyle}>
      <Suspense fallback={<TemplateRendererFallback />}>
        <TemplateComponent data={safeData} customization={customization} />
      </Suspense>
    </div>
  );
}
