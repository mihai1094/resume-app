"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";

interface ExecutiveTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Executive Template - Premium C-Suite Design
 *
 * A sophisticated, high-end design for senior executives and leaders.
 * Features elegant typography, monogram accent, refined spacing, and
 * a focus on achievements and impact metrics.
 */
export function ExecutiveTemplate({ data, customization }: ExecutiveTemplateProps) {
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
  const initials = `${personalInfo.firstName?.[0] || ""}${personalInfo.lastName?.[0] || ""}`;

  // Premium color palette - deep navy with gold accent
  const primaryColor = customization?.primaryColor || "#1e293b";
  const accentColor = customization?.secondaryColor || "#b8860b";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing || 40;

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
    return "'Libre Baskerville', 'Georgia', serif";
  };

  // Aggregate key wins from all experiences
  const aggregatedWins = sortedExperience
    .flatMap((exp) => exp.achievements || [])
    .filter((item) => item && item.trim().length > 0)
    .slice(0, 4);

  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm]"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Top Border Accent */}
      <div
        className="h-2"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="p-12">
        {/* Executive Header */}
        <header className="mb-12 pb-8 border-b-2" style={{ borderColor: primaryColor }}>
          <div className="flex items-start gap-8">
            {/* Monogram */}
            <div
              className="w-24 h-24 flex items-center justify-center text-4xl font-bold flex-shrink-0"
              style={{
                backgroundColor: primaryColor,
                color: "white",
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              {initials || "CV"}
            </div>

            <div className="flex-1">
              <h1
                className="text-4xl font-bold tracking-tight mb-1"
                style={{
                  color: primaryColor,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {fullName || "Your Name"}
              </h1>

              {/* Contact Row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm" style={{ color: primaryColor }}>
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" style={{ color: accentColor }} />
                    <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div style={baseTextStyle}>
          {/* Executive Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2
                className="text-xs font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-3"
                style={{ color: accentColor }}
              >
                <span className="w-8 h-px" style={{ backgroundColor: accentColor }} />
                Executive Summary
                <span className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: primaryColor }}
              >
                {personalInfo.summary}
              </p>
            </section>
          )}

          {/* Key Achievements Highlight */}
          {aggregatedWins.length > 0 && (
            <section className="p-6 border-l-4" style={{
              marginBottom: `${sectionSpacing}px`,
              borderColor: accentColor,
              backgroundColor: `${primaryColor}05`,
            }}>
              <h2
                className="text-xs font-bold uppercase tracking-[0.3em] mb-4"
                style={{ color: accentColor }}
              >
                Career Highlights
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {aggregatedWins.map((win, idx) => (
                  <div key={`${win}-${idx}`} className="flex gap-3">
                    <span
                      className="text-lg font-bold flex-shrink-0"
                      style={{ color: accentColor }}
                    >
                      ◆
                    </span>
                    <span className="text-sm" style={{ color: primaryColor }}>{win}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Professional Experience */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2
                className="text-xs font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3"
                style={{ color: accentColor }}
              >
                <span className="w-8 h-px" style={{ backgroundColor: accentColor }} />
                Professional Experience
                <span className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
              </h2>

              <div className="space-y-8">
                {sortedExperience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    {/* Timeline indicator */}
                    {index < sortedExperience.length - 1 && (
                      <div
                        className="absolute left-[11px] top-8 bottom-0 w-px"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      />
                    )}

                    <div className="flex gap-6">
                      {/* Timeline dot */}
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 mt-1 flex items-center justify-center"
                        style={{
                          backgroundColor: index === 0 ? accentColor : `${primaryColor}20`,
                        }}
                      >
                        {index === 0 && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3
                              className="text-lg font-bold"
                              style={{ color: primaryColor }}
                            >
                              {exp.position}
                            </h3>
                            <p className="text-base" style={{ color: accentColor }}>
                              {exp.company}
                              {exp.location && (
                                <span className="text-gray-500"> — {exp.location}</span>
                              )}
                            </p>
                          </div>
                          <span
                            className="text-xs font-medium whitespace-nowrap ml-6 px-3 py-1"
                            style={{
                              backgroundColor: `${primaryColor}08`,
                              color: primaryColor,
                            }}
                          >
                            {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                          </span>
                        </div>

                        {/* Achievements First for Executive Focus */}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mb-4">
                            <div className="space-y-2">
                              {exp.achievements.map(
                                (achievement, idx) =>
                                  achievement.trim() && (
                                    <div key={idx} className="flex gap-3 text-sm">
                                      <span style={{ color: accentColor }}>◆</span>
                                      <span style={{ color: primaryColor }}>{achievement}</span>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {exp.description.length > 0 && (
                          <ul className="space-y-2 text-sm text-gray-600">
                            {exp.description.map(
                              (item, idx) =>
                                item.trim() && (
                                  <li key={idx} className="flex gap-3">
                                    <span className="text-gray-400">—</span>
                                    <span>{item}</span>
                                  </li>
                                )
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Two Column Layout for Education & Skills */}
          <div className="grid grid-cols-2 gap-12">
            {/* Education */}
            {sortedEducation.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3"
                  style={{ color: accentColor }}
                >
                  <span className="w-8 h-px" style={{ backgroundColor: accentColor }} />
                  Education
                </h2>

                <div className="space-y-6">
                  {sortedEducation.map((edu) => (
                    <div key={edu.id}>
                      <h3
                        className="font-bold"
                        style={{ color: primaryColor }}
                      >
                        {edu.degree}
                        {edu.field && <span className="font-normal text-gray-600"> in {edu.field}</span>}
                      </h3>
                      <p style={{ color: accentColor }}>{edu.institution}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </p>
                      {edu.gpa && (
                        <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Core Competencies */}
            {skills.length > 0 && (
              <section>
                <h2
                  className="text-xs font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3"
                  style={{ color: accentColor }}
                >
                  <span className="w-8 h-px" style={{ backgroundColor: accentColor }} />
                  Core Competencies
                </h2>

                <div className="space-y-4">
                  {Object.entries(skillsByCategory).map(
                    ([category, categorySkills]) => (
                      <div key={category}>
                        <h3
                          className="text-xs font-bold uppercase tracking-wider mb-2"
                          style={{ color: primaryColor }}
                        >
                          {category}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {categorySkills.map((skill) => skill.name).join(" · ")}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Languages & Certifications Row */}
          {((data.languages && data.languages.length > 0) ||
            (data.courses && data.courses.length > 0)) && (
              <div className="grid grid-cols-2 gap-12 pt-8 border-t" style={{ marginTop: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                  <section>
                    <h2
                      className="text-xs font-bold uppercase tracking-[0.3em] mb-4"
                      style={{ color: accentColor }}
                    >
                      Languages
                    </h2>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      {data.languages.map((lang) => (
                        <div key={lang.id} className="text-sm">
                          <span className="font-medium" style={{ color: primaryColor }}>{lang.name}</span>
                          <span className="text-gray-500 ml-2">({lang.level})</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {data.courses && data.courses.length > 0 && (
                  <section>
                    <h2
                      className="text-xs font-bold uppercase tracking-[0.3em] mb-4"
                      style={{ color: accentColor }}
                    >
                      Certifications
                    </h2>
                    <div className="space-y-2">
                      {data.courses.map((course) => (
                        <div key={course.id} className="text-sm">
                          <span className="font-medium" style={{ color: primaryColor }}>{course.name}</span>
                          {course.institution && (
                            <span className="text-gray-500"> — {course.institution}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

          {/* Professional Affiliations */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section className="pt-8 border-t" style={{ marginTop: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
              <h2
                className="text-xs font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3"
                style={{ color: accentColor }}
              >
                <span className="w-8 h-px" style={{ backgroundColor: accentColor }} />
                Board & Advisory Positions
                <span className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
              </h2>

              <div className="grid grid-cols-2 gap-6">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span
                          className="font-bold"
                          style={{ color: primaryColor }}
                        >
                          {activity.title}
                        </span>
                        {activity.organization && (
                          <span style={{ color: accentColor }}> — {activity.organization}</span>
                        )}
                        {activity.role && (
                          <span className="text-gray-500 text-sm block">{activity.role}</span>
                        )}
                      </div>
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description[0]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests - Subtle */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section className="mt-8 pt-6 border-t" style={{ borderColor: `${primaryColor}10` }}>
              <p className="text-xs text-gray-400">
                <span className="font-medium uppercase tracking-wider">Interests:</span>{" "}
                {data.hobbies.map((hobby) => hobby.name).join(" · ")}
              </p>
            </section>
          )}
        </div>

        {/* Empty State */}
        {!personalInfo.firstName &&
          workExperience.length === 0 &&
          education.length === 0 &&
          skills.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-2">Your resume preview will appear here</p>
              <p className="text-sm">
                Start filling out the form to see your resume come to life
              </p>
            </div>
          )}
      </div>

      {/* Bottom Border Accent */}
      <div
        className="h-1"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}
