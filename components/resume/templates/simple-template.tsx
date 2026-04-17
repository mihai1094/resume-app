import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
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

interface SimpleTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Simple Template - Pure Minimal ATS-Optimized
 *
 * A text-focused, single-column layout designed for maximum ATS compatibility.
 * Clean typography, simple horizontal rules, excellent readability.
 * No photos, no complex layouts - just content that gets parsed correctly.
 */
export function SimpleTemplate({ data, customization }: SimpleTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const hobbies = data.hobbies || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  const primaryColor = customization?.primaryColor || "#111827";
  const secondaryColor =
    customization?.secondaryColor || customization?.accentColor || "#4b5563";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineHeight = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing ?? 24;

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  return (
    <div
      className="w-full bg-white text-gray-900 min-h-[297mm] p-10"
      style={{
        fontFamily: fontFamily,
        fontSize: `${baseFontSize}px`,
        lineHeight: baseLineHeight,
      }}
    >
      {/* Header */}
      <TemplateHeader className="text-center mb-6">
        <TemplateH1
          className="text-3xl font-bold tracking-tight mb-2"
          style={{ color: primaryColor }}
        >
          {fullName || "Your Name"}
        </TemplateH1>

        {personalInfo.jobTitle && (
          <p className="text-base mb-3" style={{ color: secondaryColor }}>
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Info - Single line */}
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm max-w-full"
          style={{ color: secondaryColor }}
        >
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

      {/* Divider */}
      <hr className="border-t mb-6" style={{ borderColor: `${secondaryColor}55` }} />

      {/* Main Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing}px` }}>
        {/* Summary */}
        {personalInfo.summary && (
          <section>
            <SectionHeader title="Summary" color={primaryColor} />
            <p className="text-gray-700">{renderSummaryText(personalInfo.summary)}</p>
          </section>
        )}

        {/* Skills (when promoted) */}
        {customization?.sectionOrder === "skills-first" && skills.length > 0 && (
          <section>
            <SectionHeader title="Skills" color={primaryColor} />
            <div className="space-y-2">
              {Object.entries(
                skills.reduce((acc, skill) => {
                  if (!acc[skill.category]) acc[skill.category] = [];
                  acc[skill.category].push(skill);
                  return acc;
                }, {} as Record<string, typeof skills>)
              ).map(([category, categorySkills]) => (
                <div key={category} className="flex gap-2">
                  <span className="font-medium text-gray-900 min-w-[100px]">
                    {category}:
                  </span>
                  <span className="text-gray-700">
                    {categorySkills.map((s) => s.name).join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <SectionHeader title="Experience" color={primaryColor} />
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-tight">{exp.position}</h3>
                      <p className="text-gray-600">
                        {exp.company}
                        {exp.location && ` | ${exp.location}`}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </span>
                  </div>

                  {exp.description && exp.description.length > 0 && (
                    <div className="mt-2 space-y-1 text-gray-700 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                      {exp.description
                        .filter((d) => d.trim())
                        .map((d, idx) => (
                          <div key={idx}>{renderFormattedText(d)}</div>
                        ))}
                    </div>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="mt-2 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                      {exp.achievements
                        .filter((a) => a.trim())
                        .map((a, idx) => (
                          <div key={idx} className="font-medium text-gray-900">{renderFormattedText(a)}</div>
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
          <section>
            <SectionHeader title="Education" color={primaryColor} />
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-tight">
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                      </h3>
                      <p className="text-gray-600">{edu.institution}</p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </span>
                  </div>
                  {edu.gpa && (
                    <p className="text-sm text-gray-600">Grade: {edu.gpa}</p>
                  )}
                  {edu.description && edu.description.length > 0 && (
                    <div className="mt-2 space-y-1 text-gray-700 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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

        {/* Skills (default position, after Experience/Education) */}
        {customization?.sectionOrder !== "skills-first" && skills.length > 0 && (
          <section>
            <SectionHeader title="Skills" color={primaryColor} />
            <div className="space-y-2">
              {Object.entries(
                skills.reduce((acc, skill) => {
                  if (!acc[skill.category]) acc[skill.category] = [];
                  acc[skill.category].push(skill);
                  return acc;
                }, {} as Record<string, typeof skills>)
              ).map(([category, categorySkills]) => (
                <div key={category} className="flex gap-2">
                  <span className="font-medium text-gray-900 min-w-[100px]">
                    {category}:
                  </span>
                  <span className="text-gray-700">
                    {categorySkills.map((s) => s.name).join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <SectionHeader title="Projects" color={primaryColor} />
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    {project.url && (
                      <span className="text-sm text-gray-500 min-w-0 break-words" title={project.url}>
                        {formatWebsiteDisplay(project.url, 45)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{renderFormattedText(project.description)}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Technologies:</span>{" "}
                      {project.technologies.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <section>
            <SectionHeader title="Certifications" color={primaryColor} />
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-medium text-gray-900">{cert.name}</span>
                    {cert.issuer && (
                      <span className="text-gray-600"> - {cert.issuer}</span>
                    )}
                  </div>
                  {cert.date && (
                    <span className="text-sm text-gray-500">
                      {formatDate(cert.date)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Activities */}
        {data.extraCurricular && data.extraCurricular.length > 0 && (
          <section>
            <SectionHeader title="Activities" color={primaryColor} />
            <div className="space-y-3">
              {data.extraCurricular.map((activity) => (
                <div key={activity.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {activity.title}
                      </span>
                      {activity.organization && (
                        <span className="text-gray-700"> - {activity.organization}</span>
                      )}
                      {activity.role && (
                        <span className="text-gray-500"> ({activity.role})</span>
                      )}
                    </div>
                    {(activity.startDate || activity.endDate) && (
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(activity.startDate || "")} —{" "}
                        {activity.current ? "Present" : formatDate(activity.endDate || "")}
                      </span>
                    )}
                  </div>
                  {activity.description && activity.description.length > 0 && (
                    <div className="mt-1 space-y-0.5 text-gray-700 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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
            <SectionHeader title="Languages" color={primaryColor} />
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {languages.map((lang) => (
                <span key={lang.id} className="text-gray-700">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-gray-500"> ({lang.level})</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies / Interests */}
        {hobbies.length > 0 && (
          <section>
            <SectionHeader title="Interests" color={primaryColor} />
            <p className="text-gray-700">
              {hobbies.map((h) => h.name).join(" · ")}
            </p>
          </section>
        )}
      </div>

      {/* Empty State */}
      {!personalInfo.firstName &&
        experience.length === 0 &&
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

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <div className="mb-3">
      <h2
        className="text-sm font-bold uppercase tracking-widest mb-2"
        style={{ color }}
      >
        {title}
      </h2>
      <hr className="border-t border-gray-200" />
    </div>
  );
}
