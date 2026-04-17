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
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
} from "@/lib/utils/contact-display";

interface ATSPureTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Pure ATS
 * - Zero-color, single-column, purely typographic layout
 * - Full-width HR dividers under section headers
 * - Skills rendered in a multi-column bullet grid
 * - No accent color — black text on white, maximum ATS parse rate
 */
export function ATSPureTemplate({
  data,
  customization,
}: ATSPureTemplateProps) {
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

  const baseFontSize = customization?.fontSize ?? 11.5;
  const baseLineHeight = customization?.lineSpacing ?? 1.6;
  const sectionSpacing = customization?.sectionSpacing ?? 16;
  const fontFamily = getTemplateFontFamily(customization, "professional");

  const contactParts = [
    personalInfo.location,
    personalInfo.email
      ? formatEmailDisplay(personalInfo.email, 60)
      : null,
    personalInfo.phone,
    personalInfo.linkedin
      ? formatLinkedinDisplay(personalInfo.linkedin, 50)
      : null,
    personalInfo.github
      ? formatGithubDisplay(personalInfo.github, 50)
      : null,
    personalInfo.website
      ? formatWebsiteDisplay(personalInfo.website, 50)
      : null,
  ].filter(Boolean);

  return (
    <div
      className="w-full bg-white text-black min-h-[297mm] px-12 py-10"
      style={{
        fontFamily,
        fontSize: `${baseFontSize}px`,
        lineHeight: baseLineHeight,
        color: "#000",
      }}
    >
      {/* Header */}
      <TemplateHeader>
        <TemplateH1
          className="font-bold"
          style={{ fontSize: `${baseFontSize * 2}px`, lineHeight: 1.15 }}
        >
          {[personalInfo.firstName, personalInfo.lastName]
            .filter(Boolean)
            .join(" ") || "Your Name"}
        </TemplateH1>
        {personalInfo.jobTitle && (
          <p
            className="font-normal"
            style={{ fontSize: `${baseFontSize}px`, marginTop: "2px" }}
          >
            {personalInfo.jobTitle}
          </p>
        )}
        {contactParts.length > 0 && (
          <p
            style={{
              fontSize: `${baseFontSize * 0.9}px`,
              marginTop: "4px",
              color: "#000",
            }}
          >
            {contactParts.join(" | ")}
          </p>
        )}
      </TemplateHeader>

      {/* Summary / Profile */}
      {personalInfo.summary && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Profile" />
          <p style={{ fontSize: `${baseFontSize}px` }}>
            {renderSummaryText(personalInfo.summary)}
          </p>
        </div>
      )}

      {/* Skills — Areas of Expertise (when promoted above Experience) */}
      {customization?.sectionOrder === "skills-first" && skills.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Areas of Expertise" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2px 0",
            }}
          >
            {skills.map((skill) => (
              <p
                key={skill.id}
                style={{ fontSize: `${baseFontSize}px`, margin: 0 }}
              >
                • {skill.name}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Professional Experience" />
          <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing * 0.9}px` }}>
            {experience.map((exp) => {
              const titleLine = [exp.position, exp.company, exp.location]
                .filter(Boolean)
                .join(" , ");
              const startStr = formatDate(exp.startDate);
              const endStr = exp.current ? "Present" : formatDate(exp.endDate || "");
              const dateStr = [startStr, endStr].filter(Boolean).join(" to ");
              return (
                <div key={exp.id}>
                  {titleLine && (
                    <p style={{ fontWeight: "bold", fontSize: `${baseFontSize}px` }}>
                      {titleLine}
                    </p>
                  )}
                  {dateStr && (
                    <p style={{ fontSize: `${baseFontSize}px`, marginBottom: "4px" }}>
                      {dateStr}
                    </p>
                  )}
                  {exp.description && exp.description.length > 0 && (
                    <div
                      style={{
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                      className="[&_strong]:font-semibold [&_strong]:text-[0.92em]"
                    >
                      {exp.description
                        .filter((d) => d.trim())
                        .map((d, idx) => (
                          <div key={idx} style={{ fontSize: `${baseFontSize}px` }}>
                            {renderFormattedText(d)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Education" />
          <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing * 0.7}px` }}>
            {education.map((edu) => {
              const institutionLine = [edu.institution, edu.location]
                .filter(Boolean)
                .join(", ");
              const degreeLine = [edu.degree, edu.field]
                .filter(Boolean)
                .join(" in ");
              const startStr = formatDate(edu.startDate);
              const endStr = edu.current ? "Present" : formatDate(edu.endDate || "");
              const dateStr = [startStr, endStr].filter(Boolean).join(" to ");
              return (
                <div key={edu.id}>
                  {institutionLine && (
                    <p style={{ fontWeight: "bold", fontSize: `${baseFontSize}px` }}>
                      {institutionLine}
                    </p>
                  )}
                  {degreeLine && (
                    <p style={{ fontSize: `${baseFontSize}px` }}>{degreeLine}</p>
                  )}
                  {dateStr && (
                    <p style={{ fontSize: `${baseFontSize * 0.9}px`, color: "#333" }}>
                      {dateStr}
                    </p>
                  )}
                  {edu.gpa && (
                    <p style={{ fontSize: `${baseFontSize * 0.9}px`, color: "#333" }}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills — multi-column bullet grid (default position) */}
      {customization?.sectionOrder !== "skills-first" && skills.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Areas of Expertise" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2px 0",
            }}
          >
            {skills.map((skill) => (
              <p
                key={skill.id}
                style={{ fontSize: `${baseFontSize}px`, margin: 0 }}
              >
                • {skill.name}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Projects" />
          <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing * 0.7}px` }}>
            {projects.map((project) => {
              const startStr = project.startDate ? formatDate(project.startDate) : "";
              const endStr = project.endDate ? formatDate(project.endDate) : "Present";
              const dateStr =
                project.startDate || project.endDate
                  ? [startStr, endStr].filter(Boolean).join(" to ")
                  : "";
              return (
                <div key={project.id}>
                  <p style={{ fontWeight: "bold", fontSize: `${baseFontSize}px` }}>
                    {project.name}
                    {dateStr && (
                      <span style={{ fontWeight: "normal" }}> — {dateStr}</span>
                    )}
                  </p>
                  {project.description && (
                    <p style={{ fontSize: `${baseFontSize}px` }}>
                      {renderFormattedText(project.description)}
                    </p>
                  )}
                  {project.technologies?.length > 0 && (
                    <p style={{ fontSize: `${baseFontSize * 0.9}px` }}>
                      Technologies: {project.technologies.join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Certifications" />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {certifications.map((cert) => (
              <p key={cert.id} style={{ fontSize: `${baseFontSize}px`, margin: 0 }}>
                • <strong>{cert.name}</strong>
                {cert.issuer && <span> — {cert.issuer}</span>}
                {cert.date && (
                  <span style={{ color: "#333" }}>
                    {" "}({formatDate(cert.date)})
                  </span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Languages" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "2px 0",
            }}
          >
            {languages.map((lang) => (
              <p
                key={lang.id}
                style={{ fontSize: `${baseFontSize}px`, margin: 0 }}
              >
                • {lang.name}{lang.level ? ` (${lang.level})` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Activities */}
      {data.extraCurricular && data.extraCurricular.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Activities" />
          <div style={{ display: "flex", flexDirection: "column", gap: `${sectionSpacing * 0.7}px` }}>
            {data.extraCurricular.map((activity) => {
              const startStr = formatDate(activity.startDate || "");
              const endStr = activity.current
                ? "Present"
                : formatDate(activity.endDate || "");
              const dateStr = [startStr, endStr].filter(Boolean).join(" to ");
              return (
                <div key={activity.id}>
                  <p style={{ fontWeight: "bold", fontSize: `${baseFontSize}px` }}>
                    {activity.title}
                    {activity.organization && ` — ${activity.organization}`}
                    {dateStr && (
                      <span style={{ fontWeight: "normal" }}>, {dateStr}</span>
                    )}
                  </p>
                  {activity.role && (
                    <p style={{ fontSize: `${baseFontSize}px` }}>{activity.role}</p>
                  )}
                  {activity.description && activity.description.length > 0 && (
                    <div
                      style={{
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                      className="[&_strong]:font-semibold [&_strong]:text-[0.92em]"
                    >
                      {activity.description
                        .filter((d) => d.trim())
                        .map((d, idx) => (
                          <div key={idx} style={{ fontSize: `${baseFontSize}px` }}>
                            {renderFormattedText(d)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Hobbies / Interests */}
      {hobbies.length > 0 && (
        <div style={{ marginTop: `${sectionSpacing}px` }}>
          <SectionHeading title="Interests" />
          <p style={{ fontSize: `${baseFontSize}px`, margin: 0 }}>
            {hobbies.map((h) => h.name).join(" · ")}
          </p>
        </div>
      )}

      {/* Custom Sections */}
      {data.customSections && data.customSections.length > 0 &&
        data.customSections.map((section) => (
          <div key={section.id} style={{ marginTop: `${sectionSpacing}px` }}>
            <SectionHeading title={section.title || "Additional Information"} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {(section.items || []).map((item) => (
                <div key={item.id}>
                  <p style={{ fontWeight: "bold", fontSize: `${baseFontSize}px`, margin: 0 }}>
                    {item.title}
                  </p>
                  {(item.date || item.location) && (
                    <p style={{ fontSize: `${baseFontSize * 0.9}px`, color: "#333", margin: 0 }}>
                      {[item.date, item.location].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  {item.description && (
                    <p style={{ fontSize: `${baseFontSize}px`, margin: 0 }}>
                      {renderFormattedText(item.description)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <p style={{ fontWeight: "normal", fontSize: "inherit", margin: "0 0 3px 0" }}>
        {title}
      </p>
      <hr
        style={{
          border: "none",
          borderTop: "1px solid #000",
          margin: 0,
        }}
      />
    </div>
  );
}
