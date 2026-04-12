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
} from "@/lib/utils/contact-display";

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
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  const primaryColor = customization?.primaryColor || "#111827";
  const secondaryColor =
    customization?.accentColor || customization?.secondaryColor || "#4b5563";
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
            <span className="min-w-0 break-words" title={personalInfo.email}>{formatEmailDisplay(personalInfo.email, 45)}</span>
          )}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.website && (
            <span className="min-w-0 break-words" title={personalInfo.website}>{formatWebsiteDisplay(personalInfo.website, 45)}</span>
          )}
          {personalInfo.linkedin && (
            <span className="min-w-0 break-words" title={personalInfo.linkedin}>
              {formatLinkedinDisplay(personalInfo.linkedin, 45)}
            </span>
          )}
          {personalInfo.github && (
            <span className="min-w-0 break-words" title={personalInfo.github}>
              {formatGithubDisplay(personalInfo.github, 45)}
            </span>
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
            <p className="text-gray-700">{personalInfo.summary}</p>
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
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
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
                    <ul className="list-disc list-outside ml-5 mt-2 space-y-1 text-gray-700">
                      {exp.description
                        .filter((d) => d.trim())
                        .map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                    </ul>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-outside ml-5 mt-2 space-y-1">
                      {exp.achievements
                        .filter((a) => a.trim())
                        .map((a, idx) => (
                          <li key={idx} className="font-medium text-gray-900">{a}</li>
                        ))}
                    </ul>
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
                      <h3 className="font-semibold text-gray-900">
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
                    <ul className="list-disc list-outside ml-5 mt-2 space-y-1 text-gray-700">
                      {edu.description
                        .filter((d) => d.trim())
                        .map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
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
                  <p className="text-gray-700">{project.description}</p>
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
                    <ul className="list-disc list-outside ml-5 mt-1 space-y-0.5 text-gray-700">
                      {activity.description.filter((d) => d.trim()).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
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
