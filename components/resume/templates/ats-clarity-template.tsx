import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortEducationByDate,
  sortWorkExperienceByDate,
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

interface ATSClarityTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Clarity ATS
 * - Single-column, wide gutters, bold section headers
 * - Ample whitespace, left-aligned labels, simple separators
 * - Designed for ATS parsing with clear hierarchy
 */
export function ATSClarityTemplate({
  data,
  customization,
}: ATSClarityTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const hobbies = data.hobbies || [];
  const projects = data.projects || [];
  const directCertifications =
    data.certifications?.filter((cert) => cert.type !== "course") || [];
  const coursesFromCertifications =
    data.certifications?.filter((cert) => cert.type === "course") || [];
  const legacyCourses = data.courses || [];
  const certifications = [
    ...directCertifications,
    ...coursesFromCertifications.map((cert) => ({
      ...cert,
      issuer: cert.issuer || "",
    })),
    ...legacyCourses.map((course) => ({
      id: course.id,
      name: course.name,
      issuer: course.institution || "",
      date: course.date || "",
      type: "course" as const,
      credentialId: course.credentialId,
      url: course.url,
    })),
  ];

  const primary = customization?.primaryColor || "#0f172a"; // slate-900
  const accent = customization?.accentColor || "#0ea5e9"; // sky-500
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineHeight = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing ?? 40;
  const fontFamily =
    customization?.fontFamily === "serif"
      ? "'Georgia', serif"
      : "var(--font-sans), 'Helvetica Neue', Arial, sans-serif";

  return (
    <div
      className="w-full bg-white text-slate-900 min-h-[297mm] p-12"
      style={{
        fontFamily,
        fontSize: `${baseFontSize}px`,
        lineHeight: baseLineHeight,
        display: "flex",
        flexDirection: "column",
        gap: `${sectionSpacing}px`,
      }}
    >
      {/* Header */}
      <TemplateHeader className="space-y-3">
        <TemplateH1
          className="text-4xl font-semibold tracking-tight"
          style={{ color: primary }}
        >
          {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
            "Your Name"}
        </TemplateH1>
        {personalInfo.jobTitle && (
          <p
            className="text-sm font-semibold uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            {personalInfo.jobTitle}
          </p>
        )}
        {personalInfo.summary && (
          <p className="text-base text-slate-700 leading-relaxed">
            {renderSummaryText(personalInfo.summary)}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-slate-700 max-w-full">
          {personalInfo.email && (
            <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
          )}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{personalInfo.location}</span>}
          {personalInfo.website && (
            <a className="min-w-0 break-words" title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">{formatWebsiteDisplay(personalInfo.website, 45)}</a>
          )}
          {personalInfo.linkedin && (
            <a className="min-w-0 break-words" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
              {formatLinkedinDisplay(personalInfo.linkedin, 45)}
            </a>
          )}
          {personalInfo.github && (
            <a className="min-w-0 break-words" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">{formatGithubDisplay(personalInfo.github, 45)}</a>
          )}
        </div>
      </TemplateHeader>

      {/* Experience */}
      {experience.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="Experience" accent={accent} />
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                    <p className="text-sm text-slate-700">
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <div className="text-sm text-slate-700 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {exp.description
                      .filter((d) => d.trim())
                      .map((d, idx) => (
                        <div key={idx}>{renderFormattedText(d)}</div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="Education" accent={accent} />
          <div className="space-y-5">
            {education.map((edu) => (
              <div key={edu.id} className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{edu.institution}</h3>
                    <p className="text-sm text-slate-700">
                      {[edu.degree, edu.field].filter(Boolean).join(" — ")}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600 whitespace-nowrap">
                    {formatDate(edu.startDate)} —{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
                {edu.gpa && (
                  <p className="text-xs text-slate-600">Grade: {edu.gpa}</p>
                )}
                {edu.description && edu.description.length > 0 && (
                  <div className="text-sm text-slate-700 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {edu.description
                      .filter((d) => d.trim())
                      .map((d, idx) => (
                        <div key={idx}>{renderFormattedText(d)}</div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Skills" accent={accent} />
          <div className="flex flex-wrap gap-2 text-sm text-slate-800">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="Projects" accent={accent} />
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {project.name}
                  </h3>
                  {(project.startDate || project.endDate) && (
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      {project.startDate ? formatDate(project.startDate) : ""}
                      {(project.startDate || project.endDate) && " — "}
                      {project.endDate ? formatDate(project.endDate) : "Present"}
                    </div>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-slate-700">{renderFormattedText(project.description)}</p>
                )}
                {project.technologies?.length > 0 && (
                  <p className="text-xs text-slate-600">
                    Technologies: {project.technologies.join(", ")}
                  </p>
                )}
                {(project.url || project.github) && (
                  <p className="text-xs text-slate-600 break-words">
                    {[project.url, project.github]
                      .filter(Boolean)
                      .map((link) => formatWebsiteDisplay(String(link), 45))
                      .join(" • ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Certifications" accent={accent} />
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="text-sm text-slate-800">
                <span className="font-medium">{cert.name}</span>
                {cert.issuer && (
                  <span className="text-slate-600"> — {cert.issuer}</span>
                )}
                {cert.date && (
                  <span className="text-xs text-slate-500">
                    {" "}
                    ({formatDate(cert.date)})
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activities */}
      {data.extraCurricular && data.extraCurricular.length > 0 && (
        <section className="space-y-4">
          <SectionTitle title="Activities" accent={accent} />
          <div className="space-y-4">
            {data.extraCurricular.map((activity) => (
              <div key={activity.id} className="space-y-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {activity.title}
                      {activity.organization && (
                        <span className="font-normal text-slate-700">
                          {" "}
                          — {activity.organization}
                        </span>
                      )}
                    </h3>
                    {activity.role && (
                      <p className="text-xs text-slate-600">{activity.role}</p>
                    )}
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      {activity.startDate ? formatDate(activity.startDate) : ""}
                      {(activity.startDate || activity.endDate) && " — "}
                      {activity.current
                        ? "Present"
                        : activity.endDate
                        ? formatDate(activity.endDate)
                        : ""}
                    </div>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <div className="text-sm text-slate-700 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {activity.description
                      .filter((d) => d.trim())
                      .map((d, idx) => (
                        <div key={idx}>{renderFormattedText(d)}</div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Languages" accent={accent} />
          <div className="flex flex-wrap gap-3 text-sm text-slate-800">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="px-3 py-1 rounded-md bg-slate-50 border border-slate-200"
              >
                {lang.name} — {lang.level}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hobbies / Interests */}
      {hobbies.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Interests" accent={accent} />
          <p className="text-sm text-slate-700">
            {hobbies.map((h) => h.name).join(" · ")}
          </p>
        </section>
      )}

      {/* Custom Sections */}
      {data.customSections && data.customSections.length > 0 && (
        <>
          {data.customSections.map((section) => (
            <section key={section.id} className="space-y-3">
              <SectionTitle
                title={section.title || "Custom Section"}
                accent={accent}
              />
              <div className="space-y-3">
                {(section.items || []).map((item) => (
                  <div key={item.id} className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>
                    {(item.date || item.location) && (
                      <p className="text-xs text-slate-600">
                        {item.date}
                        {item.date && item.location ? " • " : ""}
                        {item.location}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-slate-700">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="pb-2 mb-1 border-b-2" style={{ borderColor: accent }}>
      <h2 className="text-sm font-bold tracking-[0.15em] uppercase" style={{ color: accent }}>
        {title}
      </h2>
    </div>
  );
}
