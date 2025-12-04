"use client";

import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortEducationByDate,
  sortWorkExperienceByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface ATSStructuredTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Structured ATS
 * - Two-column grid with strict alignment
 * - Left column labels; right column content
 * - Thin dividers, muted color palette for parsing clarity
 */
export function ATSStructuredTemplate({
  data,
  customization,
}: ATSStructuredTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];

  const primary = customization?.primaryColor || "#111827"; // slate-900
  const accent = customization?.accentColor || "#10b981"; // emerald-500
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineHeight = customization?.lineSpacing ?? 1.6;
  const fontFamily =
    customization?.fontFamily === "serif"
      ? "'Georgia', serif"
      : "'Inter', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div
      className="w-full bg-white text-slate-900 min-h-[297mm] p-12 space-y-10"
      style={{ fontFamily, fontSize: `${baseFontSize}px`, lineHeight: baseLineHeight }}
    >
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h1
            className="text-[34px] font-semibold tracking-tight"
            style={{ color: primary }}
          >
            {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
              "Your Name"}
          </h1>
          <div className="text-sm text-slate-700 flex flex-wrap gap-3 justify-end">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
          </div>
        </div>
        {personalInfo.summary && (
          <p className="text-base text-slate-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        )}
      </header>

      <Divider accent={accent} />

      <SectionGrid
        title="Experience"
        accent={accent}
        content={
          experience.length > 0 ? (
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-600 uppercase tracking-[0.2em]">
                        {exp.company}
                      </p>
                      <h3 className="text-lg font-semibold">{exp.position}</h3>
                      {exp.location && (
                        <p className="text-sm text-slate-600">{exp.location}</p>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(exp.startDate)} —{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </div>
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                      {exp.description
                        .filter((d) => d.trim())
                        .map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : null
        }
      />

      <SectionGrid
        title="Education"
        accent={accent}
        content={
          education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-600 uppercase tracking-[0.2em]">
                        {edu.institution}
                      </p>
                      <h3 className="text-base font-semibold">
                        {[edu.degree, edu.field].filter(Boolean).join(" — ")}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(edu.startDate)} —{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </div>
                  </div>
                  {edu.gpa && (
                    <p className="text-xs text-slate-600">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null
        }
      />

      <SectionGrid
        title="Skills"
        accent={accent}
        content={
          skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-sm text-slate-800">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : null
        }
      />

      <SectionGrid
        title="Languages"
        accent={accent}
        content={
          languages.length > 0 ? (
            <div className="flex flex-wrap gap-3 text-sm text-slate-800">
              {languages.map((lang) => (
                <div
                  key={lang.id}
                  className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200"
                >
                  {lang.name} — {lang.level}
                </div>
              ))}
            </div>
          ) : null
        }
      />
    </div>
  );
}

function SectionGrid({
  title,
  accent,
  content,
}: {
  title: string;
  accent: string;
  content: React.ReactNode;
}) {
  if (!content) return null;
  return (
    <div className="grid grid-cols-4 gap-6 items-start">
      <div className="col-span-1">
        <h2 className="text-xs font-semibold tracking-[0.3em] uppercase text-slate-700">
          {title}
        </h2>
        <div className="mt-2 h-[2px]" style={{ backgroundColor: `${accent}80` }} />
      </div>
      <div className="col-span-3 space-y-3">{content}</div>
    </div>
  );
}

function Divider({ accent }: { accent: string }) {
  return (
    <div className="h-px w-full" style={{ backgroundColor: `${accent}40` }} />
  );
}

