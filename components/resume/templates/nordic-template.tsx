import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  groupSkillsByCategory,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";
import { TemplateMain, TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";
import { MapPin } from "lucide-react";

interface NordicTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Nordic Template — Scandinavian Design
 *
 * Extreme whitespace, hierarchy through scale and weight only.
 * No lines, no borders, no decorative elements. Everything that's
 * not content is silence. Two-column asymmetric (70/30) with no
 * visual separator — just whitespace.
 */
export function NordicTemplate({ data, customization }: NordicTemplateProps) {
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
  } = data;

  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  const primaryColor = customization?.primaryColor || "#2d5a3d"; // forest green
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing || 40;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const skillsByCategory = groupSkillsByCategory(skills);

  return (
    <div
      className="w-full bg-[#fafaf9] text-[#2d2d2d] min-h-[297mm] p-14"
      style={{ fontFamily }}
    >
      {/* Header — massive serif name */}
      <TemplateHeader className="mb-16">
        <div className="flex items-start gap-6">
          {/* Photo — small, sidebar-aligned */}
          {personalInfo.photo && (
            <ProfilePhoto
              photo={personalInfo.photo}
              firstName={personalInfo.firstName}
              lastName={personalInfo.lastName}
              size={64}
              shape="circular"
              className="flex-shrink-0"
              style={{ border: `2px solid ${primaryColor}` }}
            />
          )}
          <div className="flex-1">
            <TemplateH1
              className="font-bold tracking-tight mb-3"
              style={{
                fontSize: "48px",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: primaryColor,
                fontFamily: "var(--font-display), Georgia, serif",
              }}
            >
              {fullName || "Your Name"}
            </TemplateH1>
            {personalInfo.jobTitle && (
              <p className="text-sm text-[#6b7280] mb-4">
                {personalInfo.jobTitle}
              </p>
            )}

            {/* Contact — soft, horizontal */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-[#9ca3af] max-w-full">
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
          </div>
        </div>
      </TemplateHeader>

      {/* Summary */}
      {personalInfo.summary && (
        <p
          className="text-[#4b5563] leading-relaxed mb-12 max-w-2xl"
          style={{ fontSize: `${baseFontSize + 1}px`, lineHeight: 1.8 }}
        >
          {renderSummaryText(personalInfo.summary)}
        </p>
      )}

      {/* Two-column content — 70/30, no separator */}
      <div className="flex gap-16" style={baseTextStyle}>
        {/* Main column — 70% */}
        <TemplateMain className="flex-[7] min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section>
              <NordicHeading text="Experience" color={primaryColor} />
              <div className="space-y-8">
                {sortedExperience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-[#1a1a1a]">{exp.position}</h3>
                      <span className="text-xs text-[#9ca3af] whitespace-nowrap ml-4">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>
                    <p className="text-sm text-[#6b7280] mb-2">
                      {exp.company}
                      {exp.location && ` · ${exp.location}`}
                    </p>

                    {exp.description.length > 0 && (
                      <div className="space-y-1.5 text-sm text-[#4b5563] [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-3 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <div key={idx} className="text-sm font-medium text-[#1a1a1a]">
                                {renderFormattedText(achievement)}
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

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section>
              <NordicHeading text="Education" color={primaryColor} />
              <div className="space-y-6">
                {sortedEducation.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-[#1a1a1a]">
                        {edu.degree}
                        {edu.field && <span className="font-normal text-[#6b7280]"> in {edu.field}</span>}
                      </h3>
                      <span className="text-xs text-[#9ca3af] whitespace-nowrap ml-4">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                    <p className="text-sm text-[#6b7280]">{edu.institution}</p>
                    {edu.gpa && <p className="text-xs text-[#9ca3af] mt-1">Grade: {edu.gpa}</p>}
                    {edu.description && edu.description.length > 0 && (
                      <div className="text-sm text-[#4b5563] mt-2 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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

          {/* Projects */}
          {projects && projects.length > 0 && (
            <section>
              <NordicHeading text="Projects" color={primaryColor} />
              <div className="space-y-5">
                {projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-semibold text-[#1a1a1a]">{project.name}</h3>
                      {(project.startDate || project.endDate) && (
                        <span className="text-xs text-[#9ca3af] whitespace-nowrap ml-4">
                          {project.startDate ? formatDate(project.startDate) : ""}
                          {(project.startDate || project.endDate) && " — "}
                          {project.endDate ? formatDate(project.endDate) : "Present"}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-[#4b5563] mt-1">{renderFormattedText(project.description)}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="text-xs text-[#9ca3af] mt-1">
                        {project.technologies.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Extra-curricular */}
          {extraCurricular && extraCurricular.length > 0 && (
            <section>
              <NordicHeading text="Activities" color={primaryColor} />
              <div className="space-y-4">
                {extraCurricular.map((activity) => (
                  <div key={activity.id}>
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-semibold text-[#1a1a1a]">{activity.title}</span>
                        {activity.organization && (
                          <span className="text-[#6b7280]"> — {activity.organization}</span>
                        )}
                      </div>
                      {(activity.startDate || activity.endDate) && (
                        <span className="text-xs text-[#9ca3af] whitespace-nowrap ml-4">
                          {activity.startDate && formatDate(activity.startDate)} — {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                        </span>
                      )}
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <p className="text-sm text-[#4b5563] mt-1">{renderFormattedText(activity.description[0])}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </TemplateMain>

        {/* Sidebar — 30%, text only, no backgrounds */}
        <aside className="flex-[3] min-w-0" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <NordicHeading text="Skills" color={primaryColor} />
              <div className="space-y-3">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <p className="text-xs text-[#9ca3af] mb-1">{category}</p>
                    <p className="text-sm text-[#4b5563]">
                      {categorySkills.map((s) => s.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <section>
              <NordicHeading text="Languages" color={primaryColor} />
              <div className="space-y-1">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-sm">
                    <span className="text-[#4b5563]">{lang.name}</span>
                    <span className="text-[#9ca3af] text-xs capitalize">{lang.level}</span>
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
              ...certs.map(c => ({ id: c.id, name: c.name, issuer: c.issuer })),
              ...coursesFromCerts.map(c => ({ id: c.id, name: c.name, issuer: c.issuer })),
              ...legacyCourses.map(c => ({ id: c.id, name: c.name, issuer: c.institution })),
            ];
            return allCerts.length > 0 && (
              <section>
                <NordicHeading text="Certifications" color={primaryColor} />
                <div className="space-y-2">
                  {allCerts.map((cert) => (
                    <div key={cert.id}>
                      <p className="text-sm font-medium text-[#1a1a1a]">{cert.name}</p>
                      {cert.issuer && <p className="text-xs text-[#9ca3af]">{cert.issuer}</p>}
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Interests */}
          {hobbies && hobbies.length > 0 && (
            <section>
              <NordicHeading text="Interests" color={primaryColor} />
              <p className="text-sm text-[#6b7280]">
                {hobbies.map((h) => h.name).join(", ")}
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
          <div className="text-center py-20 text-[#9ca3af]">
            <p className="text-lg mb-2">Your resume preview will appear here</p>
            <p className="text-sm">
              Start filling out the form to see your resume come to life
            </p>
          </div>
        )}
    </div>
  );
}

/** Nordic section heading — just the word, no decoration */
function NordicHeading({ text, color }: { text: string; color: string }) {
  return (
    <h2
      className="text-sm font-medium mb-4"
      style={{ color }}
    >
      {text}
    </h2>
  );
}
