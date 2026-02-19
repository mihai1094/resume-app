"use client";

import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "../template-customizer";
import { MapPin, Phone, Mail, Globe, Linkedin, Github } from "lucide-react";

interface BoldTemplateProps {
  data: ResumeData;
  customization: TemplateCustomization;
}

/**
 * Bold Template
 *
 * A typography-focused, single-column template with:
 * - Extra-large name (32-40px)
 * - Bold uppercase section headers
 * - Strong contrast and generous whitespace
 * - Minimal accent colors for maximum ATS compatibility
 *
 * Best for: Executive, Sales, Management, General professional
 */
export function BoldTemplate({ data, customization }: BoldTemplateProps) {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages, hobbies } = data;
  const { primaryColor, secondaryColor } = customization;

  const hasWorkExperience = workExperience && workExperience.length > 0;
  const hasEducation = education && education.length > 0;
  const hasSkills = skills && skills.length > 0;
  const hasProjects = projects && projects.length > 0;
  const hasCertifications = certifications && certifications.length > 0;
  const hasLanguages = languages && languages.length > 0;
  const hasHobbies = hobbies && hobbies.length > 0;

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div
      className="w-[210mm] min-h-[297mm] bg-white mx-auto"
      style={{
        fontFamily: customization.fontFamily === "serif"
          ? "Georgia, 'Times New Roman', serif"
          : customization.fontFamily === "mono"
          ? "'Courier New', monospace"
          : "system-ui, -apple-system, sans-serif",
        fontSize: `${customization.fontSize}px`,
        lineHeight: customization.lineSpacing,
        padding: "48px 56px",
      }}
    >
      {/* Header - Large Bold Name */}
      <header className="mb-10">
        {/* Name */}
        <h1
          className="font-extrabold tracking-tight mb-3"
          style={{
            fontSize: "40px",
            lineHeight: 1.1,
            color: "#111827",
          }}
        >
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>

        {/* Title */}
        {personalInfo.jobTitle && (
          <p
            className="font-semibold uppercase tracking-widest mb-5"
            style={{
              fontSize: "14px",
              color: primaryColor,
              letterSpacing: "0.15em",
            }}
          >
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Row */}
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
          style={{
            fontSize: "12px",
            color: "#4b5563",
          }}
        >
          {personalInfo.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.website.replace(/^https?:\/\//, "")}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Professional Summary
          </h2>
          <p
            className="leading-relaxed"
            style={{
              fontSize: `${customization.fontSize}px`,
              color: "#374151",
            }}
          >
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {hasWorkExperience && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Experience
          </h2>
          <div className="space-y-5">
            {workExperience.map((job) => (
              <div key={job.id}>
                {/* Company Name - Bold and prominent */}
                <h3
                  className="font-bold"
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                  }}
                >
                  {job.company}
                </h3>
                {/* Title and Date Row */}
                <div className="flex justify-between items-baseline mt-0.5 mb-2">
                  <span
                    className="font-medium"
                    style={{
                      fontSize: `${customization.fontSize}px`,
                      color: primaryColor,
                    }}
                  >
                    {job.position}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(job.startDate)} — {job.current ? "Present" : formatDate(job.endDate)}
                    {job.location && ` | ${job.location}`}
                  </span>
                </div>
                {/* Description & Achievements */}
                {((job.description && job.description.length > 0) || (job.achievements && job.achievements.length > 0)) && (
                  <ul className="list-disc list-outside ml-4 space-y-1">
                    {job.description?.map((desc, idx) => (
                      <li
                        key={`desc-${idx}`}
                        style={{
                          fontSize: `${customization.fontSize - 1}px`,
                          color: "#4b5563",
                        }}
                      >
                        {desc}
                      </li>
                    ))}
                    {job.achievements?.map((achievement, idx) => (
                      <li
                        key={`ach-${idx}`}
                        style={{
                          fontSize: `${customization.fontSize - 1}px`,
                          color: "#4b5563",
                        }}
                      >
                        {achievement}
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
      {hasEducation && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                  }}
                >
                  {edu.institution}
                </h3>
                <div className="flex justify-between items-baseline mt-0.5">
                  <span
                    className="font-medium"
                    style={{
                      fontSize: `${customization.fontSize}px`,
                      color: primaryColor,
                    }}
                  >
                    {edu.degree}{edu.field && ` in ${edu.field}`}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate)}
                  </span>
                </div>
                {edu.gpa && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: `${customization.fontSize - 1}px`,
                      color: "#6b7280",
                    }}
                  >
                    Grade: {edu.gpa}
                  </p>
                )}
                {edu.description && edu.description.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5">
                    {edu.description.map((desc, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: `${customization.fontSize - 1}px`,
                          color: "#4b5563",
                        }}
                      >
                        {desc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills - Bold Tags */}
      {hasSkills && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="font-semibold px-3 py-1.5 rounded"
                style={{
                  fontSize: `${customization.fontSize - 1}px`,
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                  border: `1px solid ${primaryColor}30`,
                }}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {hasProjects && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-baseline">
                  <h3
                    className="font-bold"
                    style={{
                      fontSize: "14px",
                      color: "#111827",
                    }}
                  >
                    {project.name}
                  </h3>
                  {(project.startDate || project.endDate) && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                      }}
                    >
                      {formatDate(project.startDate)}{project.endDate ? ` — ${formatDate(project.endDate)}` : ""}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: `${customization.fontSize - 1}px`,
                      color: "#4b5563",
                    }}
                  >
                    {project.description}
                  </p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="font-medium px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: `${secondaryColor}15`,
                          color: secondaryColor,
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
      {hasCertifications && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline">
                <div>
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: `${customization.fontSize}px`,
                      color: "#111827",
                    }}
                  >
                    {cert.name}
                  </span>
                  {cert.issuer && (
                    <span
                      className="ml-2"
                      style={{
                        fontSize: `${customization.fontSize - 1}px`,
                        color: "#6b7280",
                      }}
                    >
                      — {cert.issuer}
                    </span>
                  )}
                </div>
                {cert.date && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(cert.date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {hasLanguages && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {languages.map((lang) => (
              <span
                key={lang.id}
                style={{
                  fontSize: `${customization.fontSize}px`,
                  color: "#374151",
                }}
              >
                <span className="font-semibold">{lang.name}</span>
                {lang.level && (
                  <span className="text-gray-500"> — {lang.level}</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Interests/Hobbies */}
      {hasHobbies && (
        <section>
          <h2
            className="font-bold uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "13px",
              color: "#111827",
              borderBottom: `2px solid ${primaryColor}`,
              letterSpacing: "0.1em",
            }}
          >
            Interests
          </h2>
          <p
            style={{
              fontSize: `${customization.fontSize}px`,
              color: "#4b5563",
            }}
          >
            {hobbies.map((h) => h.name).join(" • ")}
          </p>
        </section>
      )}
    </div>
  );
}
