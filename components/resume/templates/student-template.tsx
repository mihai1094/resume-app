"use client";

import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortEducationByDate,
  sortWorkExperienceByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface StudentTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Student Template
 * - Optimized for students and new graduates
 * - Single column, ATS-optimized layout
 * - Education section prominently placed before work experience
 * - Clean, modern design suitable for entry-level positions and internships
 * - Includes space for coursework, GPA, academic achievements, and projects
 */
export function StudentTemplate({
  data,
  customization,
}: StudentTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const extraCurricular = data.extraCurricular || [];

  const primary = customization?.primaryColor || "#1e40af"; // blue-800
  const accent = customization?.accentColor || "#3b82f6"; // blue-500
  const baseFontSize = customization?.fontSize ?? 11;
  const baseLineHeight = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing ?? 20;
  const fontFamily =
    customization?.fontFamily === "serif"
      ? "'Georgia', serif"
      : "'Inter', 'Helvetica Neue', Arial, sans-serif";

  // Determine if education should be shown first (student-friendly ordering)
  // Education goes first if there's minimal work experience
  const showEducationFirst = experience.length <= 1;

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
      <header className="text-center space-y-2 pb-4 border-b-2" style={{ borderColor: accent }}>
        <h1
          className="text-[28px] font-bold tracking-tight"
          style={{ color: primary }}
        >
          {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
            "Your Name"}
        </h1>
        {personalInfo.jobTitle && (
          <p className="text-sm text-slate-600 font-medium">
            {personalInfo.jobTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-700">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>|</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          {personalInfo.linkedin && (
            <span style={{ color: accent }}>
              {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
          )}
          {personalInfo.github && (
            <span style={{ color: accent }}>
              {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
          )}
          {personalInfo.website && (
            <span style={{ color: accent }}>
              {personalInfo.website.replace(/^https?:\/\//, "")}
            </span>
          )}
        </div>
      </header>

      {/* Summary / Objective */}
      {personalInfo.summary && (
        <section className="text-sm text-slate-700 leading-relaxed text-center px-4">
          {personalInfo.summary}
        </section>
      )}

      {/* Education - Shown first for students */}
      {showEducationFirst && education.length > 0 && (
        <EducationSection education={education} accent={accent} />
      )}

      {/* Work Experience / Internships */}
      {experience.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Experience" accent={accent} />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">{exp.position}</h3>
                    <p className="text-xs text-slate-600">
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(exp.startDate)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5 mt-1">
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

      {/* Education - Shown after experience for experienced candidates */}
      {!showEducationFirst && education.length > 0 && (
        <EducationSection education={education} accent={accent} />
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Projects" accent={accent} />
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold">{project.name}</h3>
                  {(project.startDate || project.endDate) && (
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">
                      {project.startDate && formatDate(project.startDate)}
                      {project.endDate && ` — ${formatDate(project.endDate)}`}
                    </div>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs text-slate-700">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-[11px] text-slate-500">
                    <span className="font-medium">Technologies:</span>{" "}
                    {project.technologies.join(", ")}
                  </p>
                )}
                {(project.url || project.github) && (
                  <div className="flex gap-3 text-[11px]">
                    {project.url && (
                      <span style={{ color: accent }}>
                        {project.url.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                    {project.github && (
                      <span style={{ color: accent }}>
                        {project.github.replace(/^https?:\/\/(www\.)?/, "")}
                      </span>
                    )}
                  </div>
                )}
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

      {/* Extracurricular Activities */}
      {extraCurricular.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Activities & Leadership" accent={accent} />
          <div className="space-y-3">
            {extraCurricular.map((activity) => (
              <div key={activity.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">
                      {activity.role || activity.title}
                    </h3>
                    {activity.organization && (
                      <p className="text-xs text-slate-600">{activity.organization}</p>
                    )}
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">
                      {activity.startDate && formatDate(activity.startDate)}
                      {activity.startDate && " — "}
                      {activity.current ? "Present" : activity.endDate && formatDate(activity.endDate)}
                    </div>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                    {activity.description
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

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Certifications" accent={accent} />
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{cert.name}</h3>
                  <p className="text-xs text-slate-600">{cert.issuer}</p>
                </div>
                {cert.date && (
                  <div className="text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(cert.date)}
                  </div>
                )}
              </div>
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
    <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: `${accent}40` }}>
      <h2
        className="text-[11px] font-semibold tracking-[0.15em] uppercase"
        style={{ color: accent }}
      >
        {title}
      </h2>
    </div>
  );
}

function EducationSection({
  education,
  accent,
}: {
  education: ResumeData["education"];
  accent: string;
}) {
  return (
    <section className="space-y-3">
      <SectionTitle title="Education" accent={accent} />
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold">{edu.institution}</h3>
                <p className="text-xs text-slate-700">
                  {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                </p>
                {edu.location && (
                  <p className="text-xs text-slate-500">{edu.location}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  {formatDate(edu.startDate)} —{" "}
                  {edu.current ? "Expected " + formatDate(edu.endDate || "") : formatDate(edu.endDate || "")}
                </div>
                {edu.gpa && (
                  <p className="text-[11px] text-slate-600 font-medium">
                    Grade: {edu.gpa}
                  </p>
                )}
              </div>
            </div>
            {edu.description && edu.description.length > 0 && (
              <div className="mt-1">
                <ul className="list-disc pl-4 text-xs text-slate-700 space-y-0.5">
                  {edu.description
                    .filter((d) => d.trim())
                    .map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default StudentTemplate;
