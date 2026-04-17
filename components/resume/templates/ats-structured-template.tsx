import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  groupSkillsByCategory,
  sortEducationByDate,
  sortWorkExperienceByDate,
} from "@/lib/utils";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { TemplateCustomization } from "../template-customizer";
import { formatEmailDisplay } from "@/lib/utils/contact-display";
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import { MapPin } from "lucide-react";

interface ATSStructuredTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Structured ATS
 * - Two-column grid with strict alignment
 * - Left column labels; right column content
 * - Thin dividers, muted color palette for parsing clarity
 */
export function ATSStructuredTemplate({
  data,
  customization,
}: ATSStructuredTemplateProps) {
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

  const primary = customization?.primaryColor || "#111827"; // slate-900
  const accent = customization?.accentColor || "#10b981"; // emerald-500
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineHeight = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing ?? 40;
  const fontFamily = getTemplateFontFamily(customization, "professional");

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
        <div className="flex items-baseline justify-between gap-4">
          <div className="space-y-1">
            <TemplateH1
              className="text-[34px] font-semibold tracking-tight"
              style={{ color: primary }}
            >
              {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
                "Your Name"}
            </TemplateH1>
            {personalInfo.jobTitle && (
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700">
                {personalInfo.jobTitle}
              </p>
            )}
          </div>
          <div className="text-sm text-slate-700 flex flex-wrap gap-3 justify-end max-w-full">
            {personalInfo.email && (
              <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
            )}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{personalInfo.location}</span>}
          </div>
        </div>
        {personalInfo.summary && (
          <p className="text-base text-slate-700 leading-relaxed">
            {renderSummaryText(personalInfo.summary)}
          </p>
        )}
      </TemplateHeader>

      <Divider accent={accent} />

      {customization?.sectionOrder === "skills-first" && (
        <SectionGrid
          title="Skills"
          accent={accent}
          content={
            skills.length > 0 ? (
              <div className="space-y-1 text-sm text-slate-800">
                {Object.entries(groupSkillsByCategory(skills)).map(([category, items]) => (
                  <div key={category}>
                    <span className="font-semibold">{category}: </span>
                    <span>{items.map((s) => s.name).join(", ")}</span>
                  </div>
                ))}
              </div>
            ) : null
          }
        />
      )}

      <SectionGrid
        title="Experience"
        accent={accent}
        content={
          experience.length > 0 ? (
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-600 uppercase tracking-[0.2em]">
                        {exp.company}
                      </p>
                      <h3 className="text-lg font-semibold leading-tight mt-1">{exp.position}</h3>
                      {exp.location && (
                        <p className="text-sm text-slate-600 mt-1">{exp.location}</p>
                      )}
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
          ) : null
        }
      />

      <SectionGrid
        title="Education"
        accent={accent}
        content={
          education.length > 0 ? (
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-600 uppercase tracking-[0.2em]">
                        {edu.institution}
                      </p>
                      <h3 className="text-base font-semibold leading-tight mt-1">
                        {[edu.degree, edu.field].filter(Boolean).join(" — ")}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      {formatDate(edu.startDate)} —{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </div>
                  </div>
                  {edu.gpa && (
                    <p className="text-xs text-slate-600">Grade: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          ) : null
        }
      />

      {customization?.sectionOrder !== "skills-first" && (
        <SectionGrid
          title="Skills"
          accent={accent}
          content={
            skills.length > 0 ? (
              <div className="space-y-1 text-sm text-slate-800">
                {Object.entries(groupSkillsByCategory(skills)).map(([category, items]) => (
                  <div key={category}>
                    <span className="font-semibold">{category}: </span>
                    <span>{items.map((s) => s.name).join(", ")}</span>
                  </div>
                ))}
              </div>
            ) : null
          }
        />
      )}

      <SectionGrid
        title="Projects"
        accent={accent}
        content={
          projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {project.name}
                    </p>
                    {(project.startDate || project.endDate) && (
                      <p className="text-xs text-slate-600 whitespace-nowrap">
                        {project.startDate ? formatDate(project.startDate) : ""}
                        {(project.startDate || project.endDate) && " — "}
                        {project.endDate ? formatDate(project.endDate) : "Present"}
                      </p>
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
                </div>
              ))}
            </div>
          ) : null
        }
      />

      <SectionGrid
        title="Certifications"
        accent={accent}
        content={
          certifications.length > 0 ? (
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
          ) : null
        }
      />

      <SectionGrid
        title="Activities"
        accent={accent}
        content={
          data.extraCurricular && data.extraCurricular.length > 0 ? (
            <div className="space-y-4">
              {data.extraCurricular.map((activity) => (
                <div key={activity.id} className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-600 uppercase tracking-[0.2em]">
                        {activity.organization}
                      </p>
                      <h3 className="text-base font-semibold leading-tight mt-1">
                        {activity.title}
                      </h3>
                      {activity.role && (
                        <p className="text-sm text-slate-600 mt-1">{activity.role}</p>
                      )}
                    </div>
                    {(activity.startDate || activity.endDate) && (
                      <div className="text-xs text-slate-600 whitespace-nowrap">
                        {formatDate(activity.startDate || "")} —{" "}
                        {activity.current
                          ? "Present"
                          : formatDate(activity.endDate || "")}
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
          ) : null
        }
      />

      <SectionGrid
        title="Languages"
        accent={accent}
        content={
          languages.length > 0 ? (
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
          ) : null
        }
      />

      <SectionGrid
        title="Interests"
        accent={accent}
        content={
          hobbies.length > 0 ? (
            <p className="text-sm text-slate-700">
              {hobbies.map((h) => h.name).join(" · ")}
            </p>
          ) : null
        }
      />

      {data.customSections?.map((section) => (
        <SectionGrid
          key={section.id}
          title={section.title || "Custom Section"}
          accent={accent}
          content={
            (section.items || []).length > 0 ? (
              <div className="space-y-2">
                {(section.items || []).map((item) => (
                  <div key={item.id} className="space-y-0.5">
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
                      <p className="text-sm text-slate-700">{renderFormattedText(item.description)}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : null
          }
        />
      ))}
    </div>
  );
}

function SectionGrid({
  title,
  accent,
  content,
}: {
  title: string;
  accent: string;
  content: React.ReactNode;
}) {
  if (!content) return null;
  return (
    <div className="flex gap-6 items-start w-full">
      <div className="w-1/4 shrink-0">
        <h2 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-slate-700 leading-relaxed break-words">
          {title}
        </h2>
        <div className="mt-2 h-[2px]" style={{ backgroundColor: `${accent}80` }} />
      </div>
      <div className="flex-1 min-w-0 space-y-3">{content}</div>
    </div>
  );
}

function Divider({ accent }: { accent: string }) {
  return (
    <div className="h-px w-full" style={{ backgroundColor: `${accent}40` }} />
  );
}
