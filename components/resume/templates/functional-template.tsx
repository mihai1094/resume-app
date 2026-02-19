"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface FunctionalTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Functional Template - Skills-First Format
 *
 * Single-column layout optimized for career changers.
 * - Skills section is prominent and appears first (after summary)
 * - Groups skills by category with level indicators
 * - Work experience is condensed (titles/dates, minimal detail)
 * - Good ATS compatibility
 * - No photos
 */
export function FunctionalTemplate({
  data,
  customization,
}: FunctionalTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  const primaryColor = customization?.primaryColor || "#1e3a5f";
  const accentColor = customization?.accentColor || "#3b82f6";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineHeight = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 24;

  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") return "'Georgia', serif";
    if (customization?.fontFamily === "mono")
      return "'Courier New', monospace";
    return "'Inter', 'Helvetica Neue', Arial, sans-serif";
  };

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineHeight,
    fontFamily: getFontFamily(),
  };

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      const category = skill.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, typeof skills>
  );

  const levelToWidth: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };

  const fullName =
    [personalInfo.firstName, personalInfo.lastName]
      .filter(Boolean)
      .join(" ") || "Your Name";

  return (
    <div
      className="w-full bg-white text-slate-800 min-h-[297mm] p-10"
      style={baseTextStyle}
    >
      {/* Header */}
      <header className="text-center pb-6 mb-6 border-b-2" style={{ borderColor: primaryColor }}>
        <h1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: primaryColor }}
        >
          {fullName}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-lg text-slate-600 mb-3">{personalInfo.jobTitle}</p>
        )}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
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
            <span>
              {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Professional Summary" primaryColor={primaryColor} />
          <p className="text-sm text-slate-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Skills - PROMINENT, FIRST after summary */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Core Competencies" primaryColor={primaryColor} />
          <div className="space-y-5">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: accentColor }}
                >
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {categorySkills.map((skill) => {
                    const width = skill.level ? levelToWidth[skill.level] : 70;
                    return (
                      <div key={skill.id} className="flex items-center gap-3">
                        <span className="text-sm text-slate-700 min-w-[120px]">
                          {skill.name}
                        </span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${width}%`,
                              backgroundColor: accentColor,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience - Condensed */}
      {experience.length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Professional Experience" primaryColor={primaryColor} />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="pb-3 border-b border-slate-100 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                    <p className="text-sm text-slate-600">
                      {exp.company}
                      {exp.location && ` | ${exp.location}`}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </span>
                </div>
                {/* Show only top 2-3 bullet points for condensed view */}
                {exp.description && exp.description.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {exp.description
                      .filter((d) => d.trim())
                      .slice(0, 3)
                      .map((d, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span style={{ color: accentColor }}>•</span>
                          <span>{d}</span>
                        </li>
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
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Education" primaryColor={primaryColor} />
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900">
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </p>
                  <p className="text-sm text-slate-600">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-xs text-slate-500 mt-1">Grade: {edu.gpa}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Projects" primaryColor={primaryColor} />
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                <p className="text-sm text-slate-600">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Certifications" primaryColor={primaryColor} />
          <div className="grid grid-cols-2 gap-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex gap-2 text-sm">
                <span style={{ color: accentColor }}>●</span>
                <div>
                  <p className="font-medium text-slate-900">{cert.name}</p>
                  {cert.issuer && (
                    <p className="text-xs text-slate-500">
                      {cert.issuer}
                      {cert.date && ` • ${formatDate(cert.date)}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section>
          <SectionTitle title="Languages" primaryColor={primaryColor} />
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="px-3 py-1 rounded-md text-sm"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              >
                {lang.name}
                <span className="text-slate-500"> — {lang.level}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTitle({
  title,
  primaryColor,
}: {
  title: string;
  primaryColor: string;
}) {
  return (
    <div className="mb-4 pb-2 border-b" style={{ borderColor: `${primaryColor}30` }}>
      <h2
        className="text-sm font-bold uppercase tracking-[0.2em]"
        style={{ color: primaryColor }}
      >
        {title}
      </h2>
    </div>
  );
}

export default FunctionalTemplate;
