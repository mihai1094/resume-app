"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";

interface CubicTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Cubic Template - Clean Scannable Layout
 *
 * Single-column with left accent stripe. ATS-friendly, clean design.
 * Inspired by Zety's Cubic template - an HR favorite.
 */
export function CubicTemplate({ data, customization }: CubicTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const primaryColor = customization?.primaryColor || "#0ea5e9";
  const secondaryColor = customization?.accentColor || customization?.secondaryColor || "#22d3ee";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 24;

  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") return "'Georgia', serif";
    if (customization?.fontFamily === "mono") return "'Courier New', monospace";
    return "'Inter', system-ui, sans-serif";
  };

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  return (
    <div className="w-full bg-white text-gray-800 min-h-[297mm]" style={{ fontFamily: getFontFamily() }}>
      {/* Left accent stripe */}
      <div className="flex">
        <div
          className="w-2 min-h-[297mm] flex-shrink-0"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="flex-1 p-8" style={baseTextStyle}>
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
            </h1>
            {personalInfo.jobTitle && (
              <p className="text-lg mt-1" style={{ color: primaryColor }}>
                {personalInfo.jobTitle}
              </p>
            )}

            {/* Contact row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-600">
              {personalInfo.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" style={{ color: primaryColor }} />
                  {personalInfo.email}
                </span>
              )}
              {personalInfo.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" style={{ color: primaryColor }} />
                  {personalInfo.phone}
                </span>
              )}
              {personalInfo.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                  {personalInfo.location}
                </span>
              )}
              {personalInfo.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" style={{ color: primaryColor }} />
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </span>
              )}
              {personalInfo.linkedin && (
                <span className="flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4" style={{ color: primaryColor }} />
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              )}
              {personalInfo.github && (
                <span className="flex items-center gap-1.5">
                  <Github className="w-4 h-4" style={{ color: primaryColor }} />
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              )}
            </div>
          </header>

          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <div
                className="bg-gray-50 rounded-lg p-4"
                style={{ borderLeft: `4px solid ${primaryColor}` }}
              >
                <p className="text-sm text-gray-600 leading-relaxed">{personalInfo.summary}</p>
              </div>
            </section>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide mb-4">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <span style={{ color: primaryColor }}>Professional Experience</span>
              </h2>
              <div className="space-y-5">
                {sortedExperience.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-lg bg-gray-50/50 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {exp.company}
                          {exp.location && <span className="text-gray-500"> · {exp.location}</span>}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-600">
                        {exp.description.map((item, idx) => item.trim() && (
                          <li key={idx} className="flex gap-2">
                            <span className="text-gray-400">•</span>
                            <span>{item}</span>
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
          {sortedEducation.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide mb-4">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <span style={{ color: primaryColor }}>Education</span>
              </h2>
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {edu.degree}{edu.field && ` in ${edu.field}`}
                      </p>
                      <p className="text-sm" style={{ color: primaryColor }}>{edu.institution}</p>
                      {edu.gpa && <p className="text-xs text-gray-500">Grade: {edu.gpa}</p>}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills - Multi-column grid */}
          {Object.keys(skillsByCategory).length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide mb-4">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <span style={{ color: primaryColor }}>Skills</span>
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${primaryColor}10`,
                            color: primaryColor,
                          }}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide mb-4">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <span style={{ color: primaryColor }}>Projects</span>
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg bg-gray-50/50 border border-gray-100"
                  >
                    <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 rounded"
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
          {data.certifications && data.certifications.filter(c => c.type !== "course").length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide mb-4">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <span style={{ color: primaryColor }}>Certifications</span>
              </h2>
              <div className="flex flex-wrap gap-3">
                {data.certifications.filter(c => c.type !== "course").map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span style={{ color: primaryColor }}>✓</span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{cert.name}</span>
                      {cert.issuer && (
                        <span className="text-xs text-gray-500 ml-1">— {cert.issuer}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-base font-bold uppercase tracking-wide mb-4">
                <span
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: primaryColor }}
                />
                <span style={{ color: primaryColor }}>Languages</span>
              </h2>
              <div className="flex flex-wrap gap-4">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{lang.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                    >
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
