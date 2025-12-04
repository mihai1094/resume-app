"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface MinimalistTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Minimalist Template - Swiss/International Design
 *
 * Inspired by Swiss graphic design principles: clean grid system,
 * exceptional typography, generous whitespace, and restrained use
 * of visual elements. Perfect for academics, researchers, and
 * design-conscious professionals.
 */
export function MinimalistTemplate({ data, customization }: MinimalistTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const projectHighlights = data.projects || [];

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Minimalist color palette - pure black with strategic use of gray
  const primaryColor = customization?.primaryColor || "#000000";
  const secondaryColor = customization?.secondaryColor || "#666666";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineSpacing = customization?.lineSpacing ?? 1.7;
  const sectionSpacing = customization?.sectionSpacing || 48;

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
    return "'Helvetica Neue', Helvetica, Arial, sans-serif";
  };

  return (
    <div
      className="w-full bg-white text-black min-h-[297mm] p-16"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Header - Clean Grid */}
      <header className="mb-16">
        <div className="grid grid-cols-12 gap-4">
          {/* Name - Large, Bold */}
          <div className="col-span-8">
            <h1
              className="text-[42px] font-bold tracking-tight leading-none mb-6"
              style={{ color: primaryColor }}
            >
              {fullName || "Your Name"}
            </h1>

            {/* Summary - Clean, understated */}
            {personalInfo.summary && (
              <p
                className="text-base text-gray-600 max-w-xl leading-relaxed"
                style={{ fontWeight: 300 }}
              >
                {personalInfo.summary}
              </p>
            )}
          </div>

          {/* Contact Info - Right aligned */}
          <div className="col-span-4 text-right">
            <div className="space-y-1 text-sm text-gray-600" style={{ fontWeight: 300 }}>
              {personalInfo.email && <div>{personalInfo.email}</div>}
              {personalInfo.phone && <div>{personalInfo.phone}</div>}
              {personalInfo.location && <div>{personalInfo.location}</div>}
              {personalInfo.website && (
                <div className="text-black">{personalInfo.website.replace(/^https?:\/\//, "")}</div>
              )}
              {personalInfo.linkedin && (
                <div className="text-black">
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                </div>
              )}
              {personalInfo.github && (
                <div className="text-black">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</div>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Rule */}
        <div className="h-px bg-black mt-8" />
      </header>

      {/* Main Content - Grid Based */}
      <div className="grid grid-cols-12 gap-8" style={baseTextStyle}>
        {/* Main Column */}
        <main className="col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8"
                style={{ color: primaryColor }}
              >
                Experience
              </h2>

              <div className="space-y-8">
                {sortedExperience.map((exp) => (
                  <div key={exp.id}>
                    <div className="grid grid-cols-12 gap-4 mb-2">
                      <div className="col-span-8">
                        <h3 className="font-bold">{exp.position}</h3>
                        <p className="text-gray-600">
                          {exp.company}
                          {exp.location && <span> — {exp.location}</span>}
                        </p>
                      </div>
                      <div className="col-span-4 text-right text-gray-500 text-sm">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </div>
                    </div>

                    {exp.description.length > 0 && (
                      <div className="mt-3 space-y-1.5 text-gray-700">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <p key={idx} className="pl-4" style={{ borderLeft: `1px solid ${primaryColor}20` }}>
                                {item}
                              </p>
                            )
                        )}
                      </div>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <p key={idx} className="text-black font-medium pl-4" style={{ borderLeft: `2px solid ${primaryColor}` }}>
                                {achievement}
                              </p>
                            )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8"
                style={{ color: primaryColor }}
              >
                Education
              </h2>

              <div className="space-y-6">
                {sortedEducation.map((edu) => (
                  <div key={edu.id}>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-8">
                        <h3 className="font-bold">
                          {edu.degree}
                          {edu.field && <span className="font-normal text-gray-600"> in {edu.field}</span>}
                        </h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                      </div>
                      <div className="col-span-4 text-right text-gray-500 text-sm">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </div>
                    </div>

                    {edu.description && edu.description.length > 0 && (
                      <div className="mt-2 space-y-1 text-gray-700">
                        {edu.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <p key={idx} className="pl-4" style={{ borderLeft: `1px solid ${primaryColor}20` }}>
                                {item}
                              </p>
                            )
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projectHighlights.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8"
                style={{ color: primaryColor }}
              >
                Selected Projects
              </h2>

              <div className="space-y-6">
                {projectHighlights.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold">{project.name}</h3>
                      {project.url && (
                        <span className="text-sm text-gray-500">
                          {project.url.replace(/^https?:\/\//, "")}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="text-[11px] text-gray-400 uppercase tracking-[0.3em] mt-2">
                        {project.technologies.join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Extra-curricular */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8"
                style={{ color: primaryColor }}
              >
                Activities
              </h2>

              <div className="space-y-4">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold">{activity.title}</span>
                        {activity.organization && (
                          <span className="text-gray-600"> — {activity.organization}</span>
                        )}
                      </div>
                      {(activity.startDate || activity.endDate) && (
                        <span className="text-sm text-gray-500">
                          {activity.startDate && formatDate(activity.startDate)} — {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                        </span>
                      )}
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <p className="text-gray-600 mt-1">{activity.description[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside className="col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing * 0.83}px` }}>
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
                style={{ color: primaryColor }}
              >
                Skills
              </h2>

              <div className="space-y-4">
                {/* Group by category */}
                {Object.entries(
                  skills.reduce((acc, skill) => {
                    if (!acc[skill.category]) acc[skill.category] = [];
                    acc[skill.category].push(skill);
                    return acc;
                  }, {} as Record<string, typeof skills>)
                ).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h3 className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">
                      {category}
                    </h3>
                    <p className="text-gray-700">
                      {categorySkills.map((skill) => skill.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
                style={{ color: primaryColor }}
              >
                Languages
              </h2>

              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-gray-400 text-sm capitalize">{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.courses && data.courses.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
                style={{ color: primaryColor }}
              >
                Certifications
              </h2>

              <div className="space-y-3">
                {data.courses.map((course) => (
                  <div key={course.id}>
                    <p className="font-medium">{course.name}</p>
                    {course.institution && (
                      <p className="text-sm text-gray-500">{course.institution}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
                style={{ color: primaryColor }}
              >
                Interests
              </h2>

              <p className="text-gray-600">
                {data.hobbies.map((hobby) => hobby.name).join(", ")}
              </p>
            </section>
          )}
        </aside>
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
  );
}
