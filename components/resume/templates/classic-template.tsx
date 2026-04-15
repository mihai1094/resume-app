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
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import { TemplateBulletList } from "./shared";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";
import { MapPin } from "lucide-react";

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

  const skillsByCategory = groupSkillsByCategory(skills);

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

  const fontFamily = getTemplateFontFamily(customization, "professional");

  return (
    <div
      className="w-full bg-white text-gray-900 p-12 min-h-[297mm]"
      style={{ fontFamily: fontFamily }}
    >
      {/* Header - Centered, Traditional Style */}
      <TemplateHeader className="text-center mb-10">
        {/* Photo */}
        {personalInfo.photo && (
          <div className="mb-6 flex justify-center">
            <ProfilePhoto
              photo={personalInfo.photo}
              firstName={personalInfo.firstName}
              lastName={personalInfo.lastName}
              size={96}
              shape="circular"
              className="border-2"
              style={{ borderColor: accentColor }}
            />
          </div>
        )}

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-px" style={{ backgroundColor: accentColor }} />
          <div className="w-2 h-2 rotate-45" style={{ backgroundColor: accentColor }} />
          <div className="w-16 h-px" style={{ backgroundColor: accentColor }} />
        </div>

        <TemplateH1
          className="text-4xl font-normal mb-4 tracking-wide"
          style={{
            color: primaryColor,
            fontFamily: "var(--font-display), Georgia, serif",
          }}
        >
          {fullName || "Your Name"}
        </TemplateH1>

        {personalInfo.jobTitle && (
          <p
            className="text-sm uppercase tracking-[0.18em] mb-4"
            style={{ color: accentColor }}
          >
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Info - Elegant inline layout */}
        <div className="text-sm text-gray-600 space-y-1">
          {personalInfo.location && (
            <div className="tracking-wide inline-flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{personalInfo.location}</div>
          )}
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 max-w-full">
            {personalInfo.email && (
              <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
            )}
            {personalInfo.phone && (
              <>
                <span className="text-gray-300">|</span>
                <span>{personalInfo.phone}</span>
              </>
            )}
          </div>
          {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
            <div className="flex justify-center flex-wrap gap-4 text-xs mt-2 max-w-full">
              {personalInfo.linkedin && (
                <a className="min-w-0 break-words" style={{ color: accentColor }} title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
                  {formatLinkedinDisplay(personalInfo.linkedin, 45)}
                </a>
              )}
              {personalInfo.website && (
                <a className="min-w-0 break-words" style={{ color: accentColor }} title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">
                  {formatWebsiteDisplay(personalInfo.website, 45)}
                </a>
              )}
              {personalInfo.github && (
                <a className="min-w-0 break-words" style={{ color: accentColor }} title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">
                  {formatGithubDisplay(personalInfo.github, 45)}
                </a>
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
      </TemplateHeader>

      <div style={baseTextStyle}>
        {/* Professional Summary */}
        {personalInfo.summary && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <p
              className="text-gray-700 max-w-3xl mx-auto leading-relaxed"
              style={{ fontStyle: "italic" }}
            >
              {renderSummaryText(personalInfo.summary)}
            </p>
          </section>
        )}

        {/* Key Strengths */}
        {strengthHighlights.length > 0 && (
          <section className="py-4 px-6 border-t border-b" style={{ marginBottom: `${sectionSpacing}px`, borderColor: `${primaryColor}20` }}>
            <div className="flex flex-wrap gap-6 text-center justify-center">
              {strengthHighlights.map(([category, categorySkills]) => (
                <div key={category} className="flex-1 min-w-[200px]">
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
                    <TemplateBulletList
                      items={exp.description}
                      className="space-y-1.5 text-sm text-gray-700 ml-4 mt-2"
                      renderBullet={() => (
                        <span className="ml-4 list-disc text-base leading-5 text-current">
                          •
                        </span>
                      )}
                    />
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-3 ml-4">
                      <p
                        className="text-xs uppercase tracking-wider mb-1"
                        style={{ color: accentColor }}
                      >
                        Key Achievements
                      </p>
                      <TemplateBulletList
                        items={exp.achievements}
                        className="space-y-1 text-sm text-gray-800"
                        renderBullet={() => (
                          <span style={{ color: accentColor }}>◦</span>
                        )}
                      />
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
                    <p className="text-sm text-gray-600 ml-4">Grade: {edu.gpa}</p>
                  )}

                  {edu.description && edu.description.length > 0 && (
                    <TemplateBulletList
                      items={edu.description}
                      className="space-y-1 text-sm text-gray-700 ml-4 mt-1"
                      renderBullet={() => (
                        <span className="ml-4 list-disc text-base leading-5 text-current">
                          •
                        </span>
                      )}
                    />
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

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm uppercase tracking-[0.25em] mb-6 pb-2 text-center font-bold"
              style={{
                color: primaryColor,
                borderBottom: `1px solid ${primaryColor}`,
              }}
            >
              Projects
            </h2>

            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline gap-4">
                    <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                      {project.name}
                    </h3>
                    {(project.startDate || project.endDate) && (
                      <span className="text-sm text-gray-500 whitespace-nowrap italic">
                        {project.startDate ? formatDate(project.startDate) : ""}
                        {(project.startDate || project.endDate) && " – "}
                        {project.endDate ? formatDate(project.endDate) : "Present"}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-700 mt-1">{renderFormattedText(project.description)}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span style={{ color: accentColor }}>Technologies:</span>{" "}
                      {project.technologies.join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Two-column layout for Languages & Certifications */}
        {((data.languages && data.languages.length > 0) ||
          (data.courses && data.courses.length > 0) ||
          (data.certifications && data.certifications.length > 0)) && (
          <div className="flex flex-wrap gap-8" style={{ marginBottom: `${sectionSpacing}px` }}>
            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <section className="flex-1 min-w-[250px]">
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
                <section className="flex-1 min-w-[250px]">
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
                    {allCourses.map((course) => (
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
              );
            })()}
          </div>
        )}

        {/* Custom Sections */}
        {data.customSections && data.customSections.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            {data.customSections.map((section) => (
              <div key={section.id} className="mb-6 last:mb-0">
                <h2
                  className="text-sm uppercase tracking-[0.25em] mb-4 pb-2 text-center font-bold"
                  style={{
                    color: primaryColor,
                    borderBottom: `1px solid ${primaryColor}`,
                  }}
                >
                  {section.title || "Custom Section"}
                </h2>

                <div className="space-y-3">
                  {(section.items || []).map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-baseline gap-4">
                        <p className="text-sm font-bold" style={{ color: primaryColor }}>
                          {item.title}
                        </p>
                        {(item.date || item.location) && (
                          <p className="text-xs text-gray-500 italic whitespace-nowrap">
                            {item.date}
                            {item.date && item.location ? " · " : ""}
                            {item.location}
                          </p>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-700 mt-1">{item.description}</p>
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
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm uppercase tracking-[0.25em] mb-6 pb-2 text-center font-bold"
              style={{
                color: primaryColor,
                borderBottom: `1px solid ${primaryColor}`,
              }}
            >
              Activities
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
                    <div className="space-y-1 text-sm text-gray-700 ml-4 mt-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                      {activity.description.map(
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
