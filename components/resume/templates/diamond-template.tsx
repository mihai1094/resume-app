import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate, groupSkillsByCategory, getCertifications } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

interface DiamondTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Diamond Template - Clean ATS-Optimized Professional Layout
 *
 * Single-column layout with diamond-shaped accent elements on section headers.
 * Designed for students, interns, accounting, and legal professionals.
 * Excellent ATS compatibility with clear hierarchy and professional appearance.
 */

// Diamond accent component for section headers
const DiamondIcon = ({ color }: { color: string }) => (
  <span
    className="inline-block w-2.5 h-2.5 rotate-45"
    style={{ backgroundColor: color }}
  />
);

export function DiamondTemplate({ data, customization }: DiamondTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const skillsByCategory = groupSkillsByCategory(skills);

  const primaryColor = customization?.primaryColor || "#1e40af";
  const secondaryColor =
    customization?.secondaryColor || customization?.accentColor || "#4b5563";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 20;

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm]"
      style={{ fontFamily: fontFamily }}
    >
      <div className="p-12" style={baseTextStyle}>
        {/* Header */}
        <TemplateHeader className="text-center border-b-2 pb-6 mb-6" style={{ borderColor: primaryColor }}>
          <TemplateH1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
          </TemplateH1>
          {personalInfo.jobTitle && (
            <p
              className="text-base mt-1 font-medium"
              style={{ color: secondaryColor }}
            >
              {personalInfo.jobTitle}
            </p>
          )}

          {/* Contact info - single row */}
          <div
            className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-4 text-sm"
            style={{ color: secondaryColor }}
          >
            {personalInfo.email && (
              <span className="flex items-center gap-1.5 min-w-0 max-w-full">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
              </span>
            )}
            {personalInfo.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personalInfo.location}
              </span>
            )}
            {personalInfo.website && (
              <span className="flex items-center gap-1.5 min-w-0 max-w-full">
                <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                <a className="min-w-0 break-words" title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">{formatWebsiteDisplay(personalInfo.website, 45)}</a>
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="flex items-center gap-1.5 min-w-0 max-w-full">
                <Linkedin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                <a className="min-w-0 break-words" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">{formatLinkedinDisplay(personalInfo.linkedin, 45)}</a>
              </span>
            )}
            {personalInfo.github && (
              <span className="flex items-center gap-1.5 min-w-0 max-w-full">
                <Github className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
                <a className="min-w-0 break-words" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">{formatGithubDisplay(personalInfo.github, 45)}</a>
              </span>
            )}
          </div>
        </TemplateHeader>

        {/* Summary */}
        {personalInfo.summary && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Professional Summary</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              {renderSummaryText(personalInfo.summary)}
            </p>
          </section>
        )}

        {/* Experience */}
        {sortedExperience.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Professional Experience</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <div className="space-y-5">
              {sortedExperience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-sm text-gray-600">
                        {exp.company}
                        {exp.location && <span> | {exp.location}</span>}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </span>
                  </div>
                  {exp.description.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm text-gray-700 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                      {exp.description.map((item, idx) => item.trim() && (
                        <div key={idx}>
                          {renderFormattedText(item)}
                        </div>
                      ))}
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
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Education</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <div className="space-y-4">
              {sortedEducation.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {edu.degree}{edu.field && ` in ${edu.field}`}
                    </p>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    {edu.gpa && <p className="text-xs text-gray-500">Grade: {edu.gpa}</p>}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {Object.keys(skillsByCategory).length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Skills</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <div className="space-y-2">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="flex items-start gap-2">
                  <span
                    className="text-xs font-semibold uppercase tracking-wide min-w-[100px]"
                    style={{ color: primaryColor }}
                  >
                    {category}:
                  </span>
                  <span className="text-sm text-gray-700">
                    {categorySkills.map((skill) => skill.name).join(" | ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-4">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Projects</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    {project.url && (
                      <span className="text-xs text-gray-500 min-w-0 break-words" title={project.url}>
                        {formatWebsiteDisplay(project.url, 45)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{renderFormattedText(project.description)}</p>
                  {project.technologies?.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
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
        {getCertifications(data).length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Certifications</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <div className="space-y-2">
              {getCertifications(data).map((cert) => (
                <div key={cert.id} className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <span style={{ color: primaryColor }}>&#9670;</span>
                    <div>
                      <span className="text-sm font-medium text-gray-900">{cert.name}</span>
                      {cert.issuer && (
                        <span className="text-sm text-gray-600"> - {cert.issuer}</span>
                      )}
                    </div>
                  </div>
                  {cert.date && (
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
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
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Activities</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <div className="space-y-3">
              {data.extraCurricular.map((activity) => (
                <div key={activity.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {activity.title}
                      </h3>
                      <p className="text-sm" style={{ color: secondaryColor }}>
                        {activity.organization}
                        {activity.role && <span className="text-gray-500"> — {activity.role}</span>}
                      </p>
                    </div>
                    {(activity.startDate || activity.endDate) && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(activity.startDate || "")} —{" "}
                        {activity.current ? "Present" : formatDate(activity.endDate || "")}
                      </span>
                    )}
                  </div>
                  {activity.description && activity.description.length > 0 && (
                    <div className="mt-1 space-y-0.5 text-sm text-gray-600 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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
        {data.languages && data.languages.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Languages</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {data.languages.map((lang) => (
                <span key={lang.id} className="text-sm text-gray-700">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-gray-500"> ({lang.level})</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Hobbies / Interests */}
        {data.hobbies && data.hobbies.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
              <DiamondIcon color={primaryColor} />
              <span style={{ color: primaryColor }}>Interests</span>
              <DiamondIcon color={primaryColor} />
            </h2>
            <p className="text-sm text-gray-700">
              {data.hobbies.map((h) => h.name).join(" · ")}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export default DiamondTemplate;
