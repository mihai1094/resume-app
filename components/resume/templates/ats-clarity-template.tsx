"use client";

import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortEducationByDate,
  sortWorkExperienceByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface ATSClarityTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Clarity ATS
 * - Single-column, wide gutters, bold section headers
 * - Ample whitespace, left-aligned labels, simple separators
 * - Designed for ATS parsing with clear hierarchy
 */
export function ATSClarityTemplate({
  data,
  customization,
}: ATSClarityTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];

  const primary = customization?.primaryColor || "#0f172a"; // slate-900
  const accent = customization?.accentColor || "#0ea5e9"; // sky-500
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineHeight = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing ?? 40;
  const fontFamily =
    customization?.fontFamily === "serif"
      ? "'Georgia', serif"
      : "'Inter', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div
      className="w-full bg-white text-slate-900 min-h-[297mm] p-12"
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
      <header className="space-y-3">
        <h1
          className="text-4xl font-semibold tracking-tight"
          style={{ color: primary }}
        >
          {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
            "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p
            className="text-sm font-semibold uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            {personalInfo.jobTitle}
          </p>
        )}
        {personalInfo.summary && (
          <p className="text-base text-slate-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-slate-700">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && (
            <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
          )}
          {personalInfo.linkedin && (
            <span>
              {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
          )}
          {personalInfo.github && (
            <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
          )}
        </div>
      </header>

      {/* Experience */}
      {experience.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="Experience" accent={accent} />
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <p className="text-sm text-slate-700">
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </p>
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
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="Education" accent={accent} />
          <div className="space-y-5">
            {education.map((edu) => (
              <div key={edu.id} className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{edu.institution}</h3>
                    <p className="text-sm text-slate-700">
                      {[edu.degree, edu.field].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(edu.startDate)} —{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
                {edu.gpa && (
                  <p className="text-xs text-slate-600">Grade: {edu.gpa}</p>
                )}
                {edu.description && edu.description.length > 0 && (
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    {edu.description
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

      {/* Skills */}
      {skills.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Skills" accent={accent} />
          <div className="flex flex-wrap gap-2 text-sm text-slate-800">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Languages" accent={accent} />
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
        </section>
      )}
    </div>
  );
}

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-4 w-1.5 rounded-full"
        style={{ backgroundColor: accent }}
      />
      <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-800">
        {title}
      </h2>
    </div>
  );
}
