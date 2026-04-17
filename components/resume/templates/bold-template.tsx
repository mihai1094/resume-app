import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "../template-customizer";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { groupSkillsByCategory } from "@/lib/utils";
import { MapPin, Phone, Mail, Globe, Linkedin, Github } from "lucide-react";
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

interface BoldTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Bold Template
 *
 * A typography-focused, single-column template with:
 * - Extra-large name (32-40px)
 * - Bold uppercase section headers
 * - Strong contrast and generous whitespace
 * - Minimal accent colors for maximum ATS compatibility
 *
 * Best for: Executive, Sales, Management, General professional
 */
export function BoldTemplate({ data, customization: customizationProp }: BoldTemplateProps) {
  const customization = customizationProp ?? DEFAULT_TEMPLATE_CUSTOMIZATION as TemplateCustomization;
  const { personalInfo, workExperience, education, skills, projects, certifications, languages, hobbies } = data;
  const primaryColor = customization.primaryColor;
  const secondaryColor = customization.accentColor || customization.secondaryColor;

  const hasWorkExperience = workExperience && workExperience.length > 0;
  const hasEducation = education && education.length > 0;
  const hasSkills = skills && skills.length > 0;
  const hasProjects = projects && projects.length > 0;
  const hasCertifications = certifications && certifications.length > 0;
  const hasLanguages = languages && languages.length > 0;
  const hasHobbies = hobbies && hobbies.length > 0;
  const hasExtraCurricular = data.extraCurricular && data.extraCurricular.length > 0;

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const fontFamily = getTemplateFontFamily(customization, "professional");

  return (
    <div
      className="w-full min-h-[297mm] pb-8 bg-white"
      style={{
        fontFamily,
        fontSize: `${customization.fontSize}px`,
        lineHeight: customization.lineSpacing,
        padding: "48px 56px",
      }}
    >
      {/* Header - Large Bold Name */}
      <TemplateHeader className="mb-10">
        {/* Name */}
        <TemplateH1
          className="font-black tracking-tight mb-3"
          style={{
            fontSize: "42px",
            lineHeight: 1.05,
            color: primaryColor,
          }}
        >
          {personalInfo.firstName} {personalInfo.lastName}
        </TemplateH1>

        {/* Title */}
        {personalInfo.jobTitle && (
          <p
            className="font-semibold uppercase tracking-widest mb-5"
            style={{
              fontSize: "14px",
              color: primaryColor,
              letterSpacing: "0.15em",
            }}
          >
            {personalInfo.jobTitle}
          </p>
        )}

        {/* Contact Row */}
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
          style={{
            fontSize: "12px",
            color: "#4b5563",
          }}
        >
          {personalInfo.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.email && (
            <span className="flex items-center gap-1.5 min-w-0 max-w-full">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: primaryColor }} />
              <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
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
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Professional Summary
          </h2>
          <p
            className="leading-relaxed"
            style={{
              fontSize: `${customization.fontSize}px`,
              color: "#374151",
            }}
          >
            {renderSummaryText(personalInfo.summary)}
          </p>
        </section>
      )}

      {/* Skills - Promoted above Experience (when skills-first) */}
      {customization.sectionOrder === "skills-first" && hasSkills && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Skills
          </h2>
          <div
            className="space-y-2"
            style={{ fontSize: `${customization.fontSize}px` }}
          >
            {Object.entries(groupSkillsByCategory(skills)).map(([category, items]) => (
              <div key={category} className="leading-snug">
                <span
                  className="font-bold uppercase tracking-wide"
                  style={{ color: primaryColor }}
                >
                  {category}:
                </span>{" "}
                <span style={{ color: primaryColor }}>
                  {items.map((s) => s.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience */}
      {hasWorkExperience && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Experience
          </h2>
          <div className="space-y-5">
            {workExperience.map((job) => (
              <div key={job.id}>
                {/* Company Name - Bold and prominent */}
                <h3
                  className="font-bold"
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                  }}
                >
                  {job.company}
                </h3>
                {/* Title and Date Row */}
                <div className="flex justify-between items-baseline mt-0.5 mb-2">
                  <span
                    className="font-medium"
                    style={{
                      fontSize: `${customization.fontSize}px`,
                      color: primaryColor,
                    }}
                  >
                    {job.position}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(job.startDate)} — {job.current ? "Present" : formatDate(job.endDate)}
                    {job.location && ` | ${job.location}`}
                  </span>
                </div>
                {/* Description & Achievements */}
                {((job.description && job.description.length > 0) || (job.achievements && job.achievements.length > 0)) && (
                  <div className="ml-4 space-y-1 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {job.description?.map((desc, idx) => (
                      <div
                        key={`desc-${idx}`}
                        style={{
                          fontSize: `${customization.fontSize - 1}px`,
                          color: "#4b5563",
                        }}
                      >
                        {renderFormattedText(desc)}
                      </div>
                    ))}
                    {job.achievements?.map((achievement, idx) => (
                      <div
                        key={`ach-${idx}`}
                        style={{
                          fontSize: `${customization.fontSize - 1}px`,
                          color: "#4b5563",
                        }}
                      >
                        {renderFormattedText(achievement)}
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
      {hasEducation && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                  }}
                >
                  {edu.institution}
                </h3>
                <div className="flex justify-between items-baseline mt-0.5">
                  <span
                    className="font-medium"
                    style={{
                      fontSize: `${customization.fontSize}px`,
                      color: primaryColor,
                    }}
                  >
                    {edu.degree}{edu.field && ` in ${edu.field}`}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate)}
                  </span>
                </div>
                {edu.gpa && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: `${customization.fontSize - 1}px`,
                      color: "#6b7280",
                    }}
                  >
                    Grade: {edu.gpa}
                  </p>
                )}
                {edu.description && edu.description.length > 0 && (
                  <div className="ml-4 mt-1 space-y-0.5 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {edu.description.map((desc, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: `${customization.fontSize - 1}px`,
                          color: "#4b5563",
                        }}
                      >
                        {renderFormattedText(desc)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills - Bold Tags (default position) */}
      {customization.sectionOrder !== "skills-first" && hasSkills && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Skills
          </h2>
          <div
            className="space-y-2"
            style={{ fontSize: `${customization.fontSize}px` }}
          >
            {Object.entries(groupSkillsByCategory(skills)).map(([category, items]) => (
              <div key={category} className="leading-snug">
                <span
                  className="font-bold uppercase tracking-wide"
                  style={{ color: primaryColor }}
                >
                  {category}:
                </span>{" "}
                <span style={{ color: primaryColor }}>
                  {items.map((s) => s.name).join(", ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {hasProjects && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-baseline">
                  <h3
                    className="font-bold"
                    style={{
                      fontSize: "14px",
                      color: "#111827",
                    }}
                  >
                    {project.name}
                  </h3>
                  {(project.startDate || project.endDate) && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                      }}
                    >
                      {formatDate(project.startDate)}{project.endDate ? ` — ${formatDate(project.endDate)}` : ""}
                    </span>
                  )}
                </div>
                {project.description && (
                  <p
                    className="mt-1"
                    style={{
                      fontSize: `${customization.fontSize - 1}px`,
                      color: "#4b5563",
                    }}
                  >
                    {renderFormattedText(project.description)}
                  </p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="font-medium px-2 py-0.5 rounded text-xs"
                        style={{
                          backgroundColor: `${secondaryColor}15`,
                          color: secondaryColor,
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
      {hasCertifications && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline">
                <div>
                  <span
                    className="font-semibold"
                    style={{
                      fontSize: `${customization.fontSize}px`,
                      color: "#111827",
                    }}
                  >
                    {cert.name}
                  </span>
                  {cert.issuer && (
                    <span
                      className="ml-2"
                      style={{
                        fontSize: `${customization.fontSize - 1}px`,
                        color: "#6b7280",
                      }}
                    >
                      — {cert.issuer}
                    </span>
                  )}
                </div>
                {cert.date && (
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                    }}
                  >
                    {formatDate(cert.date)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Activities */}
      {hasExtraCurricular && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Activities
          </h2>
          <div className="space-y-4">
            {data.extraCurricular!.map((activity) => (
              <div key={activity.id}>
                <h3
                  className="font-bold"
                  style={{
                    fontSize: "15px",
                    color: "#111827",
                  }}
                >
                  {activity.title}
                </h3>
                <div className="flex justify-between items-baseline mt-0.5">
                  <span
                    className="font-medium"
                    style={{
                      fontSize: `${customization.fontSize}px`,
                      color: primaryColor,
                    }}
                  >
                    {activity.organization}
                    {activity.role && ` — ${activity.role}`}
                  </span>
                  {(activity.startDate || activity.endDate) && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                      }}
                    >
                      {formatDate(activity.startDate)} —{" "}
                      {activity.current ? "Present" : formatDate(activity.endDate)}
                    </span>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <div className="ml-4 mt-1 space-y-0.5 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
                    {activity.description.map((desc, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: `${customization.fontSize - 1}px`,
                          color: "#4b5563",
                        }}
                      >
                        {renderFormattedText(desc)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {hasLanguages && (
        <section className="mb-8" style={{ marginBottom: `${customization.sectionSpacing}px` }}>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Languages
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {languages.map((lang) => (
              <span
                key={lang.id}
                style={{
                  fontSize: `${customization.fontSize}px`,
                  color: "#374151",
                }}
              >
                <span className="font-semibold">{lang.name}</span>
                {lang.level && (
                  <span className="text-gray-500"> — {lang.level}</span>
                )}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Interests/Hobbies */}
      {hasHobbies && (
        <section>
          <h2
            className="font-black uppercase tracking-wider mb-4 pb-2"
            style={{
              fontSize: "15px",
              color: primaryColor,
              borderBottom: `3px solid ${primaryColor}`,
              letterSpacing: "0.12em",
            }}
          >
            Interests
          </h2>
          <p
            style={{
              fontSize: `${customization.fontSize}px`,
              color: "#4b5563",
            }}
          >
            {hobbies.map((h) => h.name).join(" • ")}
          </p>
        </section>
      )}
    </div>
  );
}
