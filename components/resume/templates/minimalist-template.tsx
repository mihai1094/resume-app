import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  getAllCourses,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";
import { TemplateMain, TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import { TemplateBulletList } from "./shared";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";
import { MapPin } from "lucide-react";

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

  // Minimalist color palette - pure black with strategic use of gray.
  // Job-title subtitle deliberately ignores the palette accent: palette secondaries
  // (e.g. Rose #fb7185, Slate #94a3b8) fail WCAG AA contrast on white when used as
  // text, and the Swiss/minimalist aesthetic calls for restrained, neutral greys.
  const primaryColor = customization?.primaryColor || "#000000";
  const jobTitleColor = "#4b5563"; // gray-600, ~7.5:1 on white (AA + AAA)
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineSpacing = customization?.lineSpacing ?? 1.7;
  const sectionSpacing = customization?.sectionSpacing || 48;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const fontFamily = getTemplateFontFamily(customization, "professional");

  return (
    <div
      className="w-full bg-white text-black min-h-[297mm] p-16"
      style={{ fontFamily: fontFamily }}
    >
      {/* Header - Clean Grid */}
      <TemplateHeader className="mb-16">
        <div className="flex flex-row gap-4 justify-between">
          {/* Photo + Name */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-start gap-6">
              {personalInfo.photo && (
                <ProfilePhoto
                  photo={personalInfo.photo}
                  firstName={personalInfo.firstName}
                  lastName={personalInfo.lastName}
                  size={80}
                  shape="circular"
                  className="flex-shrink-0"
                  style={{ border: `2px solid ${primaryColor}` }}
                />
              )}
              <div className="min-w-0">
                <TemplateH1
                  className="text-[42px] font-bold tracking-tight leading-none mb-6 break-words"
                  style={{ color: primaryColor }}
                >
                  {fullName || "Your Name"}
                </TemplateH1>

                {personalInfo.jobTitle && (
                  <p
                    className="text-sm uppercase tracking-[0.14em] mb-3"
                    style={{ color: jobTitleColor, fontWeight: 600 }}
                  >
                    {personalInfo.jobTitle}
                  </p>
                )}

                {/* Summary - Clean, understated */}
                {personalInfo.summary && (
                  <p
                    className="text-base text-gray-600 max-w-xl leading-relaxed"
                    style={{ fontWeight: 300 }}
                  >
                    {renderSummaryText(personalInfo.summary)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info - Right aligned */}
          <div className="text-right flex-shrink-0 w-1/3 min-w-0">
            <div className="space-y-1 text-sm text-gray-600" style={{ fontWeight: 300 }}>
              {personalInfo.email && (
                <a className="break-words hover:underline" title={personalInfo.email} href={`mailto:${personalInfo.email}`}>{formatEmailDisplay(personalInfo.email, 32)}</a>
              )}
              {personalInfo.phone && <div>{personalInfo.phone}</div>}
              {personalInfo.location && <div className="flex items-center justify-end gap-1"><MapPin className="w-3 h-3 shrink-0" /><span className="break-words">{personalInfo.location}</span></div>}
              {personalInfo.website && (
                <a className="text-black break-words hover:underline" title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">{formatWebsiteDisplay(personalInfo.website, 32)}</a>
              )}
              {personalInfo.linkedin && (
                <a className="text-black break-words hover:underline" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
                  {formatLinkedinDisplay(personalInfo.linkedin, 32)}
                </a>
              )}
              {personalInfo.github && (
                <a className="text-black break-words hover:underline" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">{formatGithubDisplay(personalInfo.github, 32)}</a>
              )}
            </div>
          </div>
        </div>

        {/* Horizontal Rule */}
        <div className="h-px bg-black mt-8" />
      </TemplateHeader>

      {/* Main Content - Flex Based */}
      <div className="flex flex-row gap-8 w-full" style={baseTextStyle}>
        {/* Main Column */}
        <TemplateMain className="flex-1 min-w-0 w-2/3" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section>
              <h2
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
                style={{ color: primaryColor }}
              >
                Experience
              </h2>

              <div className="space-y-8">
                {sortedExperience.map((exp) => (
                  <div key={exp.id} style={{ breakInside: 'avoid' }}>
                    <div className="flex flex-row gap-4 mb-2 justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold">{exp.position}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        {exp.location && <p className="text-gray-400 text-sm inline-flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{exp.location}</p>}
                      </div>
                      <div className="text-right text-gray-500 text-sm flex-shrink-0">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </div>
                    </div>

                    {exp.description.length > 0 && (
                      <TemplateBulletList
                        items={exp.description}
                        className="mt-3 space-y-1.5 text-gray-700"
                        itemClassName="items-start"
                        renderBullet={() => (
                          <span
                            className="block h-full min-h-5 w-px flex-shrink-0 ml-2"
                            style={{ backgroundColor: `${primaryColor}20` }}
                          />
                        )}
                      />
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <TemplateBulletList
                        items={exp.achievements}
                        className="mt-3 space-y-1.5"
                        itemClassName="items-start text-black font-medium"
                        renderBullet={() => (
                          <span
                            className="block h-full min-h-5 w-0.5 flex-shrink-0 ml-2"
                            style={{ backgroundColor: primaryColor }}
                          />
                        )}
                      />
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
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
                style={{ color: primaryColor }}
              >
                Education
              </h2>

              <div className="space-y-6">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} style={{ breakInside: 'avoid' }}>
                    <div className="flex flex-row gap-4 justify-between">
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-bold">
                          {edu.degree}
                          {edu.field && <span className="font-normal text-gray-600">{edu.degree ? " in " : ""}{edu.field}</span>}
                        </h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        {edu.gpa && <p className="text-gray-500 text-sm">Grade: {edu.gpa}</p>}
                      </div>
                      {(edu.startDate || edu.endDate || edu.current) && (
                        <div className="text-right text-gray-500 text-sm flex-shrink-0">
                          {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                        </div>
                      )}
                    </div>

                    {edu.description && edu.description.length > 0 && (
                      <TemplateBulletList
                        items={edu.description}
                        className="mt-2 space-y-1 text-gray-700"
                        itemClassName="items-start"
                        renderBullet={() => (
                          <span
                            className="block h-full min-h-5 w-px flex-shrink-0 ml-2"
                            style={{ backgroundColor: `${primaryColor}20` }}
                          />
                        )}
                      />
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
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
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
                        <span className="text-sm text-gray-500 min-w-0 break-words" title={project.url}>
                          {formatWebsiteDisplay(project.url, 40)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">{renderFormattedText(project.description)}</p>
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
                className="text-[10px] font-bold uppercase tracking-[0.4em] mb-3"
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
                      <p className="text-gray-600 mt-1">{renderFormattedText(activity.description[0])}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </TemplateMain>

        {/* Sidebar */}
        <aside className="w-1/3 flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing * 0.83}px` }}>
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
          {(() => {
            const allCourses = getAllCourses(data);
            return allCourses.length > 0 && (
              <section>
                <h2
                  className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6"
                  style={{ color: primaryColor }}
                >
                  Certifications
                </h2>

                <div className="space-y-3">
                  {allCourses.map((course) => (
                    <div key={course.id}>
                      <p className="font-medium">{course.name}</p>
                      {course.institution && (
                        <p className="text-sm text-gray-500">{course.institution}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

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
