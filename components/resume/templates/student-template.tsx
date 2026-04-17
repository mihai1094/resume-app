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
import { TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import { TemplateBulletList } from "./shared";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";
import { MapPin } from "lucide-react";

interface StudentTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Student Template
 * - Optimized for students and new graduates
 * - Single column, ATS-optimized layout
 * - Education section prominently placed before work experience
 * - Clean, modern design suitable for entry-level positions and internships
 * - Includes space for coursework, GPA, academic achievements, and projects
 */
export function StudentTemplate({
  data,
  customization,
}: StudentTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const hobbies = data.hobbies || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const extraCurricular = data.extraCurricular || [];

  const primary = customization?.primaryColor || "#1e40af"; // blue-800
  const accent = customization?.accentColor || "#3b82f6"; // blue-500
  const baseFontSize = customization?.fontSize ?? 11;
  const baseLineHeight = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing ?? 20;
  const fontFamily = getTemplateFontFamily(customization, "professional");

  // Determine if education should be shown first (student-friendly ordering)
  // Education goes first if there's minimal work experience
  const showEducationFirst = experience.length <= 1;

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
      <TemplateHeader className="text-center space-y-2 pb-4 border-b-2" style={{ borderColor: accent }}>
        <TemplateH1
          className="text-[28px] font-bold tracking-tight"
          style={{ color: primary }}
        >
          {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(" ") ||
            "Your Name"}
        </TemplateH1>
        {personalInfo.jobTitle && (
          <p className="text-sm text-slate-600 font-medium">
            {personalInfo.jobTitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-700 max-w-full">
          {personalInfo.email && (
            <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 45)}</a>
          )}
          {personalInfo.phone && <span>|</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>|</span>}
          {personalInfo.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{personalInfo.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs max-w-full">
          {personalInfo.linkedin && (
            <a className="min-w-0 break-words" style={{ color: primary }} title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
              {formatLinkedinDisplay(personalInfo.linkedin, 45)}
            </a>
          )}
          {personalInfo.github && (
            <a className="min-w-0 break-words" style={{ color: primary }} title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">
              {formatGithubDisplay(personalInfo.github, 45)}
            </a>
          )}
          {personalInfo.website && (
            <a className="min-w-0 break-words" style={{ color: primary }} title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">
              {formatWebsiteDisplay(personalInfo.website, 45)}
            </a>
          )}
        </div>
      </TemplateHeader>

      {/* Summary / Objective */}
      {personalInfo.summary && (
        <section className="text-sm text-slate-700 leading-relaxed text-center px-4">
          {renderSummaryText(personalInfo.summary)}
        </section>
      )}

      {/* Skills - Promoted above Education/Experience (when skills-first) */}
      {customization?.sectionOrder === "skills-first" && skills.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Skills" accent={accent} />
          <div className="space-y-1 text-xs text-slate-800">
            {Object.entries(groupSkillsByCategory(skills)).map(([category, items]) => (
              <div key={category}>
                <span className="font-semibold">{category}: </span>
                <span>{items.map((s) => s.name).join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Student ordering: Education → Projects → Experience */}
      {/* Experienced ordering: Experience → Education → Projects */}

      {showEducationFirst && education.length > 0 && (
        <EducationSection education={education} accent={accent} />
      )}

      {showEducationFirst && <ProjectsSection projects={projects} accent={accent} />}

      {/* Work Experience / Internships */}
      {experience.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Experience" accent={accent} />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">{exp.position}</h3>
                    <p className="text-xs text-slate-600">
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(exp.startDate)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description && exp.description.length > 0 && (
                  <TemplateBulletList
                    items={exp.description}
                    className="text-xs text-slate-700 space-y-0.5 mt-1"
                    renderBullet={() => <span className="leading-4">•</span>}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!showEducationFirst && education.length > 0 && (
        <EducationSection education={education} accent={accent} />
      )}

      {!showEducationFirst && <ProjectsSection projects={projects} accent={accent} />}

      {/* Skills (default position) */}
      {customization?.sectionOrder !== "skills-first" && skills.length > 0 && (
        <section className="space-y-2">
          <SectionTitle title="Skills" accent={accent} />
          <div className="space-y-1 text-xs text-slate-800">
            {Object.entries(groupSkillsByCategory(skills)).map(([category, items]) => (
              <div key={category}>
                <span className="font-semibold">{category}: </span>
                <span>{items.map((s) => s.name).join(", ")}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extracurricular Activities */}
      {extraCurricular.length > 0 && (
        <section className="space-y-3">
          <SectionTitle title="Activities" accent={accent} />
          <div className="space-y-3">
            {extraCurricular.map((activity) => (
              <div key={activity.id} className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold">
                      {activity.role || activity.title}
                    </h3>
                    {activity.organization && (
                      <p className="text-xs text-slate-600">{activity.organization}</p>
                    )}
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">
                      {activity.startDate && formatDate(activity.startDate)}
                      {activity.startDate && " — "}
                      {activity.current ? "Present" : activity.endDate && formatDate(activity.endDate)}
                    </div>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <TemplateBulletList
                    items={activity.description}
                    className="text-xs text-slate-700 space-y-0.5"
                    renderBullet={() => <span className="leading-4">•</span>}
                  />
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
          <div className="space-y-2">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">{cert.name}</h3>
                  <p className="text-xs text-slate-600">{cert.issuer}</p>
                </div>
                {cert.date && (
                  <div className="text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(cert.date)}
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
    </div>
  );
}

function SectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: accent }}>
      <h2
        className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-800"
      >
        {title}
      </h2>
    </div>
  );
}

function EducationSection({
  education,
  accent,
}: {
  education: ResumeData["education"];
  accent: string;
}) {
  return (
    <section className="space-y-3">
      <SectionTitle title="Education" accent={accent} />
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold">{edu.institution}</h3>
                <p className="text-xs text-slate-700">
                  {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                  {edu.gpa && (
                    <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
                      GPA: {edu.gpa}
                    </span>
                  )}
                </p>
                {edu.location && (
                  <p className="text-xs text-slate-500">{edu.location}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  {formatDate(edu.startDate)} —{" "}
                  {edu.current ? "Expected " + formatDate(edu.endDate || "") : formatDate(edu.endDate || "")}
                </div>
              </div>
            </div>
            {edu.description && edu.description.filter(d => d.trim()).length > 0 && (
              <div className="mt-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Relevant Coursework: </span>
                <span className="text-xs text-slate-600">{edu.description.filter(d => d.trim()).join(", ")}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection({
  projects,
  accent,
}: {
  projects: ResumeData["projects"];
  accent: string;
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionTitle title="Projects" accent={accent} />
      <div className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{project.name}</h3>
              {(project.startDate || project.endDate) && (
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  {project.startDate && formatDate(project.startDate)}
                  {project.endDate && ` — ${formatDate(project.endDate)}`}
                </div>
              )}
            </div>
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {project.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${accent}15`, color: accent }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            {project.description && (
              <p className="text-xs text-slate-700">{renderFormattedText(project.description)}</p>
            )}
            {(project.url || project.github) && (
              <div className="flex flex-wrap gap-3 text-[11px] max-w-full">
                {project.url && (
                  <span className="min-w-0 break-words" style={{ color: accent }} title={project.url}>
                    {formatWebsiteDisplay(project.url, 45)}
                  </span>
                )}
                {project.github && (
                  <span className="min-w-0 break-words" style={{ color: accent }} title={project.github}>
                    {formatGithubDisplay(project.github, 45)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default StudentTemplate;
