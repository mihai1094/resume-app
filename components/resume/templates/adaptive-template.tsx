"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  cn,
} from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { useSmartLayout } from "@/hooks/use-smart-layout";

interface AdaptiveTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Adaptive Template - Smart Content-Aware Layout
 *
 * Automatically adjusts layout, spacing, and typography based on the
 * amount of content. Three modes: sparse (minimal content), balanced
 * (typical content), and dense (lots of content). Perfect for users
 * who want the resume to look great regardless of how much they write.
 */
export function AdaptiveTemplate({ data, customization }: AdaptiveTemplateProps) {
  const layout = useSmartLayout(data);
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

  const fontFamilyClass =
    customization?.fontFamily === "serif"
      ? "font-serif"
      : customization?.fontFamily === "mono"
        ? "font-mono"
        : "font-sans";

  // Indigo primary with emerald accent
  const primaryColor = customization?.primaryColor || "#4f46e5";
  const secondaryColor = customization?.secondaryColor || "#10b981";

  // Dynamic styling based on layout mode
  const baseTextStyle: CSSProperties = {
    lineHeight: layout.mode === "sparse" ? 1.8 : layout.mode === "dense" ? 1.35 : 1.55,
    fontSize: layout.mode === "sparse" ? "14px" : layout.mode === "dense" ? "12px" : "13px",
  };

  const sectionSpacing = customization?.sectionSpacing || (layout.mode === "sparse" ? 40 : layout.mode === "dense" ? 24 : 32);

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
    return "'Inter', system-ui, sans-serif";
  };

  const topSkillCategories = Object.entries(skillsByCategory);

  return (
    <div
      className={cn(
        "w-full bg-white text-gray-800 min-h-[297mm] transition-all duration-300",
        fontFamilyClass,
        layout.margins,
        layout.fontSize
      )}
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Header Section - Adapts based on mode */}
      <header
        className={cn(
          "border-b pb-6 mb-8",
          layout.mode === "sparse" ? "text-center" : "flex justify-between items-end"
        )}
        style={{ borderColor: primaryColor }}
      >
        <div className={cn(layout.mode === "sparse" && "max-w-2xl mx-auto")}>
          <h1
            className={cn(
              "font-bold tracking-tight",
              layout.mode === "sparse" ? "text-4xl mb-4" : layout.mode === "dense" ? "text-2xl mb-2" : "text-3xl mb-3"
            )}
            style={{ color: primaryColor }}
          >
            {fullName || "Your Name"}
          </h1>

          {personalInfo.summary && (
            <p
              className={cn(
                "text-gray-600",
                layout.mode === "sparse" ? "text-base leading-relaxed" : "text-sm"
              )}
            >
              {layout.mode === "dense" && personalInfo.summary.length > 150
                ? personalInfo.summary.slice(0, 150) + "..."
                : personalInfo.summary}
            </p>
          )}
        </div>

        {/* Contact Info */}
        <div
          className={cn(
            "text-gray-600 text-sm",
            layout.mode === "sparse"
              ? "mt-6 flex flex-wrap justify-center gap-4"
              : "text-right space-y-1 flex-shrink-0 ml-8"
          )}
        >
          {personalInfo.email && (
            <div className="flex items-center gap-2 justify-end">
              <Mail className="w-4 h-4" style={{ color: secondaryColor }} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2 justify-end">
              <Phone className="w-4 h-4" style={{ color: secondaryColor }} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2 justify-end">
              <MapPin className="w-4 h-4" style={{ color: secondaryColor }} />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-2 justify-end">
              <Linkedin className="w-4 h-4" style={{ color: secondaryColor }} />
              <span>{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2 justify-end">
              <Github className="w-4 h-4" style={{ color: secondaryColor }} />
              <span>{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2 justify-end">
              <Globe className="w-4 h-4" style={{ color: secondaryColor }} />
              <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Grid - Adapts columns based on mode */}
      <div className={cn("grid grid-cols-12", layout.columnGap)}>
        {/* Main Content Column */}
        <main
          className={cn(
            layout.mode === "sparse" ? "col-span-12" : "col-span-8"
          )}
          style={{ ...baseTextStyle, display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}
        >
          {/* Experience Section */}
          {sortedExperience.length > 0 && (
            <section>
              <h2
                className={cn(
                  "font-bold uppercase tracking-wider mb-4 flex items-center gap-3",
                  layout.mode === "sparse" ? "text-xl" : "text-lg"
                )}
                style={{ color: primaryColor }}
              >
                <span
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
                Experience
              </h2>

              <div className={cn(layout.mode === "dense" ? "space-y-4" : "space-y-6")}>
                {sortedExperience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="relative pl-5"
                    style={{
                      borderLeft: `2px solid ${index === 0 ? secondaryColor : "#e5e7eb"}`,
                    }}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>
                    <div className="font-medium mb-2" style={{ color: primaryColor }}>
                      {exp.company}
                      {exp.location && <span className="text-gray-500 font-normal"> · {exp.location}</span>}
                    </div>

                    {exp.description.length > 0 && (
                      <ul className={cn("text-gray-600", layout.mode === "dense" ? "space-y-1" : "space-y-1.5")}>
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ backgroundColor: secondaryColor }} />
                                <span>{item}</span>
                              </li>
                            )
                        )}
                      </ul>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div
                        className="mt-2 p-3 rounded-lg"
                        style={{ backgroundColor: `${primaryColor}08` }}
                      >
                        <ul className="space-y-1">
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <li key={idx} className="flex gap-2 text-sm">
                                  <span style={{ color: secondaryColor }}>✓</span>
                                  <span className="font-medium text-gray-700">{achievement}</span>
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

          {/* Projects (shown in main column for all modes) */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2
                className={cn(
                  "font-bold uppercase tracking-wider mb-4 flex items-center gap-3",
                  layout.mode === "sparse" ? "text-xl" : "text-lg"
                )}
                style={{ color: primaryColor }}
              >
                <span
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
                Projects
              </h2>

              <div className={cn(layout.mode === "sparse" ? "grid grid-cols-2 gap-6" : "space-y-4")}>
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-gray-100"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900">{project.name}</h3>
                      {project.url && (
                        <span className="text-xs" style={{ color: primaryColor }}>↗</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded"
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

          {/* Extra-curricular (main column for dense mode) */}
          {layout.mode !== "sparse" && data.extraCurricular && data.extraCurricular.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-3"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
                Activities
              </h2>

              <div className="space-y-3">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id} className="pl-5" style={{ borderLeft: `2px solid #e5e7eb` }}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-gray-900">{activity.title}</span>
                        {activity.organization && (
                          <span className="font-medium" style={{ color: primaryColor }}> — {activity.organization}</span>
                        )}
                      </div>
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1">{activity.description[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Sidebar Column */}
        <aside
          className={cn(
            layout.mode === "sparse"
              ? "col-span-12 grid grid-cols-3 gap-8 pt-8 border-t"
              : layout.sidebarWidth
          )}
          style={{
            borderColor: layout.mode === "sparse" ? `${primaryColor}20` : "transparent",
            marginTop: layout.mode === "sparse" ? `${sectionSpacing}px` : undefined,
            display: layout.mode !== "sparse" ? 'flex' : undefined,
            flexDirection: layout.mode !== "sparse" ? 'column' : undefined,
            gap: layout.mode !== "sparse" ? `${sectionSpacing * 0.8}px` : undefined
          }}
        >
          {/* Skills */}
          {topSkillCategories.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b"
                style={{ borderColor: `${primaryColor}20` }}
              >
                Skills
              </h2>
              <div className="space-y-4">
                {topSkillCategories.map(([category, categorySkills]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-sm mb-2" style={{ color: primaryColor }}>
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 text-xs rounded bg-gray-50 border border-gray-100 text-gray-700"
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

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b"
                style={{ borderColor: `${primaryColor}20` }}
              >
                Education
              </h2>
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-gray-900">{edu.institution}</div>
                    <div className="text-sm text-gray-700">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </div>
                    {edu.gpa && (
                      <div className="text-xs text-gray-500">GPA: {edu.gpa}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b"
                style={{ borderColor: `${primaryColor}20` }}
              >
                Languages
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-gray-500 capitalize">{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {data.courses && data.courses.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b"
                style={{ borderColor: `${primaryColor}20` }}
              >
                Certifications
              </h2>
              <div className="space-y-2">
                {data.courses.map((course) => (
                  <div key={course.id}>
                    <div className="text-sm font-medium text-gray-900">{course.name}</div>
                    {course.institution && (
                      <div className="text-xs text-gray-500">{course.institution}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b"
                style={{ borderColor: `${primaryColor}20` }}
              >
                Interests
              </h2>
              <p className="text-sm text-gray-600">
                {data.hobbies.map((hobby) => hobby.name).join(" · ")}
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
