import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import Image from "next/image";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { getProfilePhotoImageProps } from "@/lib/utils/image";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  cn,
  groupSkillsByCategory,
  getAllCourses,
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
import { TemplateMain, TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

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

  const skillsByCategory = groupSkillsByCategory(skills);

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
  const accentColor = customization?.accentColor || secondaryColor;
  const baseFontSize =
    customization?.fontSize ??
    (layout.mode === "sparse" ? 14 : layout.mode === "dense" ? 12 : 13);
  const baseLineSpacing =
    customization?.lineSpacing ??
    (layout.mode === "sparse" ? 1.8 : layout.mode === "dense" ? 1.35 : 1.55);

  // Dynamic styling based on layout mode
  const baseTextStyle: CSSProperties = {
    lineHeight: baseLineSpacing,
    fontSize: `${baseFontSize}px`,
  };

  const sectionSpacing = customization?.sectionSpacing || (layout.mode === "sparse" ? 40 : layout.mode === "dense" ? 24 : 32);

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const topSkillCategories = Object.entries(skillsByCategory);

  return (
    <div
      className={cn(
        "w-full bg-white text-gray-800 min-h-[297mm] pb-10 transition-all duration-300",
        fontFamilyClass,
        layout.margins
      )}
      style={{ fontFamily: fontFamily, ...baseTextStyle }}
    >
      {/* Header Section - Adapts based on mode */}
      <TemplateHeader
        className={cn(
          "border-b pb-6 mb-8",
          layout.mode === "sparse" ? "text-center" : "flex justify-between items-end"
        )}
        style={{ borderColor: primaryColor }}
      >
        <div className={cn(layout.mode === "sparse" && "max-w-2xl mx-auto")}>
          {/* Photo */}
          {personalInfo.photo && (
            <div className={cn(
              "mb-4",
              layout.mode === "sparse" ? "flex justify-center" : ""
            )}>
              <Image
                src={personalInfo.photo}
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                width={112}
                height={112}
                className={cn(
                  "rounded-full object-cover",
                  layout.mode === "sparse" ? "w-28 h-28" : layout.mode === "dense" ? "w-16 h-16" : "w-20 h-20"
                )}
                style={{ border: `3px solid ${primaryColor}` }}
                {...getProfilePhotoImageProps(personalInfo.photo, "112px")}
              />
            </div>
          )}
          <TemplateH1
            className={cn(
              "font-bold tracking-tight",
              layout.mode === "sparse" ? "text-4xl mb-4" : layout.mode === "dense" ? "text-2xl mb-2" : "text-3xl mb-3"
            )}
            style={{ color: primaryColor }}
          >
            {fullName || "Your Name"}
          </TemplateH1>
          {personalInfo.jobTitle && (
            <p
              className={cn(
                "font-semibold uppercase tracking-[0.14em]",
                layout.mode === "sparse"
                  ? "text-sm mb-3"
                  : layout.mode === "dense"
                    ? "text-[11px] mb-2"
                    : "text-xs mb-2.5"
              )}
              style={{ color: secondaryColor }}
            >
              {personalInfo.jobTitle}
            </p>
          )}

          {personalInfo.summary && (
            <p
              className={cn(
                "text-gray-600",
                layout.mode === "sparse" ? "text-base leading-relaxed" : "text-sm"
              )}
            >
              {layout.mode === "dense" && personalInfo.summary.length > 150
                ? renderFormattedText(personalInfo.summary.slice(0, 150) + "...")
                : renderSummaryText(personalInfo.summary)}
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
            <div className="flex items-center gap-2 justify-end min-w-0 max-w-full">
              <Mail className="w-4 h-4 flex-shrink-0" style={{ color: secondaryColor }} />
              <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 40)}</a>
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
            <div className="flex items-center gap-2 justify-end min-w-0 max-w-full">
              <Linkedin className="w-4 h-4 flex-shrink-0" style={{ color: secondaryColor }} />
              <a className="min-w-0 break-words" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">{formatLinkedinDisplay(personalInfo.linkedin, 40)}</a>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-2 justify-end min-w-0 max-w-full">
              <Github className="w-4 h-4 flex-shrink-0" style={{ color: secondaryColor }} />
              <a className="min-w-0 break-words" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">{formatGithubDisplay(personalInfo.github, 40)}</a>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-2 justify-end min-w-0 max-w-full">
              <Globe className="w-4 h-4 flex-shrink-0" style={{ color: secondaryColor }} />
              <a className="min-w-0 break-words" title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">{formatWebsiteDisplay(personalInfo.website, 40)}</a>
            </div>
          )}
        </div>
      </TemplateHeader>

      {/* Main Content Grid - Adapts columns based on mode */}
      <div className={cn("flex flex-col md:flex-row", layout.columnGap)}>
        {/* Main Content Column */}
        <TemplateMain
          className={cn(
            layout.mode === "sparse" ? "w-full" : "flex-[2] min-w-0"
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
                  style={{ backgroundColor: accentColor }}
                />
                Experience
              </h2>

              <div className={cn(layout.mode === "dense" ? "space-y-4" : "space-y-6")}>
                {sortedExperience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="relative pl-5"
                    style={{
                      borderLeft: `2px solid ${index === 0 ? accentColor : "#e5e7eb"}`,
                    }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-baseline mb-1 gap-2">
                      <h3 className="font-bold text-gray-900">{exp.position}</h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap md:ml-4">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>
                    <div className="font-medium mb-2" style={{ color: primaryColor }}>
                      {exp.company}
                      {exp.location && <span className="text-gray-500 font-normal"> · {exp.location}</span>}
                    </div>

                    {exp.description.length > 0 && (
                      <div className={cn("text-gray-600 ml-2 [&_strong]:font-semibold [&_strong]:text-[0.92em]", layout.mode === "dense" ? "space-y-1" : "space-y-1.5")}>
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <div key={idx}>{renderFormattedText(item)}</div>
                            )
                        )}
                      </div>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div
                        className="mt-2 p-3 rounded-lg"
                        style={{ backgroundColor: `${primaryColor}08` }}
                      >
                        <div className="space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <div key={idx} className="text-sm font-medium text-gray-700">{renderFormattedText(achievement)}</div>
                              )
                          )}
                        </div>
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
                  style={{ backgroundColor: accentColor }}
                />
                Projects
              </h2>

              <div className={cn(layout.mode === "sparse" ? "flex flex-wrap gap-6" : "space-y-4")}>
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-gray-100 flex-1 min-w-[250px]"
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900">{project.name}</h3>
                      {project.url && (
                        <span className="text-xs" style={{ color: primaryColor }}>↗</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{renderFormattedText(project.description)}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
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

          {/* Extra-curricular */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-3"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
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
                      <p className="text-sm text-gray-600 mt-1">{renderFormattedText(activity.description[0])}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </TemplateMain>

        {/* Sidebar Column */}
        <aside
          className={cn(
            layout.mode === "sparse"
              ? "w-full flex-wrap flex gap-8 pt-8 border-t justify-between"
              : "flex-1 min-w-0" // Sidebar takes 1 part vs main's 2 parts
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
            <section className={cn(layout.mode === "sparse" && "flex-1 min-w-[200px]")}>
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
                      <div className="text-xs text-gray-500">Grade: {edu.gpa}</div>
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
          {(() => {
            const allCourses = getAllCourses(data);
            return allCourses.length > 0 && (
              <section>
                <h2
                  className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pb-2 border-b"
                  style={{ borderColor: `${primaryColor}20` }}
                >
                  Certifications
                </h2>
                <div className="space-y-2">
                  {allCourses.map((course) => (
                    <div key={course.id}>
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      {course.institution && (
                        <div className="text-xs text-gray-500">{course.institution}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

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
