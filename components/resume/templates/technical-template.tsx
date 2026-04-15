import { renderFormattedText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  groupSkillsByCategory,
  getAllCourses,
} from "@/lib/utils";
import { Mail, MapPin, Globe, Linkedin, Github, Terminal } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { getIDETheme, DEFAULT_IDE_THEME } from "@/lib/constants/ide-themes";
import { ensureMinimumLuminance } from "@/lib/utils/color";
import { TemplateMain, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

interface TechnicalTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Technical Template - Developer/IDE Inspired
 *
 * A dark-theme template inspired by code editors and IDEs. Features syntax
 * highlighting colors, terminal-style formatting, and a layout that appeals
 * to developers and technical professionals.
 */
export function TechnicalTemplate({ data, customization }: TechnicalTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const skillsByCategory = groupSkillsByCategory(skills);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Get IDE theme based on customization or use default
  const ideTheme = customization?.ideThemeId
    ? getIDETheme(customization.ideThemeId)
    : DEFAULT_IDE_THEME;

  const readableAccent = (override: string | undefined, fallback: string) =>
    override ? ensureMinimumLuminance(override, 0.4) : fallback;

  // Keep IDE palette feel, but allow customizer colors to override key accents.
  const colors = {
    ...ideTheme.colors,
    function: readableAccent(customization?.primaryColor, ideTheme.colors.function),
    keyword: readableAccent(customization?.secondaryColor, ideTheme.colors.keyword),
    type: readableAccent(customization?.accentColor, ideTheme.colors.type),
  };
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing || 32;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const fontFamily = getTemplateFontFamily(customization, "technical");

  return (
    <div
      className="w-full min-h-[297mm] pb-10"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        fontFamily: fontFamily,
      }}
    >
      {/* Window Title Bar */}
      <div
        className="flex items-center px-4 py-2 text-xs"
        style={{ backgroundColor: colors.sidebar, borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex gap-2 mr-4">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2" style={{ color: colors.textMuted }}>
          <Terminal className="w-3 h-3" />
          <span>{fullName.toLowerCase().replace(/\s+/g, "_")}_resume.md</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Contact & Skills */}
        <aside
          className="w-64 p-6 flex-shrink-0 space-y-6"
          style={{
            backgroundColor: colors.sidebar,
            borderRight: `1px solid ${colors.border}`,
          }}
        >
          {/* Photo */}
          {personalInfo.photo && (
            <div className="mb-4">
              <ProfilePhoto
                photo={personalInfo.photo}
                firstName={personalInfo.firstName}
                lastName={personalInfo.lastName}
                size={80}
                shape="square"
                style={{ border: `2px solid ${colors.keyword}` }}
              />
            </div>
          )}

          {/* Profile Section */}
          <div>
            <TemplateH1
              className="text-2xl font-bold mb-1"
              style={{ color: colors.function }}
            >
              {fullName || "Your Name"}
            </TemplateH1>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: colors.type }}
            >
              {personalInfo.jobTitle ||
                personalInfo.summary?.split(".")[0]?.slice(0, 40) ||
                "Software Developer"}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 min-w-0" style={baseTextStyle}>
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.comment }}>
              {"// Contact"}
            </div>
            {personalInfo.email && (
              <div className="flex items-start gap-2 text-xs min-w-0">
                <Mail className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: colors.keyword }} />
                <a className="min-w-0 break-words" style={{ color: colors.string }} title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">
                  &quot;{formatEmailDisplay(personalInfo.email, 28)}&quot;
                </a>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-start gap-2 text-xs min-w-0">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: colors.keyword }} />
                <span className="min-w-0 break-words" style={{ color: colors.string }}>&quot;{personalInfo.location}&quot;</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-start gap-2 text-xs min-w-0">
                <Linkedin className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: colors.keyword }} />
                <a className="min-w-0 break-words" style={{ color: colors.variable }} title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
                  {formatLinkedinDisplay(personalInfo.linkedin, 28)}
                </a>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-start gap-2 text-xs min-w-0">
                <Github className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: colors.keyword }} />
                <a className="min-w-0 break-words" style={{ color: colors.variable }} title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">
                  {formatGithubDisplay(personalInfo.github, 28)}
                </a>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-start gap-2 text-xs min-w-0">
                <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: colors.keyword }} />
                <a className="min-w-0 break-words" style={{ color: colors.variable }} title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">
                  {formatWebsiteDisplay(personalInfo.website, 28)}
                </a>
              </div>
            )}
          </div>

          {/* Skills Section */}
          {skills.length > 0 && (
            <div className="space-y-4" style={baseTextStyle}>
              <div className="text-xs uppercase tracking-wider" style={{ color: colors.comment }}>
                {"// Tech Stack"}
              </div>
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category}>
                  <div
                    className="text-xs font-bold mb-2"
                    style={{ color: colors.type }}
                  >
                    {category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.variable,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-wider" style={{ color: colors.comment }}>
                {"// Languages"}
              </div>
              <div className="space-y-1">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="text-xs flex justify-between">
                    <span style={{ color: colors.text }}>{lang.name}</span>
                    <span style={{ color: colors.textMuted }}>
                      {lang.level === "native" && "●●●●"}
                      {lang.level === "fluent" && "●●●○"}
                      {lang.level === "conversational" && "●●○○"}
                      {lang.level === "basic" && "●○○○"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <TemplateMain className="flex-1 p-8" style={{ ...baseTextStyle, display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
          {/* Summary */}
          {personalInfo.summary && (
            <section>
              <pre
                className="text-sm whitespace-pre-wrap"
                style={{ color: colors.comment }}
              >
                {`/**
 * ${personalInfo.summary}
 */`}
              </pre>
            </section>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 pb-2 flex items-center gap-2"
                style={{
                  color: colors.function,
                  borderBottom: `2px solid ${colors.border}`
                }}
              >
                <span style={{ color: colors.keyword }}>const</span>
                experience
                <span style={{ color: colors.keyword }}>=</span>
                <span style={{ color: colors.type }}>[</span>
              </h2>

              <div className="space-y-6 ml-4">
                {sortedExperience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderLeft: `3px solid ${index === 0 ? colors.keyword : colors.border}`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold" style={{ color: colors.function }}>
                          {exp.position}
                        </h3>
                        <div className="text-sm">
                          <span style={{ color: colors.type }}>@</span>
                          <span style={{ color: colors.variable }}>{exp.company}</span>
                          {exp.location && (
                            <span style={{ color: colors.textMuted }}> • {exp.location}</span>
                          )}
                        </div>
                      </div>
                      <div
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: colors.hover,
                          color: colors.number,
                        }}
                      >
                        {formatDate(exp.startDate)} → {exp.current ? "now" : formatDate(exp.endDate || "")}
                      </div>
                    </div>

                    {exp.description.length > 0 && (
                      <div className="space-y-1.5 text-sm mt-3 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <div key={idx} style={{ color: colors.text }}>
                                {renderFormattedText(item)}
                              </div>
                            )
                        )}
                      </div>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div
                        className="mt-3 p-3 rounded"
                        style={{ backgroundColor: colors.hover }}
                      >
                        <div
                          className="text-xs mb-2"
                          style={{ color: colors.comment }}
                        >
                          {"// Key achievements"}
                        </div>
                        <div className="space-y-1 text-sm [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <div key={idx} style={{ color: colors.string }}>
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
              <div
                className="text-lg font-bold mt-4"
                style={{ color: colors.type }}
              >
                ];
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 pb-2 flex items-center gap-2"
                style={{
                  color: colors.function,
                  borderBottom: `2px solid ${colors.border}`
                }}
              >
                <span style={{ color: colors.keyword }}>const</span>
                projects
                <span style={{ color: colors.keyword }}>=</span>
                <span style={{ color: colors.type }}>[</span>
              </h2>

              <div className="flex flex-wrap gap-4 ml-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg flex-1 min-w-[300px]"
                    style={{
                      backgroundColor: colors.sidebar,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: colors.keyword }}>{"{"}</span>
                      <h3 className="font-bold" style={{ color: colors.function }}>
                        {project.name}
                      </h3>
                      <span style={{ color: colors.keyword }}>{"}"}</span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: colors.textMuted }}>
                      {renderFormattedText(project.description)}
                    </p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: colors.hover,
                              color: colors.type,
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {(project.url || project.github) && (
                      <div className="mt-2 text-xs" style={{ color: colors.variable }}>
                        {project.github && <span>github.com/{project.github.split("/").pop()}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="text-lg font-bold mt-4"
                style={{ color: colors.type }}
              >
                ];
              </div>
            </section>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 pb-2 flex items-center gap-2"
                style={{
                  color: colors.function,
                  borderBottom: `2px solid ${colors.border}`
                }}
              >
                <span style={{ color: colors.keyword }}>const</span>
                education
                <span style={{ color: colors.keyword }}>=</span>
                <span style={{ color: colors.type }}>[</span>
              </h2>

              <div className="space-y-4 ml-4">
                {sortedEducation.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderLeft: `3px solid ${colors.comment}`,
                    }}
                  >
                    <h3 className="font-bold" style={{ color: colors.function }}>
                      {edu.degree}
                      {edu.field && (
                        <span style={{ color: colors.textMuted }}> in </span>
                      )}
                      {edu.field && (
                        <span style={{ color: colors.type }}>{edu.field}</span>
                      )}
                    </h3>
                    <div className="text-sm mt-1">
                      <span style={{ color: colors.variable }}>{edu.institution}</span>
                      <span style={{ color: colors.textMuted }}> • </span>
                      <span style={{ color: colors.number }}>
                        {formatDate(edu.startDate)} → {edu.current ? "now" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                    {edu.gpa && (
                      <div className="text-xs mt-2" style={{ color: colors.comment }}>
                        Grade: {edu.gpa}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div
                className="text-lg font-bold mt-4"
                style={{ color: colors.type }}
              >
                ];
              </div>
            </section>
          )}

          {/* Activities */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 pb-2 flex items-center gap-2"
                style={{
                  color: colors.function,
                  borderBottom: `2px solid ${colors.border}`,
                }}
              >
                <span style={{ color: colors.keyword }}>const</span>
                activities
                <span style={{ color: colors.keyword }}>=</span>
                <span style={{ color: colors.type }}>[</span>
              </h2>

              <div className="space-y-4 ml-4">
                {data.extraCurricular.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: colors.sidebar,
                      borderLeft: `3px solid ${colors.comment}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: colors.keyword }}>{"{"}</span>
                      <h3 className="font-bold" style={{ color: colors.function }}>
                        {activity.title}
                      </h3>
                      <span style={{ color: colors.keyword }}>{"}"}</span>
                    </div>
                    <div className="text-sm mt-1">
                      <span style={{ color: colors.variable }}>{activity.organization}</span>
                      {activity.role && (
                        <>
                          <span style={{ color: colors.textMuted }}> • </span>
                          <span style={{ color: colors.string }}>{activity.role}</span>
                        </>
                      )}
                      {(activity.startDate || activity.endDate) && (
                        <>
                          <span style={{ color: colors.textMuted }}> • </span>
                          <span style={{ color: colors.number }}>
                            {formatDate(activity.startDate || "")} →{" "}
                            {activity.current ? "now" : formatDate(activity.endDate || "")}
                          </span>
                        </>
                      )}
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {activity.description.filter((d) => d.trim()).map((item, idx) => (
                          <li key={idx} style={{ color: colors.textMuted }}>
                            <span style={{ color: colors.comment }}>// </span>
                            {renderFormattedText(item)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-lg font-bold mt-4" style={{ color: colors.type }}>
                ];
              </div>
            </section>
          )}

          {/* Certifications */}
          {(() => {
            const allCourses = getAllCourses(data);
            return allCourses.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-4 flex items-center gap-2"
                  style={{ color: colors.function }}
                >
                  <span style={{ color: colors.comment }}>// </span>
                  Certifications
                </h2>
                <div className="flex flex-wrap gap-3">
                  {allCourses.map((course) => (
                    <div
                      key={course.id}
                      className="text-sm p-3 rounded flex-1 min-w-[200px]"
                      style={{ backgroundColor: colors.sidebar }}
                    >
                      <span style={{ color: colors.string }}>{course.name}</span>
                      {course.institution && (
                        <span style={{ color: colors.textMuted }}> @ {course.institution}</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Hobbies / Interests */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-4 flex items-center gap-2"
                style={{ color: colors.function }}
              >
                <span style={{ color: colors.comment }}>// </span>
                Interests
              </h2>
              <p className="text-sm" style={{ color: colors.text }}>
                {data.hobbies.map((h) => h.name).join(" · ")}
              </p>
            </section>
          )}
        </TemplateMain>
      </div>

      {/* Empty State */}
      {!personalInfo.firstName &&
        workExperience.length === 0 &&
        education.length === 0 &&
        skills.length === 0 && (
          <div className="text-center py-20" style={{ color: colors.textMuted }}>
            <p className="text-lg mb-2">// Your resume preview will appear here</p>
            <p className="text-sm">
              // Start filling out the form to see your resume come to life
            </p>
          </div>
        )}
    </div>
  );
}
