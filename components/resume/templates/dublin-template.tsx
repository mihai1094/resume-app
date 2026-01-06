"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";

interface DublinTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Dublin Template - Professional with Personality
 *
 * Two-column asymmetric layout (65/35 split) with photo and elegant header.
 * Inspired by Resume.io's Dublin template.
 */
export function DublinTemplate({ data, customization }: DublinTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const primaryColor = customization?.primaryColor || "#334155";
  const secondaryColor = customization?.secondaryColor || "#64748b";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 20;

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
      {/* Header with elegant typography */}
      <header className="px-8 pt-8 pb-6 border-b-2" style={{ borderColor: primaryColor }}>
        <div className="flex items-start gap-6">
          {/* Photo */}
          {personalInfo.photo && (
            <img
              src={personalInfo.photo}
              alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
              className="w-28 h-28 object-cover rounded-lg shadow-md"
            />
          )}
          <div className="flex-1">
            <h1
              className="text-4xl font-light tracking-tight"
              style={{ color: primaryColor, fontFamily: "'Georgia', serif" }}
            >
              {personalInfo.firstName || "Your"}{" "}
              <span className="font-bold">{personalInfo.lastName || "Name"}</span>
            </h1>
            {personalInfo.jobTitle && (
              <p className="text-lg mt-1" style={{ color: secondaryColor }}>
                {personalInfo.jobTitle}
              </p>
            )}
            {/* Contact row */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              {personalInfo.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  {personalInfo.email}
                </span>
              )}
              {personalInfo.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  {personalInfo.phone}
                </span>
              )}
              {personalInfo.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                  {personalInfo.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex" style={baseTextStyle}>
        {/* Main Content - 65% */}
        <main className="w-[65%] p-8 pr-6">
          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <p className="text-sm text-gray-600 leading-relaxed">{personalInfo.summary}</p>
            </section>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4 pb-2"
                style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
              >
                Work Experience
              </h2>
              <div className="space-y-5">
                {sortedExperience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {exp.company}{exp.location && ` · ${exp.location}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4 bg-gray-100 px-2 py-1 rounded">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
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
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4 pb-2"
                style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {edu.degree}{edu.field && ` in ${edu.field}`}
                        </p>
                        <p className="text-sm" style={{ color: primaryColor }}>{edu.institution}</p>
                        {edu.gpa && <p className="text-xs text-gray-500 mt-0.5">GPA: {edu.gpa}</p>}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4 pb-2"
                style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
              >
                Projects
              </h2>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
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
              <h2
                className="text-sm font-semibold uppercase tracking-wider mb-4 pb-2"
                style={{ color: primaryColor, borderBottom: `2px solid ${primaryColor}` }}
              >
                Certifications
              </h2>
              <div className="space-y-2">
                {data.certifications.filter(c => c.type !== "course").map((cert) => (
                  <div key={cert.id} className="flex items-start gap-2 text-sm">
                    <span style={{ color: primaryColor }}>✓</span>
                    <div>
                      <span className="font-medium text-gray-900">{cert.name}</span>
                      {cert.issuer && <span className="text-gray-500"> — {cert.issuer}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar - 35% */}
        <aside className="w-[35%] bg-gray-50 p-6 min-h-full">
          {/* Links */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Links
            </h3>
            <div className="space-y-2 text-sm">
              {personalInfo.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="break-all">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Skills
              </h3>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="text-xs px-2 py-1 bg-white border border-gray-200 rounded"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Languages
              </h3>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-sm">
                    <span>{lang.name}</span>
                    <span className="text-gray-500 capitalize">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {data.hobbies && data.hobbies.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Interests
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.hobbies.map((hobby) => (
                  <span
                    key={hobby.id}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                  >
                    {hobby.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
