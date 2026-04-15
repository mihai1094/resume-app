import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  groupSkillsByCategory,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";
import { MapPin } from "lucide-react";

interface NotionTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Notion Template — Modern Knowledge Worker
 *
 * Brutally minimal single-column layout inspired by Notion/Linear/Arc.
 * Features monospace code-style skill tags, muted property-label headers,
 * and callout blocks for achievements. ATS-excellent.
 */
export function NotionTemplate({ data, customization }: NotionTemplateProps) {
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    languages,
    certifications,
    courses,
    hobbies,
    extraCurricular,
    projects,
    customSections,
  } = data;

  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  const primaryColor = customization?.primaryColor || "#64748b"; // slate-500
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.65;
  const sectionSpacing = customization?.sectionSpacing || 32;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const skillsByCategory = groupSkillsByCategory(skills);

  return (
    <div
      className="w-full bg-white text-[#1a1a1a] min-h-[297mm] p-14"
      style={{ fontFamily }}
    >
      {/* Header — clean, no decoration */}
      <TemplateHeader className="mb-10">
        <TemplateH1
          className="text-4xl font-semibold tracking-tight mb-2"
          style={{ color: "#1a1a1a", lineHeight: 1.1 }}
        >
          {fullName || "Your Name"}
        </TemplateH1>
        {personalInfo.jobTitle && (
          <p
            className="text-sm mb-4"
            style={{ color: primaryColor }}
          >
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact — inline, minimal */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#64748b] max-w-full">
          {personalInfo.email && (
            <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
          )}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{personalInfo.location}</span>}
          {personalInfo.linkedin && (
            <a className="min-w-0 break-words" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">{formatLinkedinDisplay(personalInfo.linkedin, 45)}</a>
          )}
          {personalInfo.github && (
            <a className="min-w-0 break-words" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">{formatGithubDisplay(personalInfo.github, 45)}</a>
          )}
          {personalInfo.website && (
            <a className="min-w-0 break-words" title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">{formatWebsiteDisplay(personalInfo.website, 45)}</a>
          )}
        </div>
      </TemplateHeader>

      <div style={baseTextStyle}>
        {/* Summary */}
        {personalInfo.summary && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <p className="text-[#374151] leading-relaxed">
              {renderSummaryText(personalInfo.summary)}
            </p>
          </section>
        )}

        {/* Experience */}
        {sortedExperience.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <SectionLabel text="Experience" />
            <div className="space-y-6">
              {sortedExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-[#1a1a1a]">{exp.position}</h3>
                    <span className="text-xs text-[#94a3b8] whitespace-nowrap ml-4">
                      {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: primaryColor }}>
                    {exp.company}
                    {exp.location && <span className="text-[#94a3b8]"> · {exp.location}</span>}
                  </p>

                  {exp.description.length > 0 && (
                    <div className="space-y-1 text-sm text-[#374151] [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                      {exp.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <div key={idx}>
                              {renderFormattedText(item)}
                            </div>
                          )
                      )}
                    </div>
                  )}

                  {/* Achievements as callout block */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div
                      className="mt-3 p-3 rounded-md bg-[#f8fafc]"
                      style={{ borderLeft: `3px solid ${primaryColor}` }}
                    >
                      <div className="space-y-1 text-sm text-[#1a1a1a] [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <div key={idx} className="font-medium">
                                {renderFormattedText(achievement)}
                              </div>
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

        {/* Education */}
        {sortedEducation.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <SectionLabel text="Education" />
            <div className="space-y-4">
              {sortedEducation.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-[#1a1a1a]">
                      {edu.degree}
                      {edu.field && <span className="font-normal text-[#64748b]"> in {edu.field}</span>}
                    </h3>
                    <span className="text-xs text-[#94a3b8] whitespace-nowrap ml-4">
                      {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: primaryColor }}>{edu.institution}</p>
                  {edu.gpa && <p className="text-xs text-[#94a3b8] mt-1">Grade: {edu.gpa}</p>}
                  {edu.description && edu.description.length > 0 && (
                    <div className="text-sm text-[#374151] mt-2 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                      {edu.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <div key={idx}>
                              {renderFormattedText(item)}
                            </div>
                          )
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills — monospace code tags */}
        {skills.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <SectionLabel text="Skills" />
            <div className="space-y-3">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <span className="text-xs text-[#94a3b8] mr-2">{category}:</span>
                  <span className="inline">
                    {categorySkills.map((skill, i) => (
                      <span key={skill.id}>
                        <span className="inline-block bg-[#f1f5f9] rounded px-1.5 py-0.5 font-mono text-xs text-[#334155]">
                          {skill.name}
                        </span>
                        {i < categorySkills.length - 1 && <span className="mx-1" />}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <SectionLabel text="Projects" />
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-[#1a1a1a]">{project.name}</h3>
                    {(project.startDate || project.endDate) && (
                      <span className="text-xs text-[#94a3b8] whitespace-nowrap ml-4">
                        {project.startDate ? formatDate(project.startDate) : ""}
                        {(project.startDate || project.endDate) && " — "}
                        {project.endDate ? formatDate(project.endDate) : "Present"}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-[#374151] mt-1">{renderFormattedText(project.description)}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="inline-block bg-[#f1f5f9] rounded px-1.5 py-0.5 font-mono text-xs text-[#334155]"
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
        {(() => {
          const certs = certifications?.filter(c => c.type !== "course") || [];
          const coursesFromCerts = certifications?.filter(c => c.type === "course") || [];
          const legacyCourses = courses || [];
          const allCerts = [
            ...certs.map(c => ({ id: c.id, name: c.name, issuer: c.issuer, date: c.date })),
            ...coursesFromCerts.map(c => ({ id: c.id, name: c.name, issuer: c.issuer, date: c.date })),
            ...legacyCourses.map(c => ({ id: c.id, name: c.name, issuer: c.institution, date: c.date })),
          ];
          return allCerts.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionLabel text="Certifications" />
              <div className="space-y-2">
                {allCerts.map((cert) => (
                  <div key={cert.id} className="text-sm">
                    <span className="font-medium text-[#1a1a1a]">{cert.name}</span>
                    {cert.issuer && <span className="text-[#94a3b8]"> — {cert.issuer}</span>}
                    {cert.date && <span className="text-[#94a3b8] text-xs ml-2">({formatDate(cert.date)})</span>}
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <SectionLabel text="Languages" />
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {languages.map((lang) => (
                <span key={lang.id}>
                  <span className="text-[#1a1a1a]">{lang.name}</span>
                  <span className="text-[#94a3b8] ml-1 text-xs capitalize">({lang.level})</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Extra-curricular */}
        {extraCurricular && extraCurricular.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <SectionLabel text="Activities" />
            <div className="space-y-3">
              {extraCurricular.map((activity) => (
                <div key={activity.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-[#1a1a1a]">{activity.title}</span>
                      {activity.organization && (
                        <span className="text-[#64748b]"> — {activity.organization}</span>
                      )}
                    </div>
                    {(activity.startDate || activity.endDate) && (
                      <span className="text-xs text-[#94a3b8] whitespace-nowrap ml-4">
                        {activity.startDate && formatDate(activity.startDate)} — {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                      </span>
                    )}
                  </div>
                  {activity.description && activity.description.length > 0 && (
                    <p className="text-sm text-[#374151] mt-1">{renderFormattedText(activity.description[0])}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {customSections && customSections.length > 0 && (
          <>
            {customSections.map((section) => (
              <section key={section.id} style={{ marginBottom: `${sectionSpacing}px` }}>
                <SectionLabel text={section.title || "Custom Section"} />
                <div className="space-y-2">
                  {(section.items || []).map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline">
                        <span className="font-medium text-[#1a1a1a]">{item.title}</span>
                        {(item.date || item.location) && (
                          <span className="text-xs text-[#94a3b8] whitespace-nowrap ml-4">
                            {item.date}{item.date && item.location ? " · " : ""}{item.location}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-[#374151] mt-1">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {/* Interests */}
        {hobbies && hobbies.length > 0 && (
          <section>
            <SectionLabel text="Interests" />
            <p className="text-sm text-[#64748b]">
              {hobbies.map((h) => h.name).join(" · ")}
            </p>
          </section>
        )}
      </div>

      {/* Empty State */}
      {!personalInfo.firstName &&
        workExperience.length === 0 &&
        education.length === 0 &&
        skills.length === 0 && (
          <div className="text-center py-20 text-[#94a3b8]">
            <p className="text-lg mb-2">Your resume preview will appear here</p>
            <p className="text-sm">
              Start filling out the form to see your resume come to life
            </p>
          </div>
        )}
    </div>
  );
}

/** Notion-style property label — tiny, muted, uppercase */
function SectionLabel({ text }: { text: string }) {
  return (
    <h2 className="text-xs uppercase tracking-[0.2em] text-[#94a3b8] mb-4">
      {text}
    </h2>
  );
}
