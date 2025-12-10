"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { Mail, MapPin, Globe, Linkedin, Github, Terminal } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";

interface TechnicalTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Technical Template - Developer/IDE Inspired
 *
 * A dark-theme template inspired by code editors and IDEs. Features syntax
 * highlighting colors, terminal-style formatting, and a layout that appeals
 * to developers and technical professionals.
 */
export function TechnicalTemplate({ data, customization }: TechnicalTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // VS Code Dark+ inspired color palette
  const colors = {
    bg: "#1e1e1e",
    sidebar: "#252526",
    hover: "#2a2d2e",
    border: "#3c3c3c",
    text: "#d4d4d4",
    textMuted: "#808080",
    keyword: "#569cd6", // blue
    function: "#dcdcaa", // yellow
    string: "#ce9178", // orange
    variable: "#9cdcfe", // light blue
    comment: "#6a9955", // green
    type: "#4ec9b0", // teal
    number: "#b5cea8", // light green
    error: "#f48771", // red/coral
  };

  // Customization overrides
  const primaryColor = customization?.primaryColor || colors.keyword;
  const secondaryColor = customization?.secondaryColor || colors.function;
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing || 32;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  // Font family mapping
  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") {
      return "'Georgia', 'Times New Roman', serif";
    } else if (customization?.fontFamily === "mono") {
      return "'Courier New', 'Courier', monospace";
    } else if (customization?.fontFamily === "sans") {
      return "'Inter', 'Helvetica Neue', Arial, sans-serif";
    } else if (customization?.fontFamily) {
      return customization.fontFamily;
    }
    return "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace";
  };

  return (
    <div
      className="w-full min-h-[297mm]"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: getFontFamily(),
      }}
    >
      {/* Window Title Bar */}
      <div
        className="flex items-center px-4 py-2 text-xs"
        style={{ backgroundColor: colors.sidebar, borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex gap-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2" style={{ color: colors.textMuted }}>
          <Terminal className="w-3 h-3" />
          <span>{fullName.toLowerCase().replace(/\s+/g, "_")}_resume.md</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Contact & Skills */}
        <aside
          className="w-64 p-6 flex-shrink-0 space-y-6"
          style={{
            backgroundColor: colors.sidebar,
            borderRight: `1px solid ${colors.border}`,
          }}
        >
          {/* Profile Section */}
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: colors.function }}
            >
              {fullName || "Your Name"}
            </h1>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: colors.type }}
            >
              {/* Extract title from summary or use default */}
              {personalInfo.summary?.split(".")[0]?.slice(0, 40) || "Software Developer"}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2" style={baseTextStyle}>
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.comment }}>
              {"// Contact"}
            </div>
            {personalInfo.email && (
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3 h-3" style={{ color: colors.keyword }} />
                <span style={{ color: colors.string }}>&quot;{personalInfo.email}&quot;</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3 h-3" style={{ color: colors.keyword }} />
                <span style={{ color: colors.string }}>&quot;{personalInfo.location}&quot;</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2 text-xs">
                <Linkedin className="w-3 h-3" style={{ color: colors.keyword }} />
                <span style={{ color: colors.variable }}>
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-2 text-xs">
                <Github className="w-3 h-3" style={{ color: colors.keyword }} />
                <span style={{ color: colors.variable }}>
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2 text-xs">
                <Globe className="w-3 h-3" style={{ color: colors.keyword }} />
                <span style={{ color: colors.variable }}>
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </span>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="space-y-4" style={baseTextStyle}>
              <div className="text-xs uppercase tracking-wider" style={{ color: colors.comment }}>
                {"// Tech Stack"}
              </div>
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <div
                    className="text-xs font-bold mb-2"
                    style={{ color: colors.type }}
                  >
                    {category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.variable,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider" style={{ color: colors.comment }}>
                {"// Languages"}
              </div>
              <div className="space-y-1">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="text-xs flex justify-between">
                    <span style={{ color: colors.text }}>{lang.name}</span>
                    <span style={{ color: colors.textMuted }}>
                      {lang.level === "native" && "●●●●"}
                      {lang.level === "fluent" && "●●●○"}
                      {lang.level === "conversational" && "●●○○"}
                      {lang.level === "basic" && "●○○○"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8" style={{ ...baseTextStyle, display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          {/* Summary */}
          {personalInfo.summary && (
            <section>
              <pre
                className="text-sm whitespace-pre-wrap"
                style={{ color: colors.comment }}
              >
                {`/**
 * ${personalInfo.summary}
 */`}
              </pre>
            </section>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 pb-2 flex items-center gap-2"
                style={{
                  color: colors.function,
                  borderBottom: `2px solid ${colors.border}`
                }}
              >
                <span style={{ color: colors.keyword }}>const</span>
                experience
                <span style={{ color: colors.keyword }}>=</span>
                <span style={{ color: colors.type }}>[</span>
              </h2>

              <div className="space-y-6 ml-4">
                {sortedExperience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderLeft: `3px solid ${index === 0 ? colors.keyword : colors.border}`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold" style={{ color: colors.function }}>
                          {exp.position}
                        </h3>
                        <div className="text-sm">
                          <span style={{ color: colors.type }}>@</span>
                          <span style={{ color: colors.variable }}>{exp.company}</span>
                          {exp.location && (
                            <span style={{ color: colors.textMuted }}> • {exp.location}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.number,
                        }}
                      >
                        {formatDate(exp.startDate)} → {exp.current ? "now" : formatDate(exp.endDate || "")}
                      </div>
                    </div>

                    {exp.description.length > 0 && (
                      <ul className="space-y-1.5 text-sm mt-3">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span style={{ color: colors.keyword }}>→</span>
                                <span style={{ color: colors.text }}>{item}</span>
                              </li>
                            )
                        )}
                      </ul>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div
                        className="mt-3 p-3 rounded"
                        style={{ backgroundColor: colors.hover }}
                      >
                        <div
                          className="text-xs mb-2"
                          style={{ color: colors.comment }}
                        >
                          {"// Key achievements"}
                        </div>
                        <ul className="space-y-1 text-sm">
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <li key={idx} className="flex gap-2">
                                  <span style={{ color: colors.comment }}>✓</span>
                                  <span style={{ color: colors.string }}>{achievement}</span>
                                </li>
                              )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="text-lg font-bold mt-4"
                style={{ color: colors.type }}
              >
                ];
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 pb-2 flex items-center gap-2"
                style={{
                  color: colors.function,
                  borderBottom: `2px solid ${colors.border}`
                }}
              >
                <span style={{ color: colors.keyword }}>const</span>
                projects
                <span style={{ color: colors.keyword }}>=</span>
                <span style={{ color: colors.type }}>[</span>
              </h2>

              <div className="grid grid-cols-2 gap-4 ml-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.sidebar,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: colors.keyword }}>{"{"}</span>
                      <h3 className="font-bold" style={{ color: colors.function }}>
                        {project.name}
                      </h3>
                      <span style={{ color: colors.keyword }}>{"}"}</span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: colors.textMuted }}>
                      {project.description}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: colors.hover,
                              color: colors.type,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {(project.url || project.github) && (
                      <div className="mt-2 text-xs" style={{ color: colors.variable }}>
                        {project.github && <span>github.com/{project.github.split("/").pop()}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="text-lg font-bold mt-4"
                style={{ color: colors.type }}
              >
                ];
              </div>
            </section>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 pb-2 flex items-center gap-2"
                style={{
                  color: colors.function,
                  borderBottom: `2px solid ${colors.border}`
                }}
              >
                <span style={{ color: colors.keyword }}>const</span>
                education
                <span style={{ color: colors.keyword }}>=</span>
                <span style={{ color: colors.type }}>[</span>
              </h2>

              <div className="space-y-4 ml-4">
                {sortedEducation.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderLeft: `3px solid ${colors.comment}`,
                    }}
                  >
                    <h3 className="font-bold" style={{ color: colors.function }}>
                      {edu.degree}
                      {edu.field && (
                        <span style={{ color: colors.textMuted }}> in </span>
                      )}
                      {edu.field && (
                        <span style={{ color: colors.type }}>{edu.field}</span>
                      )}
                    </h3>
                    <div className="text-sm mt-1">
                      <span style={{ color: colors.variable }}>{edu.institution}</span>
                      <span style={{ color: colors.textMuted }}> • </span>
                      <span style={{ color: colors.number }}>
                        {formatDate(edu.startDate)} → {edu.current ? "now" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                    {edu.gpa && (
                      <div className="text-xs mt-2" style={{ color: colors.comment }}>
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="text-lg font-bold mt-4"
                style={{ color: colors.type }}
              >
                ];
              </div>
            </section>
          )}

          {/* Certifications */}
          {(() => {
            const coursesFromCerts = data.certifications?.filter(c => c.type === "course") || [];
            const legacyCourses = data.courses || [];
            const allCourses = [...coursesFromCerts.map(c => ({
              id: c.id,
              name: c.name,
              institution: c.issuer,
              date: c.date,
              credentialId: c.credentialId,
              url: c.url,
            })), ...legacyCourses];
            return allCourses.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-4 flex items-center gap-2"
                  style={{ color: colors.function }}
                >
                  <span style={{ color: colors.comment }}>// </span>
                  Certifications
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {allCourses.map((course) => (
                    <div
                      key={course.id}
                      className="text-sm p-3 rounded"
                      style={{ backgroundColor: colors.sidebar }}
                    >
                      <span style={{ color: colors.string }}>{course.name}</span>
                      {course.institution && (
                        <span style={{ color: colors.textMuted }}> @ {course.institution}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}
        </main>
      </div>

      {/* Empty State */}
      {!personalInfo.firstName &&
        workExperience.length === 0 &&
        education.length === 0 &&
        skills.length === 0 && (
          <div className="text-center py-20" style={{ color: colors.textMuted }}>
            <p className="text-lg mb-2">// Your resume preview will appear here</p>
            <p className="text-sm">
              // Start filling out the form to see your resume come to life
            </p>
          </div>
        )}
    </div>
  );
}
