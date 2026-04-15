import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  getCertifications,
} from "@/lib/utils";
import { Mail, MapPin, Phone, Globe, Linkedin, Github } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { TemplateMain, TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

interface HorizonTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Horizon Template — Corporate Two-Column with Soft Blue Sidebar
 *
 * A clean, approachable corporate layout with a large square portrait anchoring
 * a pale tinted sidebar. The name sits large and uppercase in the accent color,
 * with a quiet job-title subtitle underneath. Section dividers in the sidebar are
 * hairline rules — the design stays calm so your content does the work.
 */
export function HorizonTemplate({ data, customization }: HorizonTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  // Deep navy by default — approachable-corporate. The sidebar pulls a very
  // light tint of the primary so changing palette recolors the whole frame.
  const primaryColor = customization?.primaryColor || "#1e3a8a";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineSpacing = customization?.lineSpacing ?? 1.55;
  const sectionSpacing = customization?.sectionSpacing ?? 20;

  // Pale tinted surface — 14% primary on white, always readable
  const sidebarBg = `${primaryColor}14`;
  // Hairline rule inside the sidebar
  const sidebarRule = `${primaryColor}33`;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Pull non-course certifications for the main column, and separate real
  // "course" entries (or legacy data.courses) for optional rendering later.
  const certifications = getCertifications(data);

  return (
    <div
      className="w-full bg-white text-gray-900"
      style={{ fontFamily, ...baseTextStyle }}
    >
      <div className="flex min-h-[297mm]">
        {/* ─── Sidebar ─── */}
        <aside
          className="w-[36%] flex-shrink-0 px-8 py-10"
          style={{ backgroundColor: sidebarBg }}
        >
          {/* Photo — stretches to sidebar width */}
          {personalInfo.photo && (
            <div className="mb-8">
              <ProfilePhoto
                photo={personalInfo.photo}
                firstName={personalInfo.firstName}
                lastName={personalInfo.lastName}
                size={280}
                shape="square"
                className="w-full aspect-square rounded-sm"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}

          {/* Details */}
          {(personalInfo.email ||
            personalInfo.phone ||
            personalInfo.location ||
            personalInfo.website ||
            personalInfo.linkedin ||
            personalInfo.github) && (
            <section className="mb-6">
              <h2
                className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
                style={{ color: primaryColor }}
              >
                Details
              </h2>
              <ul
                className="space-y-2.5 text-[12px] text-gray-800"
                style={{ lineHeight: 1.45 }}
              >
                {personalInfo.email && (
                  <li className="flex items-start gap-2.5 min-w-0">
                    <Mail
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <a
                      className="min-w-0 break-words"
                      title={personalInfo.email}
                     href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">
                      {formatEmailDisplay(personalInfo.email, 34)}
                    </a>
                  </li>
                )}
                {personalInfo.location && (
                  <li className="flex items-start gap-2.5 min-w-0">
                    <MapPin
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <span className="min-w-0 break-words">
                      {personalInfo.location}
                    </span>
                  </li>
                )}
                {personalInfo.phone && (
                  <li className="flex items-start gap-2.5">
                    <Phone
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <span>{personalInfo.phone}</span>
                  </li>
                )}
                {personalInfo.website && (
                  <li className="flex items-start gap-2.5 min-w-0">
                    <Globe
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <a
                      className="min-w-0 break-words"
                      title={personalInfo.website}
                     href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">
                      {formatWebsiteDisplay(personalInfo.website, 34)}
                    </a>
                  </li>
                )}
                {personalInfo.linkedin && (
                  <li className="flex items-start gap-2.5 min-w-0">
                    <Linkedin
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <a
                      className="min-w-0 break-words"
                      title={personalInfo.linkedin}
                     href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
                      {formatLinkedinDisplay(personalInfo.linkedin, 34)}
                    </a>
                  </li>
                )}
                {personalInfo.github && (
                  <li className="flex items-start gap-2.5 min-w-0">
                    <Github
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <a
                      className="min-w-0 break-words"
                      title={personalInfo.github}
                     href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">
                      {formatGithubDisplay(personalInfo.github, 34)}
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <>
              <div
                className="h-px mb-6"
                style={{ backgroundColor: sidebarRule }}
              />
              <section className="mb-6">
                <h2
                  className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
                  style={{ color: primaryColor }}
                >
                  Skills
                </h2>
                <ul className="space-y-1.5 text-[12px] text-gray-800">
                  {skills.map((skill) => (
                    <li key={skill.id} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span>{skill.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <>
              <div
                className="h-px mb-6"
                style={{ backgroundColor: sidebarRule }}
              />
              <section className="mb-6">
                <h2
                  className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
                  style={{ color: primaryColor }}
                >
                  Languages
                </h2>
                <ul className="space-y-1.5 text-[12px] text-gray-800">
                  {data.languages.map((lang) => (
                    <li key={lang.id} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <span>
                        {lang.name}
                        <span className="text-gray-500 capitalize">
                          {" "}
                          — {lang.level}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && (
            <>
              <div
                className="h-px mb-6"
                style={{ backgroundColor: sidebarRule }}
              />
              <section>
                <h2
                  className="text-[11px] font-bold uppercase tracking-[0.12em] mb-3"
                  style={{ color: primaryColor }}
                >
                  Interests
                </h2>
                <p className="text-[12px] text-gray-800 leading-relaxed">
                  {data.hobbies.map((h) => h.name).join(" · ")}
                </p>
              </section>
            </>
          )}
        </aside>

        {/* ─── Main Content ─── */}
        <TemplateMain className="flex-1 min-w-0 px-10 py-10">
          {/* Header — Name + Title */}
          <TemplateHeader className="mb-8">
            <TemplateH1
              className="text-[34px] font-extrabold uppercase tracking-[0.01em] leading-[1.05] break-words"
              style={{ color: primaryColor }}
            >
              {fullName || "Your Name"}
            </TemplateH1>
            {personalInfo.jobTitle && (
              <p className="text-[14px] text-gray-700 mt-1.5">
                {personalInfo.jobTitle}
              </p>
            )}
          </TemplateHeader>

          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-2">
                Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {renderSummaryText(personalInfo.summary)}
              </p>
            </section>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-3">
                Experience
              </h2>
              <div className="space-y-5">
                {sortedExperience.map((exp) => (
                  <article key={exp.id} style={{ breakInside: "avoid" }}>
                    <h3 className="font-bold text-gray-900 text-[13px]">
                      {exp.position}
                      {exp.company && (
                        <span className="font-bold">, {exp.company}</span>
                      )}
                      {exp.location && (
                        <span className="font-bold">, {exp.location}</span>
                      )}
                    </h3>
                    <p className="text-[12px] text-gray-600 mt-0.5">
                      {formatDate(exp.startDate)} —{" "}
                      {exp.current
                        ? "Present"
                        : formatDate(exp.endDate || "")}
                    </p>
                    {exp.description.length > 0 && (
                      <div className="mt-2 space-y-1 text-gray-700 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <div key={idx}>{renderFormattedText(item)}</div>
                            )
                        )}
                      </div>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="mt-1.5 space-y-1 text-gray-800 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <div key={idx} className="font-medium">{renderFormattedText(achievement)}</div>
                            )
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-3">
                Education
              </h2>
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <article key={edu.id} style={{ breakInside: "avoid" }}>
                    <h3 className="font-bold text-gray-900 text-[13px]">
                      {edu.degree}
                      {edu.field && (
                        <span className="font-bold">, {edu.field}</span>
                      )}
                      {edu.institution && (
                        <span className="font-bold">, {edu.institution}</span>
                      )}
                    </h3>
                    <p className="text-[12px] text-gray-600 mt-0.5">
                      {formatDate(edu.startDate)} —{" "}
                      {edu.current
                        ? "Present"
                        : formatDate(edu.endDate || "")}
                    </p>
                    {edu.gpa && (
                      <p className="text-[12px] text-gray-600 mt-0.5">
                        Grade: {edu.gpa}
                      </p>
                    )}
                    {edu.description && edu.description.length > 0 && (
                      <div className="mt-1.5 space-y-1 text-gray-700 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                        {edu.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <div key={idx}>{renderFormattedText(item)}</div>
                            )
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-3">
                Projects
              </h2>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <article key={project.id} style={{ breakInside: "avoid" }}>
                    <h3 className="font-bold text-gray-900 text-[13px]">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-gray-700 mt-1">{renderFormattedText(project.description)}</p>
                    )}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <p
                          className="text-[11px] mt-1 font-medium"
                          style={{ color: primaryColor }}
                        >
                          {project.technologies.join(" · ")}
                        </p>
                      )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-3">
                Certifications
              </h2>
              <ul className="space-y-2">
                {certifications.map((cert) => (
                  <li key={cert.id} className="flex items-start gap-2.5 pl-1">
                    <span
                      className="mt-[7px] w-[3px] h-[3px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-gray-800">
                      <span className="font-semibold">{cert.name}</span>
                      {cert.issuer && (
                        <span className="text-gray-600"> — {cert.issuer}</span>
                      )}
                      {cert.date && (
                        <span className="text-gray-500">
                          {" "}
                          ({formatDate(cert.date)})
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Extra-curricular */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-3">
                Activities
              </h2>
              <div className="space-y-3">
                {data.extraCurricular.map((activity) => (
                  <article key={activity.id}>
                    <h3 className="font-bold text-gray-900 text-[13px]">
                      {activity.title}
                      {activity.organization && (
                        <span className="font-normal text-gray-700">
                          {" "}
                          — {activity.organization}
                        </span>
                      )}
                    </h3>
                    {(activity.startDate || activity.endDate) && (
                      <p className="text-[12px] text-gray-600 mt-0.5">
                        {activity.startDate && formatDate(activity.startDate)} —{" "}
                        {activity.current
                          ? "Present"
                          : activity.endDate
                            ? formatDate(activity.endDate)
                            : ""}
                      </p>
                    )}
                    {activity.description &&
                      activity.description.length > 0 && (
                        <p className="text-gray-700 mt-1">
                          {renderFormattedText(activity.description[0])}
                        </p>
                      )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Custom Sections */}
          {data.customSections && data.customSections.length > 0 && (
            <section>
              {data.customSections.map((section) => (
                <div key={section.id} className="mb-5">
                  <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-3">
                    {section.title || "Custom Section"}
                  </h2>
                  <div className="space-y-2">
                    {(section.items || []).map((item) => (
                      <article key={item.id}>
                        <h3 className="font-bold text-gray-900 text-[13px]">
                          {item.title}
                        </h3>
                        {(item.date || item.location) && (
                          <p className="text-[12px] text-gray-600 mt-0.5">
                            {item.date}
                            {item.date && item.location ? " · " : ""}
                            {item.location}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-gray-700 mt-1">
                            {item.description}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

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
        </TemplateMain>
      </div>
    </div>
  );
}
