"use client";

import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortEducationByDate,
  sortWorkExperienceByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface ATSCompactTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Compact ATS
 * - Condensed typography, reduced vertical rhythm
 * - Focus on quick scanning for early-career roles
 * - Tight bullet spacing and concise headers
 */
export function ATSCompactTemplate({
  data,
  customization,
}: ATSCompactTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];

  const primary = customization?.primaryColor || "#0f172a"; // slate-900
  const accent = customization?.accentColor || "#6366f1"; // indigo-500
  const baseFontSize = customization?.fontSize ?? 11.5;
  const baseLineHeight = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing ?? 24;
  const fontFamily =
    customization?.fontFamily === "serif"
      ? "'Georgia', serif"
      : "'Inter', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div
      className="w-full bg-white text-slate-900 min-h-[297mm] p-10"
      style={{
        fontFamily,
        fontSize: `${baseFontSize}px`,
        lineHeight: baseLineHeight,
        display: "flex",
        flexDirection: "column",
        gap: `${sectionSpacing}px`,
      }}
    >
      {/* Header */}
      <header className="space-y-2">
        <h1
          className="text-[30px] font-semibold tracking-tight"
          style={{ color: primary }}
        >
          {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
            "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            {personalInfo.jobTitle}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-slate-700">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.linkedin && (
            <span>
              {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="text-sm text-slate-700 leading-relaxed">
          {personalInfo.summary}
        </section>
      )}

      <Divider accent={accent} />

      {/* Experience */}
      {experience.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Experience" accent={accent} />
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">{exp.position}</h3>
                    <p className="text-xs text-slate-700">
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
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
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Education" accent={accent} />
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">
                      {[edu.degree, edu.field].filter(Boolean).join(" — ")}
                    </h3>
                    <p className="text-xs text-slate-700">{edu.institution}</p>
                  </div>
                  <div className="text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDate(edu.startDate)} —{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
                {edu.gpa && <p className="text-[11px] text-slate-600">Grade: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Skills" accent={accent} />
          <div className="flex flex-wrap gap-1.5 text-xs text-slate-800">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Languages" accent={accent} />
          <div className="flex flex-wrap gap-2 text-xs text-slate-800">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200"
              >
                {lang.name} — {lang.level}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-3 w-1 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <h2 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-800">
        {title}
      </h2>
    </div>
  );
}

function Divider({ accent }: { accent: string }) {
  return (
    <div className="h-px w-full" style={{ backgroundColor: `${accent}40` }} />
  );
}
