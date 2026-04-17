import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate, groupSkillsByCategory, getCertifications } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Briefcase, Award } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { TemplateMain, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

interface InfographicTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Infographic Template - Visual Data Representation
 *
 * Two-column layout (35/65 split) with visual skill indicators,
 * timeline experience, and stats cards.
 * Inspired by Enhancv's infographic style.
 */
export function InfographicTemplate({ data, customization }: InfographicTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const skillsByCategory = groupSkillsByCategory(skills);

  const primaryColor = customization?.primaryColor || "#f97316";
  const secondaryColor = customization?.secondaryColor || customization?.accentColor || "#fb923c";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 20;

  const fontFamily = getTemplateFontFamily(customization, "creative");

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  // Calculate stats
  const yearsExperience = sortedExperience.reduce((acc, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || "");
    return acc + (end.getFullYear() - start.getFullYear());
  }, 0);

  return (
    <div className="w-full bg-white text-gray-800 min-h-[297mm] pb-10" style={{ fontFamily: fontFamily }}>
      <div className="flex" style={baseTextStyle}>
        {/* Sidebar - 35% */}
        <aside className="w-[35%] flex-shrink-0 text-white min-h-[297mm]" style={{ backgroundColor: primaryColor }}>
          <div className="p-6">
            {/* Photo with colored ring */}
            {personalInfo.photo && (
              <div className="mb-6 flex justify-center">
                <div
                  className="p-1 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${secondaryColor}, white)` }}
                >
                  <ProfilePhoto
                    photo={personalInfo.photo}
                    firstName={personalInfo.firstName}
                    lastName={personalInfo.lastName}
                    size={96}
                    shape="circular"
                    className="border-4 border-white"
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div className="text-center mb-6">
              <TemplateH1 className="text-2xl font-bold">
                {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
              </TemplateH1>
              {personalInfo.jobTitle && (
                <p className="text-sm opacity-80 mt-1">{personalInfo.jobTitle}</p>
              )}
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex-1 min-w-[120px] bg-white/10 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 opacity-60" />
                <div className="text-xl font-bold">{yearsExperience}+</div>
                <div className="text-[10px] opacity-60 uppercase">Years Exp</div>
              </div>
              <div className="flex-1 min-w-[120px] bg-white/10 rounded-lg p-3 text-center">
                <Briefcase className="w-5 h-5 mx-auto mb-1 opacity-60" />
                <div className="text-xl font-bold">{sortedExperience.length}</div>
                <div className="text-[10px] opacity-60 uppercase">Positions</div>
              </div>
              {data.projects && data.projects.length > 0 && (
                <div className="flex-1 min-w-[120px] bg-white/10 rounded-lg p-3 text-center">
                  <Award className="w-5 h-5 mx-auto mb-1 opacity-60" />
                  <div className="text-xl font-bold">{data.projects.length}</div>
                  <div className="text-[10px] opacity-60 uppercase">Projects</div>
                </div>
              )}
              {skills.length > 0 && (
                <div className="flex-1 min-w-[120px] bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold">{skills.length}</div>
                  <div className="text-[10px] opacity-60 uppercase">Skills</div>
                </div>
              )}
            </div>

            {/* Contact */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                Contact
              </h2>
              <div className="space-y-2 text-sm min-w-0">
                {personalInfo.email && (
                  <div className="flex items-start gap-2 min-w-0">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                    <a className="min-w-0 break-words" title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">{formatEmailDisplay(personalInfo.email, 32)}</a>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 opacity-50" />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 opacity-50" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-start gap-2 min-w-0">
                    <Globe className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                    <a className="min-w-0 break-words" title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">{formatWebsiteDisplay(personalInfo.website, 32)}</a>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-start gap-2 min-w-0">
                    <Linkedin className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                    <a className="min-w-0 break-words" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">{formatLinkedinDisplay(personalInfo.linkedin, 32)}</a>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-start gap-2 min-w-0">
                    <Github className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                    <a className="min-w-0 break-words" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">{formatGithubDisplay(personalInfo.github, 32)}</a>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {Object.keys(skillsByCategory).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                  Skills
                </h2>
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).slice(0, 3).map(([category, categorySkills]) => (
                    <div key={category}>
                      <p className="text-[10px] opacity-50 uppercase tracking-wider mb-2">{category}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {categorySkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 text-[10px] rounded bg-white/10 text-white/90"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                  Languages
                </h2>
                <div className="space-y-2">
                  {data.languages.map((lang) => {
                    return (
                      <div key={lang.id} className="flex justify-between text-xs">
                        <span>{lang.name}</span>
                        <span className="opacity-50 capitalize">{lang.level}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content - 65% */}
        <TemplateMain className="flex-1 p-8">
          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderColor: primaryColor }}>
                <p className="text-sm text-gray-600 leading-relaxed">{renderSummaryText(personalInfo.summary)}</p>
              </div>
            </section>
          )}

          {/* Experience with Timeline */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
                <Briefcase className="w-5 h-5" />
                Experience
              </h2>
              <div className="relative pl-6" style={{ borderLeft: `2px solid ${primaryColor}20` }}>
                {sortedExperience.map((exp, index) => (
                  <div key={exp.id} className="relative pb-6 last:pb-0">
                    {/* Timeline node */}
                    <div
                      className="absolute -left-[9px] top-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {index + 1}
                    </div>
                    <div className="pl-2">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-sm" style={{ color: primaryColor }}>
                            {exp.company}{exp.location && ` · ${exp.location}`}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4 bg-gray-100 px-2 py-1 rounded">
                          {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                        </span>
                      </div>
                      {exp.description.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          {exp.description.map((item, idx) => item.trim() && (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} />
                              <span>{renderFormattedText(item)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education with Timeline */}
          {sortedEducation.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: primaryColor }}>
                <Award className="w-5 h-5" />
                Education
              </h2>
              <div className="relative pl-6" style={{ borderLeft: `2px solid ${primaryColor}20` }}>
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="relative pb-4 last:pb-0">
                    <div
                      className="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: primaryColor }}
                    />
                    <div className="pl-2 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {edu.degree}{edu.field && ` in ${edu.field}`}
                        </p>
                        <p className="text-sm" style={{ color: primaryColor }}>{edu.institution}</p>
                        {edu.gpa && <p className="text-xs text-gray-500 mt-0.5">Grade: {edu.gpa}</p>}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                Projects
              </h2>
              <div className="flex flex-wrap gap-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg flex-1 min-w-[200px] border"
                    style={{ borderColor: `${primaryColor}30` }}
                  >
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{renderFormattedText(project.description)}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded"
                            style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
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

          {/* Activities */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                Activities
              </h2>
              <div className="space-y-4">
                {data.extraCurricular.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: `${primaryColor}30` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {activity.organization}
                          {activity.role && <span className="text-gray-500"> · {activity.role}</span>}
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
                      <div className="mt-2 space-y-0.5 text-xs text-gray-600 [&_strong]:font-semibold [&_strong]:text-[0.92em]">
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

          {/* Certifications */}
          {getCertifications(data).length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                Certifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {getCertifications(data).map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-full"
                    style={{ backgroundColor: `${primaryColor}10` }}
                  >
                    <Award className="w-4 h-4" style={{ color: primaryColor }} />
                    <span className="text-sm font-medium" style={{ color: primaryColor }}>{cert.name}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Hobbies / Interests */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                Interests
              </h2>
              <p className="text-sm text-gray-700">
                {data.hobbies.map((h) => h.name).join(" · ")}
              </p>
            </section>
          )}
        </TemplateMain>
      </div>
    </div>
  );
}
