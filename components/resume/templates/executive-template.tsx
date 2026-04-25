import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties, ReactNode } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  groupSkillsByCategory,
} from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import { TemplateContactLine } from "./shared";
import {
  formatLinkedinDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

function SectionHeader({
  children,
  accentColor,
  className = "mb-4",
}: {
  children: ReactNode;
  accentColor: string;
  className?: string;
}) {
  return (
    <h2
      className={`text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-3 ${className}`}
      style={{ color: accentColor }}
    >
      <span className="w-8 h-px flex-shrink-0" style={{ backgroundColor: accentColor }} />
      {children}
      <span className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
    </h2>
  );
}

const stripLeadingBullet = (text: string) =>
  text.replace(/^[\s·•\-–—]+/, "");

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

  const skillsByCategory = groupSkillsByCategory(skills);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

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

  const fontFamily = getTemplateFontFamily(customization, "executive");

  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm]"
      style={{ fontFamily: fontFamily }}
    >
      {/* Top Border Accent */}
      <div
        className="h-2"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="p-12">
        {/* Executive Header */}
        <TemplateHeader className="mb-12 pb-8 border-b-2" style={{ borderColor: primaryColor }}>
          <div className="flex items-start gap-8">
            {/* Photo or Monogram (fallback) */}
            <ProfilePhoto
              photo={personalInfo.photo}
              firstName={personalInfo.firstName}
              lastName={personalInfo.lastName}
              size={96}
              shape="square"
              showFallback
              fallbackBg={primaryColor}
              style={{
                border: `3px solid ${accentColor}`,
                fontFamily: "var(--font-display), Georgia, serif",
              }}
            />

            <div className="flex-1">
              <TemplateH1
                className="text-4xl font-bold tracking-tight mb-1"
                style={{
                  color: primaryColor,
                  fontFamily: "var(--font-display), Georgia, serif",
                }}
              >
                {fullName || "Your Name"}
              </TemplateH1>
              {personalInfo.jobTitle && (
                <p
                  className="text-sm font-semibold uppercase tracking-[0.18em] mt-2"
                  style={{ color: accentColor }}
                >
                  {personalInfo.jobTitle}
                </p>
              )}

              {/* Contact Row */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm max-w-full" style={{ color: primaryColor }}>
                {personalInfo.email && (
                  <TemplateContactLine
                    icon={Mail}
                    className="items-center max-w-full"
                    iconStyle={{ color: accentColor }}
                  >
                    <a title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">
                      {formatEmailDisplay(personalInfo.email, 45)}
                    </a>
                  </TemplateContactLine>
                )}
                {personalInfo.phone && (
                  <TemplateContactLine
                    icon={Phone}
                    className="items-center"
                    iconStyle={{ color: accentColor }}
                  >
                    {personalInfo.phone}
                  </TemplateContactLine>
                )}
                {personalInfo.location && (
                  <TemplateContactLine
                    icon={MapPin}
                    className="items-center"
                    iconStyle={{ color: accentColor }}
                  >
                    {personalInfo.location}
                  </TemplateContactLine>
                )}
                {personalInfo.linkedin && (
                  <TemplateContactLine
                    icon={Linkedin}
                    className="items-center max-w-full"
                    iconStyle={{ color: accentColor }}
                  >
                    <a title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
                      {formatLinkedinDisplay(personalInfo.linkedin, 45)}
                    </a>
                  </TemplateContactLine>
                )}
                {personalInfo.website && (
                  <TemplateContactLine
                    icon={Globe}
                    className="items-center max-w-full"
                    iconStyle={{ color: accentColor }}
                  >
                    <a title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">
                      {formatWebsiteDisplay(personalInfo.website, 45)}
                    </a>
                  </TemplateContactLine>
                )}
              </div>
            </div>
          </div>
        </TemplateHeader>

        <div style={baseTextStyle}>
          {/* Executive Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionHeader accentColor={accentColor} className="mb-4">Executive Summary</SectionHeader>
              <p
                className="text-base leading-relaxed"
                style={{ color: primaryColor, maxWidth: "68ch" }}
              >
                {renderSummaryText(personalInfo.summary)}
              </p>
            </section>
          )}

          {/* Core Competencies - Promoted above Experience (when skills-first) */}
          {customization?.sectionOrder === "skills-first" && skills.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionHeader accentColor={accentColor} className="mb-6">Core Competencies</SectionHeader>

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
                      <div className="flex flex-wrap gap-1.5">
                        {categorySkills.map((skill) => (
                          <span
                            key={skill.name}
                            style={{
                              border: `1px solid ${primaryColor}30`,
                              padding: "2px 10px",
                              borderRadius: 2,
                              fontSize: `${baseFontSize * 0.85}px`,
                              color: primaryColor,
                            }}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* Professional Experience */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionHeader accentColor={accentColor} className="mb-6">Professional Experience</SectionHeader>

              <div className="space-y-8">
                {sortedExperience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    {/* Timeline indicator */}
                    {index < sortedExperience.length - 1 && (
                      <div
                        className="absolute left-[11px] top-8 bottom-0 w-px"
                        style={{ backgroundColor: `${primaryColor}25` }}
                      />
                    )}

                    <div className="flex gap-6">
                      {/* Timeline dot */}
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 mt-1 flex items-center justify-center"
                        style={{
                          backgroundColor: index === 0 ? accentColor : `${primaryColor}35`,
                        }}
                      >
                        {index === 0 && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
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
                            className="whitespace-nowrap flex-shrink-0 font-medium"
                            style={{
                              fontSize: `${baseFontSize * 0.78}px`,
                              letterSpacing: "0.08em",
                              color: accentColor,
                              textTransform: "uppercase",
                            }}
                          >
                            {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                          </span>
                        </div>

                        {/* Achievements First for Executive Focus */}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mb-4">
                            <div className="space-y-2 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                              {exp.achievements.map(
                                (achievement, idx) =>
                                  achievement.trim() && (
                                    <div key={idx} className="flex gap-2.5 items-start text-sm" style={{ color: primaryColor }}>
                                      <span
                                        className="flex-shrink-0 mt-[7px]"
                                        style={{ width: 4, height: 4, borderRadius: 0, backgroundColor: accentColor, display: "inline-block" }}
                                      />
                                      <span>{renderFormattedText(stripLeadingBullet(achievement))}</span>
                                    </div>
                                  )
                              )}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {exp.description.length > 0 && (
                          <div className="space-y-2 text-sm text-gray-600 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                            {exp.description.map(
                              (item, idx) =>
                                item.trim() && (
                                  <div key={idx} className="flex gap-2.5 items-start">
                                    <span
                                      className="flex-shrink-0 mt-[7px]"
                                      style={{ width: 4, height: 4, borderRadius: 0, backgroundColor: `${primaryColor}60`, display: "inline-block" }}
                                    />
                                    <span>{renderFormattedText(stripLeadingBullet(item))}</span>
                                  </div>
                                )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Two Column Layout for Education & Skills */}
          <div className="flex flex-col md:flex-row gap-12">
            {/* Education */}
            {sortedEducation.length > 0 && (
              <section className="flex-1 min-w-0">
                <SectionHeader accentColor={accentColor} className="mb-6">Education</SectionHeader>

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
                        <p className="text-xs text-gray-500 mt-1">Grade: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Core Competencies (default position) */}
            {customization?.sectionOrder !== "skills-first" && skills.length > 0 && (
              <section className="flex-1 min-w-0">
                <SectionHeader accentColor={accentColor} className="mb-6">Core Competencies</SectionHeader>

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
                        <div className="flex flex-wrap gap-1.5">
                          {categorySkills.map((skill) => (
                            <span
                              key={skill.name}
                              style={{
                                border: `1px solid ${primaryColor}30`,
                                padding: "2px 10px",
                                borderRadius: 2,
                                fontSize: `${baseFontSize * 0.85}px`,
                                color: primaryColor,
                              }}
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Strategic Projects */}
          {data.projects && data.projects.length > 0 && (
            <section className="pt-8 border-t" style={{ marginTop: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
              <SectionHeader accentColor={accentColor} className="mb-6">Strategic Projects</SectionHeader>

              <div className="space-y-5">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-2">
                      <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                        {project.name}
                      </h3>
                      {(project.startDate || project.endDate) && (
                        <span
                          className="whitespace-nowrap flex-shrink-0 font-medium"
                          style={{
                            fontSize: `${baseFontSize * 0.78}px`,
                            letterSpacing: "0.08em",
                            color: accentColor,
                            textTransform: "uppercase",
                          }}
                        >
                          {project.startDate ? formatDate(project.startDate) : ""}
                          {(project.startDate || project.endDate) && " — "}
                          {project.endDate ? formatDate(project.endDate) : "Present"}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm mt-2" style={{ color: primaryColor }}>
                        {renderFormattedText(project.description)}
                      </p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2">
                        <span style={{ color: accentColor }}>Technologies:</span>{" "}
                        {project.technologies.join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages & Certifications Row */}
          {((data.languages && data.languages.length > 0) ||
            (data.courses && data.courses.length > 0) ||
            (data.certifications && data.certifications.length > 0)) && (
              <div className="flex flex-col md:flex-row gap-12 pt-8 border-t" style={{ marginTop: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
                {/* Languages */}
                {data.languages && data.languages.length > 0 && (
                  <section className="flex-1 min-w-0">
                    <SectionHeader accentColor={accentColor} className="mb-4">Languages</SectionHeader>
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
                {(() => {
                  const certs = data.certifications?.filter(c => c.type !== "course") || [];
                  const coursesFromCerts = data.certifications?.filter(c => c.type === "course") || [];
                  const legacyCourses = data.courses || [];
                  const allCourses = [
                    ...certs.map(c => ({
                      id: c.id,
                      name: c.name,
                      institution: c.issuer,
                      date: c.date,
                      credentialId: c.credentialId,
                      url: c.url,
                    })),
                    ...coursesFromCerts.map(c => ({
                    id: c.id,
                    name: c.name,
                    institution: c.issuer,
                    date: c.date,
                    credentialId: c.credentialId,
                    url: c.url,
                    })),
                    ...legacyCourses,
                  ];
                  return allCourses.length > 0 && (
                    <section className="flex-1 min-w-0">
                      <SectionHeader accentColor={accentColor} className="mb-4">Certifications</SectionHeader>
                      <div className="space-y-2">
                        {allCourses.map((course) => (
                          <div key={course.id} className="text-sm">
                            <span className="font-medium" style={{ color: primaryColor }}>{course.name}</span>
                            {course.institution && (
                              <span className="text-gray-500"> — {course.institution}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })()}
              </div>
            )}

          {/* Custom Sections */}
          {data.customSections && data.customSections.length > 0 && (
            <section className="pt-8 border-t" style={{ marginTop: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
              {data.customSections.map((section) => (
                <div key={section.id} className="mb-6 last:mb-0">
                  <SectionHeader accentColor={accentColor} className="mb-4">{section.title || "Custom Section"}</SectionHeader>

                  <div className="space-y-3">
                    {(section.items || []).map((item) => (
                      <div key={item.id}>
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                            {item.title}
                          </p>
                          {(item.date || item.location) && (
                            <p className="text-xs text-gray-500 whitespace-nowrap">
                              {item.date}
                              {item.date && item.location ? " · " : ""}
                              {item.location}
                            </p>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{renderFormattedText(item.description)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Extra-Curricular */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section className="pt-8 border-t" style={{ marginTop: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
              <SectionHeader accentColor={accentColor} className="mb-6">Activities</SectionHeader>

              <div className="flex flex-wrap gap-6">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id} className="flex-1 min-w-[250px]">
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
                        {renderFormattedText(activity.description[0])}
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
        className="h-2"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}
