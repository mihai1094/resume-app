"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface ClassicTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Classic Template - Traditional Elegance
 *
 * A timeless design ideal for traditional industries like law, finance,
 * academia, and consulting. Features centered header, serif typography,
 * and a single-column layout with clear section divisions.
 */
export function ClassicTemplate({ data, customization }: ClassicTemplateProps) {
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

  // Classic color palette - deep charcoal with burgundy accent
  const primaryColor = customization?.primaryColor || "#2c2c2c";
  const accentColor = customization?.secondaryColor || "#8b2942";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineSpacing = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing || 32;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const strengthHighlights = Object.entries(skillsByCategory).slice(0, 3);

  // Font family mapping
  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") {
      return "'Georgia', 'Times New Roman', serif";
    } else if (customization?.fontFamily === "mono") {
      return "'Courier New', 'Courier', monospace";
    }
    return "'Libre Baskerville', 'Georgia', serif";
  };

  return (
    <div
      className="w-full bg-white text-gray-900 p-12 min-h-[297mm]"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Header - Centered, Traditional Style */}
      <header className="text-center mb-10">
        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-px" style={{ backgroundColor: accentColor }} />
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: accentColor }} />
          <div className="w-16 h-px" style={{ backgroundColor: accentColor }} />
        </div>

        <h1
          className="text-4xl font-normal mb-4 tracking-wide"
          style={{
            color: primaryColor,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {fullName || "Your Name"}
        </h1>

        {/* Contact Info - Elegant inline layout */}
        <div className="text-sm text-gray-600 space-y-1">
          {personalInfo.location && (
            <div className="tracking-wide">{personalInfo.location}</div>
          )}
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-1">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && (
              <>
                <span className="text-gray-300">|</span>
                <span>{personalInfo.phone}</span>
              </>
            )}
          </div>
          {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
            <div className="flex justify-center gap-4 text-xs mt-2">
              {personalInfo.linkedin && (
                <span style={{ color: accentColor }}>
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/")}
                </span>
              )}
              {personalInfo.website && (
                <span style={{ color: accentColor }}>
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </span>
              )}
              {personalInfo.github && (
                <span style={{ color: accentColor }}>
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex-1 max-w-xs h-px" style={{ backgroundColor: primaryColor }} />
          <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: accentColor }} />
          <div className="flex-1 max-w-xs h-px" style={{ backgroundColor: primaryColor }} />
        </div>
      </header>

      <div style={baseTextStyle}>
        {/* Professional Summary */}
        {personalInfo.summary && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <p
              className="text-center text-gray-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontStyle: "italic" }}
            >
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Key Strengths */}
        {strengthHighlights.length > 0 && (
          <section className="py-4 px-6 border-t border-b" style={{ marginBottom: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
            <div className="grid grid-cols-3 gap-6 text-center">
              {strengthHighlights.map(([category, categorySkills]) => (
                <div key={category}>
                  <p
                    className="text-xs uppercase tracking-[0.2em] mb-1"
                    style={{ color: accentColor }}
                  >
                    {category}
                  </p>
                  <p className="text-sm text-gray-700">
                    {categorySkills.map((skill) => skill.name).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {sortedExperience.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm uppercase tracking-[0.25em] mb-6 pb-2 text-center font-bold"
              style={{
                color: primaryColor,
                borderBottom: `1px solid ${primaryColor}`,
              }}
            >
              Professional Experience
            </h2>

            <div className="space-y-6">
              {sortedExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-2">
                    <div>
                      <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                        {exp.position}
                      </h3>
                      <p className="text-sm">
                        <span style={{ color: accentColor }}>{exp.company}</span>
                        {exp.location && (
                          <span className="text-gray-500">, {exp.location}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4 italic">
                      {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </span>
                  </div>

                  {exp.description.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-gray-700 ml-4 mt-2">
                      {exp.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="list-disc ml-4">
                              {item}
                            </li>
                          )
                      )}
                    </ul>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-3 ml-4">
                      <p
                        className="text-xs uppercase tracking-wider mb-1"
                        style={{ color: accentColor }}
                      >
                        Key Achievements
                      </p>
                      <ul className="space-y-1 text-sm text-gray-800">
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span style={{ color: accentColor }}>◦</span>
                                <span>{achievement}</span>
                              </li>
                            )
                        )}
                      </ul>
                    </div>
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
              className="text-sm uppercase tracking-[0.25em] mb-6 pb-2 text-center font-bold"
              style={{
                color: primaryColor,
                borderBottom: `1px solid ${primaryColor}`,
              }}
            >
              Education
            </h2>

            <div className="space-y-4">
              {sortedEducation.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div>
                      <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                        {edu.degree}
                        {edu.field && <span className="font-normal">, {edu.field}</span>}
                      </h3>
                      <p className="text-sm">
                        <span style={{ color: accentColor }}>{edu.institution}</span>
                        {edu.location && (
                          <span className="text-gray-500">, {edu.location}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4 italic">
                      {formatDate(edu.startDate)} – {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </span>
                  </div>

                  {edu.gpa && (
                    <p className="text-sm text-gray-600 ml-4">GPA: {edu.gpa}</p>
                  )}

                  {edu.description && edu.description.length > 0 && (
                    <ul className="space-y-1 text-sm text-gray-700 ml-4 mt-1">
                      {edu.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="list-disc ml-4">
                              {item}
                            </li>
                          )
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills - Full section */}
        {skills.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm uppercase tracking-[0.25em] mb-6 pb-2 text-center font-bold"
              style={{
                color: primaryColor,
                borderBottom: `1px solid ${primaryColor}`,
              }}
            >
              Skills & Expertise
            </h2>

            <div className="space-y-3">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="flex gap-4">
                  <span
                    className="text-sm font-bold w-32 flex-shrink-0"
                    style={{ color: accentColor }}
                  >
                    {category}:
                  </span>
                  <span className="text-sm text-gray-700">
                    {categorySkills.map((skill) => skill.name).join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Two-column layout for Languages & Certifications */}
        {((data.languages && data.languages.length > 0) || (data.courses && data.courses.length > 0)) && (
          <div className="grid grid-cols-2 gap-8" style={{ marginBottom: `${sectionSpacing}px` }}>
            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <section>
                <h2
                  className="text-sm uppercase tracking-[0.25em] mb-4 pb-2 font-bold"
                  style={{
                    color: primaryColor,
                    borderBottom: `1px solid ${primaryColor}`,
                  }}
                >
                  Languages
                </h2>

                <div className="text-sm text-gray-700">
                  {data.languages.map((lang, idx) => (
                    <span key={lang.id}>
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-gray-500"> ({lang.level})</span>
                      {idx < data.languages!.length - 1 && (
                        <span className="mx-2" style={{ color: accentColor }}>·</span>
                      )}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {data.courses && data.courses.length > 0 && (
              <section>
                <h2
                  className="text-sm uppercase tracking-[0.25em] mb-4 pb-2 font-bold"
                  style={{
                    color: primaryColor,
                    borderBottom: `1px solid ${primaryColor}`,
                  }}
                >
                  Certifications
                </h2>

                <div className="space-y-2">
                  {data.courses.map((course) => (
                    <div key={course.id} className="text-sm">
                      <span className="font-medium" style={{ color: primaryColor }}>{course.name}</span>
                      {course.institution && (
                        <span className="text-gray-500">, {course.institution}</span>
                      )}
                      {course.date && (
                        <span className="text-gray-400 text-xs ml-2">
                          ({new Date(course.date + "-01").toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Extra-Curricular */}
        {data.extraCurricular && data.extraCurricular.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm uppercase tracking-[0.25em] mb-6 pb-2 text-center font-bold"
              style={{
                color: primaryColor,
                borderBottom: `1px solid ${primaryColor}`,
              }}
            >
              Leadership & Community
            </h2>

            <div className="space-y-4">
              {data.extraCurricular.map((activity) => (
                <div key={activity.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold" style={{ color: primaryColor }}>{activity.title}</span>
                      {activity.organization && (
                        <span className="text-gray-700">, {activity.organization}</span>
                      )}
                      {activity.role && (
                        <span className="text-gray-500 text-sm"> — {activity.role}</span>
                      )}
                    </div>
                    {(activity.startDate || activity.endDate) && (
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4 italic">
                        {activity.startDate && formatDate(activity.startDate)} – {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                      </span>
                    )}
                  </div>
                  {activity.description && activity.description.length > 0 && (
                    <ul className="space-y-1 text-sm text-gray-700 ml-4 mt-1">
                      {activity.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="list-disc ml-4">
                              {item}
                            </li>
                          )
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {data.hobbies && data.hobbies.length > 0 && (
          <section className="text-center pt-4 border-t" style={{ borderColor: `${primaryColor}20` }}>
            <p className="text-sm">
              <span className="text-xs uppercase tracking-[0.2em] mr-2" style={{ color: accentColor }}>
                Interests:
              </span>
              <span className="text-gray-600 italic">
                {data.hobbies.map((hobby) => hobby.name).join(" · ")}
              </span>
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
            <p className="text-sm">Start filling out the form to see your resume come to life</p>
          </div>
        )}
    </div>
  );
}
