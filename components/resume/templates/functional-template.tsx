import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
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

interface FunctionalTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Functional Template - Skills-First Format
 *
 * Single-column layout optimized for career changers.
 * - Skills section is prominent and appears first (after summary)
 * - Groups skills by category with level indicators
 * - Work experience is condensed (titles/dates, minimal detail)
 * - Good ATS compatibility
 * - No photos
 */
export function FunctionalTemplate({
  data,
  customization,
}: FunctionalTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const hobbies = data.hobbies || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  const primaryColor = customization?.primaryColor || "#1e3a5f";
  const accentColor = customization?.accentColor || "#3b82f6";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineHeight = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 24;

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineHeight,
    fontFamily: fontFamily,
  };

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      const category = skill.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, typeof skills>
  );



  const fullName =
    [personalInfo.firstName, personalInfo.lastName]
      .filter(Boolean)
      .join(" ") || "Your Name";

  return (
    <div
      className="w-full bg-white text-slate-800 min-h-[297mm] p-10"
      style={baseTextStyle}
    >
      {/* Header */}
      <TemplateHeader className="text-center pb-6 mb-6 border-b-2" style={{ borderColor: primaryColor }}>
        <TemplateH1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: primaryColor }}
        >
          {fullName}
        </TemplateH1>
        {personalInfo.jobTitle && (
          <p className="text-lg text-slate-600 mb-3">{personalInfo.jobTitle}</p>
        )}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 max-w-full">
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
            <a className="min-w-0 break-words" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">
              {formatGithubDisplay(personalInfo.github, 45)}
            </a>
          )}
        </div>
      </TemplateHeader>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Professional Summary" primaryColor={primaryColor} />
          <p className="text-sm text-slate-700 leading-relaxed">
            {renderSummaryText(personalInfo.summary)}
          </p>
        </section>
      )}

      {/* Skills - PROMINENT, FIRST after summary */}
      {Object.keys(skillsByCategory).length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Core Competencies" primaryColor={primaryColor} />
          <div className="space-y-4">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h3
                  className="text-xs font-bold uppercase tracking-wider mb-2 pl-2"
                  style={{ color: primaryColor, borderLeft: `3px solid ${accentColor}` }}
                >
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="text-sm px-3 py-1 rounded-full border"
                      style={{
                        borderColor: `${accentColor}30`,
                        backgroundColor: `${accentColor}08`,
                        color: primaryColor,
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience - Condensed */}
      {experience.length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Professional Experience" primaryColor={primaryColor} />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="pb-3 border-b border-slate-100 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{exp.position}</h3>
                    <p className="text-sm text-slate-600">
                      {exp.company}
                      {exp.location && ` | ${exp.location}`}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </span>
                </div>
                {/* Show only top 2-3 bullet points for condensed view */}
                {exp.description && exp.description.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm text-slate-600 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {exp.description
                      .filter((d) => d.trim())
                      .slice(0, 3)
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
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Education" primaryColor={primaryColor} />
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-900">
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </p>
                  <p className="text-sm text-slate-600">{edu.institution}</p>
                  {edu.gpa && (
                    <p className="text-xs text-slate-500 mt-1">Grade: {edu.gpa}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Projects" primaryColor={primaryColor} />
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold text-slate-900">{project.name}</h3>
                <p className="text-sm text-slate-600">{renderFormattedText(project.description)}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${accentColor}15`,
                          color: accentColor,
                        }}
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
      {certifications.length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Certifications" primaryColor={primaryColor} />
          <div className="flex flex-wrap gap-3">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex gap-2 text-sm flex-1 min-w-[200px]">
                <span style={{ color: accentColor }}>●</span>
                <div>
                  <p className="font-medium text-slate-900">{cert.name}</p>
                  {cert.issuer && (
                    <p className="text-xs text-slate-500">
                      {cert.issuer}
                      {cert.date && ` • ${formatDate(cert.date)}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activities */}
      {data.extraCurricular && data.extraCurricular.length > 0 && (
        <section style={{ marginBottom: `${sectionSpacing}px` }}>
          <SectionTitle title="Activities" primaryColor={primaryColor} />
          <div className="space-y-4">
            {data.extraCurricular.map((activity) => (
              <div key={activity.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                    <p className="text-sm" style={{ color: primaryColor }}>
                      {activity.organization}
                      {activity.role && <span className="text-slate-500"> · {activity.role}</span>}
                    </p>
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                      {formatDate(activity.startDate || "")} —{" "}
                      {activity.current ? "Present" : formatDate(activity.endDate || "")}
                    </span>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <div className="mt-1 space-y-0.5 text-sm text-slate-600 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {activity.description.filter((d) => d.trim()).map((item, idx) => (
                      <div key={idx}>{renderFormattedText(item)}</div>
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
        <section>
          <SectionTitle title="Languages" primaryColor={primaryColor} />
          <div className="flex flex-wrap gap-4">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="px-3 py-1 rounded-md text-sm"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                }}
              >
                {lang.name}
                <span className="text-slate-500"> — {lang.level}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hobbies / Interests */}
      {hobbies.length > 0 && (
        <section>
          <SectionTitle title="Interests" primaryColor={primaryColor} />
          <p className="text-sm text-slate-700">
            {hobbies.map((h) => h.name).join(" · ")}
          </p>
        </section>
      )}
    </div>
  );
}

function SectionTitle({
  title,
  primaryColor,
}: {
  title: string;
  primaryColor: string;
}) {
  return (
    <div className="mb-4 pb-2 border-b" style={{ borderColor: `${primaryColor}30` }}>
      <h2
        className="text-sm font-bold uppercase tracking-[0.2em]"
        style={{ color: primaryColor }}
      >
        {title}
      </h2>
    </div>
  );
}

export default FunctionalTemplate;
