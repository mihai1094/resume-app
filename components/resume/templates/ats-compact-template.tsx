import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortEducationByDate,
  sortWorkExperienceByDate,
} from "@/lib/utils";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { TemplateCustomization } from "../template-customizer";
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";
import { MapPin } from "lucide-react";

interface ATSCompactTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Compact ATS
 * - Condensed typography, reduced vertical rhythm
 * - Focus on quick scanning for early-career roles
 * - Tight bullet spacing and concise headers
 */
export function ATSCompactTemplate({
  data,
  customization,
}: ATSCompactTemplateProps) {
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
  const accent = customization?.accentColor || "#6366f1"; // indigo-500
  const baseFontSize = customization?.fontSize ?? 11.5;
  const baseLineHeight = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing ?? 24;
  const fontFamily = getTemplateFontFamily(customization, "professional");

  return (
    <div
      className="w-full bg-white text-slate-900 min-h-[297mm] p-10"
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
      <TemplateHeader className="space-y-2">
        <TemplateH1
          className="text-[30px] font-semibold tracking-tight"
          style={{ color: primary }}
        >
          {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
            "Your Name"}
        </TemplateH1>
        {personalInfo.jobTitle && (
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: primary }}
          >
            {personalInfo.jobTitle}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-slate-700 max-w-full">
          {personalInfo.email && (
            <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
          )}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{personalInfo.location}</span>}
          {personalInfo.linkedin && (
            <a className="min-w-0 break-words" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
              {formatLinkedinDisplay(personalInfo.linkedin, 45)}
            </a>
          )}
        </div>
      </TemplateHeader>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="text-sm text-slate-700 leading-relaxed">
          {renderSummaryText(personalInfo.summary)}
        </section>
      )}

      <Divider accent={accent} />

      {/* Skills (when promoted above Experience) */}
      {customization?.sectionOrder === "skills-first" && skills.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Skills" accent={accent} />
          {(() => {
            const grouped = skills.reduce((acc, s) => {
              if (!acc[s.category]) acc[s.category] = [];
              acc[s.category].push(s);
              return acc;
            }, {} as Record<string, typeof skills>);
            return (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {Object.entries(grouped).map(([cat, catSkills]) => (
                  <div key={cat}>
                    <span className="font-semibold text-slate-900">{cat}: </span>
                    <span className="text-slate-700">{catSkills.map(s => s.name).join(", ")}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Experience" accent={accent} />
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">{exp.position}</h3>
                    <p className="text-xs text-slate-700">
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDate(exp.startDate)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <div className="text-xs text-slate-700 space-y-0.5 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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
        <section className="space-y-2">
          <SectionTitle title="Education" accent={accent} />
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">
                      {[edu.degree, edu.field].filter(Boolean).join(" — ")}
                    </h3>
                    <p className="text-xs text-slate-700">{edu.institution}</p>
                  </div>
                  <div className="text-[11px] text-slate-600 whitespace-nowrap">
                    {formatDate(edu.startDate)} —{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
                {edu.gpa && <p className="text-[11px] text-slate-600">Grade: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills - grouped by category in columns (default position) */}
      {customization?.sectionOrder !== "skills-first" && skills.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Skills" accent={accent} />
          {(() => {
            const grouped = skills.reduce((acc, s) => {
              if (!acc[s.category]) acc[s.category] = [];
              acc[s.category].push(s);
              return acc;
            }, {} as Record<string, typeof skills>);
            return (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {Object.entries(grouped).map(([cat, catSkills]) => (
                  <div key={cat}>
                    <span className="font-semibold text-slate-900">{cat}: </span>
                    <span className="text-slate-700">{catSkills.map(s => s.name).join(", ")}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Projects" accent={accent} />
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-slate-900">
                    {project.name}
                  </p>
                  {(project.startDate || project.endDate) && (
                    <p className="text-[10px] text-slate-500 whitespace-nowrap">
                      {project.startDate ? formatDate(project.startDate) : ""}
                      {(project.startDate || project.endDate) && " — "}
                      {project.endDate ? formatDate(project.endDate) : "Present"}
                    </p>
                  )}
                </div>
                {project.description && (
                  <p className="text-xs text-slate-700">{renderFormattedText(project.description)}</p>
                )}
                {project.technologies?.length > 0 && (
                  <p className="text-[11px] text-slate-600">
                    Tech: {project.technologies.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Certifications" accent={accent} />
          <div className="space-y-1">
            {certifications.map((cert) => (
              <div key={cert.id} className="text-xs text-slate-800">
                <span className="font-medium">{cert.name}</span>
                {cert.issuer && (
                  <span className="text-slate-600"> — {cert.issuer}</span>
                )}
                {cert.date && (
                  <span className="text-[10px] text-slate-500">
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
        <section className="space-y-2">
          <SectionTitle title="Activities" accent={accent} />
          <div className="space-y-2">
            {data.extraCurricular.map((activity) => (
              <div key={activity.id} className="space-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-semibold text-slate-900">
                      {activity.title}
                      {activity.organization && (
                        <span className="font-normal text-slate-700">
                          {" "}
                          — {activity.organization}
                        </span>
                      )}
                    </h3>
                    {activity.role && (
                      <p className="text-[11px] text-slate-600">{activity.role}</p>
                    )}
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <div className="text-[11px] text-slate-600 whitespace-nowrap">
                      {formatDate(activity.startDate || "")} —{" "}
                      {activity.current
                        ? "Present"
                        : formatDate(activity.endDate || "")}
                    </div>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <div className="text-xs text-slate-700 space-y-0.5 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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
        <section className="space-y-2">
          <SectionTitle title="Languages" accent={accent} />
          <div className="flex flex-wrap gap-2 text-xs text-slate-800">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200"
              >
                {lang.name} — {lang.level}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hobbies / Interests */}
      {hobbies.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Interests" accent={accent} />
          <p className="text-xs text-slate-700">
            {hobbies.map((h) => h.name).join(" · ")}
          </p>
        </section>
      )}

      {/* Custom Sections */}
      {data.customSections && data.customSections.length > 0 && (
        <>
          {data.customSections.map((section) => (
            <section key={section.id} className="space-y-2">
              <SectionTitle
                title={section.title || "Custom Section"}
                accent={accent}
              />
              <div className="space-y-2">
                {(section.items || []).map((item) => (
                  <div key={item.id} className="space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900">
                      {item.title}
                    </p>
                    {(item.date || item.location) && (
                      <p className="text-[10px] text-slate-500">
                        {item.date}
                        {item.date && item.location ? " • " : ""}
                        {item.location}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-slate-700">{renderFormattedText(item.description)}</p>
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
    <div className="flex items-baseline gap-2 pb-1 border-b border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
      <h2 className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-900">
        {title}
      </h2>
    </div>
  );
}

function Divider({ accent }: { accent: string }) {
  return (
    <div className="h-px w-full" style={{ backgroundColor: `${accent}40` }} />
  );
}
