import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";
import { TemplateMain, TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
} from "@/lib/utils/contact-display";

interface SydneyTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Sydney Template — Colored Header Band + Clean Single Column
 *
 * Inspired by the world's most downloaded resume format (Resume.io Stockholm/Sydney,
 * Zety Cascade). A full-width accent-colored header houses the candidate's name,
 * title, and contact row in white text, with an optional circular photo on the right.
 * Below, a clean single-column body uses the accent color for section labels with a
 * thin rule underneath — readable by any ATS and instantly visually distinctive.
 */
export function SydneyTemplate({ data, customization }: SydneyTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const primaryColor = customization?.primaryColor || "#1e40af";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing ?? 20;

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  const certifications = data.certifications?.filter((c) => c.type !== "course") || [];
  const courses = [
    ...(data.certifications?.filter((c) => c.type === "course") || []).map((c) => ({
      id: c.id,
      name: c.name,
      institution: c.issuer,
    })),
    ...(data.courses || []).map((c) => ({
      id: c.id,
      name: c.name,
      institution: c.institution,
    })),
  ];

  const contactItems = [
    personalInfo.email && formatEmailDisplay(personalInfo.email, 32),
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin && formatLinkedinDisplay(personalInfo.linkedin, 28),
    personalInfo.github && formatGithubDisplay(personalInfo.github, 28),
    personalInfo.website && formatWebsiteDisplay(personalInfo.website, 28),
  ].filter(Boolean) as string[];

  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm] flex flex-col"
      style={{ fontFamily, ...baseTextStyle }}
    >
      {/* ─── Colored Header Band ─── */}
      <TemplateHeader
        className="px-10 pt-8 pb-7"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-start justify-between gap-6">
          {/* Left: Name + Title + Contact */}
          <div className="flex-1 min-w-0">
            <TemplateH1 className="text-[34px] font-bold tracking-tight leading-none text-white break-words">
              {fullName || "Your Name"}
            </TemplateH1>

            {personalInfo.jobTitle && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] mt-2 text-white/75">
                {personalInfo.jobTitle}
              </p>
            )}

            {/* Contact row — icon-free, pipe-separated */}
            {contactItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4">
                {contactItems.map((item, i) => (
                  <span key={i} className="flex items-center gap-3">
                    <span className="text-[10.5px] text-white/80 min-w-0 break-words">{item}</span>
                    {i < contactItems.length - 1 && (
                      <span className="text-white/35 text-[10px]">·</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Photo */}
          {personalInfo.photo && (
            <div className="flex-shrink-0 mt-1">
              <ProfilePhoto
                photo={personalInfo.photo}
                firstName={personalInfo.firstName}
                lastName={personalInfo.lastName}
                size={82}
                shape="circular"
                className="border-[3px] border-white/30"
              />
            </div>
          )}
        </div>
      </TemplateHeader>

      {/* ─── Body ─── */}
      <TemplateMain
        className="flex-1 px-10 py-8"
        style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing}px` }}
      >
        {/* Summary */}
        {personalInfo.summary && (
          <section>
            <SectionHeading label="Profile" color={primaryColor} />
            <p className="text-gray-700 leading-relaxed mt-2">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {sortedExperience.length > 0 && (
          <section>
            <SectionHeading label="Experience" color={primaryColor} />
            <div className="mt-3 space-y-4">
              {sortedExperience.map((exp) => (
                <article key={exp.id} style={{ breakInside: "avoid" }}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-[13px]">{exp.company}</h3>
                      <p className="text-gray-600 text-[12px]">
                        {exp.position}
                        {exp.location && (
                          <span className="text-gray-400"> · {exp.location}</span>
                        )}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-400 flex-shrink-0 text-right">
                      {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </p>
                  </div>

                  {exp.description.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {exp.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="flex items-start gap-2 text-[11.5px] text-gray-700">
                              <span
                                className="mt-[6px] w-[5px] h-[5px] rounded-full flex-shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              />
                              <span>{item}</span>
                            </li>
                          )
                      )}
                    </ul>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="mt-1 space-y-1">
                      {exp.achievements.map(
                        (ach, idx) =>
                          ach.trim() && (
                            <li key={idx} className="flex items-start gap-2 text-[11.5px] text-gray-800 font-medium">
                              <span
                                className="mt-[6px] w-[5px] h-[5px] rounded-full flex-shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              />
                              <span>{ach}</span>
                            </li>
                          )
                      )}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {sortedEducation.length > 0 && (
          <section>
            <SectionHeading label="Education" color={primaryColor} />
            <div className="mt-3 space-y-3">
              {sortedEducation.map((edu) => (
                <article key={edu.id} style={{ breakInside: "avoid" }}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-[13px]">{edu.institution}</h3>
                      <p className="text-gray-600 text-[12px]">
                        {edu.degree}
                        {edu.field && <span className="text-gray-500"> — {edu.field}</span>}
                      </p>
                      {edu.gpa && (
                        <p className="text-[11px] text-gray-400 mt-0.5">Grade: {edu.gpa}</p>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 flex-shrink-0 text-right">
                      {formatDate(edu.startDate)} – {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </p>
                  </div>
                  {edu.description && edu.description.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {edu.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="flex items-start gap-2 text-[11.5px] text-gray-700">
                              <span
                                className="mt-[6px] w-[5px] h-[5px] rounded-full flex-shrink-0"
                                style={{ backgroundColor: primaryColor }}
                              />
                              <span>{item}</span>
                            </li>
                          )
                      )}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <SectionHeading label="Skills" color={primaryColor} />
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="text-[11px] font-medium px-3 py-1 rounded-sm"
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                  }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <section>
            <SectionHeading label="Languages" color={primaryColor} />
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-gray-900">{lang.name}</span>
                  <span className="text-[11px] text-gray-400 capitalize">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section>
            <SectionHeading label="Projects" color={primaryColor} />
            <div className="mt-3 space-y-3">
              {data.projects.map((project) => (
                <article key={project.id} style={{ breakInside: "avoid" }}>
                  <div className="flex justify-between items-baseline gap-4">
                    <h3 className="font-bold text-gray-900 text-[12px]">{project.name}</h3>
                    {project.url && (
                      <span className="text-[10.5px] text-gray-400 min-w-0 break-words">
                        {formatWebsiteDisplay(project.url, 40)}
                      </span>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-[11.5px] text-gray-700 mt-0.5">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <p className="text-[10.5px] text-gray-400 mt-1">
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
          <section>
            <SectionHeading label="Certifications" color={primaryColor} />
            <div className="mt-3 space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start gap-2">
                  <span
                    className="mt-[5px] w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-[11.5px] text-gray-800">
                    <span className="font-semibold">{cert.name}</span>
                    {cert.issuer && <span className="text-gray-500"> — {cert.issuer}</span>}
                    {cert.date && <span className="text-gray-400"> ({formatDate(cert.date)})</span>}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Courses */}
        {courses.length > 0 && (
          <section>
            <SectionHeading label="Training & Courses" color={primaryColor} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              {courses.map((course) => (
                <div key={course.id}>
                  <p className="text-[11.5px] font-semibold text-gray-900">{course.name}</p>
                  {course.institution && (
                    <p className="text-[11px] text-gray-500 mt-0.5">{course.institution}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interests */}
        {data.hobbies && data.hobbies.length > 0 && (
          <section>
            <SectionHeading label="Interests" color={primaryColor} />
            <p className="mt-3 text-gray-600 text-[11.5px] leading-relaxed">
              {data.hobbies.map((h) => h.name).join(" · ")}
            </p>
          </section>
        )}

        {/* Extra-curricular */}
        {data.extraCurricular && data.extraCurricular.length > 0 && (
          <section>
            <SectionHeading label="Activities" color={primaryColor} />
            <div className="mt-3 space-y-2.5">
              {data.extraCurricular.map((act) => (
                <div key={act.id}>
                  <p className="text-[12px] font-semibold text-gray-900">
                    {act.title}
                    {act.organization && (
                      <span className="font-normal text-gray-500"> — {act.organization}</span>
                    )}
                  </p>
                  {act.description && act.description[0] && (
                    <p className="text-[11px] text-gray-600 mt-0.5">{act.description[0]}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {data.customSections && data.customSections.length > 0 && (
          <>
            {data.customSections.map((section) => (
              <section key={section.id}>
                <SectionHeading label={section.title || "Other"} color={primaryColor} />
                <div className="mt-3 space-y-2">
                  {(section.items || []).map((item) => (
                    <article key={item.id} style={{ breakInside: "avoid" }}>
                      <h3 className="text-[12px] font-bold text-gray-900">{item.title}</h3>
                      {(item.date || item.location) && (
                        <p className="text-[10.5px] text-gray-400 mt-0.5">
                          {item.date}
                          {item.date && item.location ? " · " : ""}
                          {item.location}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[11.5px] text-gray-700 mt-0.5">{item.description}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </>
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
  );
}

function SectionHeading({ label, color }: { label: string; color: string }) {
  return (
    <div>
      <h2
        className="text-[10.5px] font-bold uppercase tracking-[0.14em]"
        style={{ color }}
      >
        {label}
      </h2>
      <div className="mt-1 h-[1.5px] w-full" style={{ backgroundColor: `${color}20` }} />
    </div>
  );
}
