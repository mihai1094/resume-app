import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { Mail, MapPin, Phone, Globe, Linkedin, Github, Briefcase, GraduationCap, BookOpen, Languages, Award, Heart, Wrench, User } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { TemplateMain, TemplateHeader, TemplateH1 } from "./shared/template-preview-context";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
} from "@/lib/utils/contact-display";

interface ContemporaryTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

function SectionIcon({ icon: Icon, label, color }: {
  icon: React.ComponentType<{ className?: string; style?: CSSProperties }>;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span
        className="w-[18px] h-[18px] rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      >
        <Icon className="w-[10px] h-[10px]" style={{ color: "#fff" }} />
      </span>
      <h2
        className="text-[11px] font-bold uppercase tracking-[0.1em]"
        style={{ color }}
      >
        {label}
      </h2>
    </div>
  );
}

const LANGUAGE_LEVELS: Record<string, number> = { basic: 2, conversational: 3, fluent: 4, native: 5 };

function languageDots(level: string): boolean[] {
  const filled = LANGUAGE_LEVELS[level] ?? 3;
  return Array.from({ length: 5 }, (_, i) => i < filled);
}

/**
 * Contemporary Template — Clean Two-Column with Icon Section Headers
 *
 * Professional sidebar layout with circular photo, inline skill tags,
 * and colored icon badges on every section header. The sidebar houses
 * contacts, skills, achievements/projects, and interests on a pale
 * tinted background. The main column covers summary, experience,
 * education, courses, and languages with dot-based proficiency.
 */
export function ContemporaryTemplate({ data, customization }: ContemporaryTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const primaryColor = customization?.primaryColor || "#4CAF84";
  const baseFontSize = customization?.fontSize ?? 12;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing ?? 18;

  const sidebarBg = "#F3F6F4";

  const fontFamily = getTemplateFontFamily(customization, "professional");

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  const certifications = data.certifications?.filter((c) => c.type !== "course") || [];
  const courses = [
    ...(data.certifications?.filter((c) => c.type === "course") || []).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.issuer ? `${c.issuer}` : undefined,
    })),
    ...(data.courses || []).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.institution ? `${c.institution}` : undefined,
    })),
  ];

  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm] flex flex-col"
      style={{ fontFamily, ...baseTextStyle }}
    >
      {/* ─── Full-Width Header ─── */}
      <TemplateHeader className="text-center pt-10 pb-5 px-8">
        <TemplateH1 className="text-[28px] font-bold text-gray-900 tracking-[-0.01em] leading-[1.1]">
          {fullName || "Your Name"}
        </TemplateH1>
        {personalInfo.jobTitle && (
          <div className="mt-2 inline-block">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.15em] px-4 py-1.5 rounded-sm"
              style={{ color: primaryColor, backgroundColor: `${primaryColor}14` }}
            >
              {personalInfo.jobTitle}
            </p>
          </div>
        )}
      </TemplateHeader>

      {/* ─── Two Column Body ─── */}
      <div className="flex flex-1">
        {/* ─── Sidebar ─── */}
        <aside
          className="w-[35%] flex-shrink-0 px-6 py-6"
          style={{ backgroundColor: sidebarBg }}
        >
          {/* Photo */}
          {personalInfo.photo && (
            <div className="flex justify-center mb-5">
              <ProfilePhoto
                photo={personalInfo.photo}
                firstName={personalInfo.firstName}
                lastName={personalInfo.lastName}
                size={90}
                shape="circular"
                className="border-[3px]"
                style={{ borderColor: primaryColor }}
              />
            </div>
          )}

          {/* Contacts */}
          {(personalInfo.email ||
            personalInfo.phone ||
            personalInfo.location ||
            personalInfo.website ||
            personalInfo.linkedin ||
            personalInfo.github) && (
            <section className="mb-5">
              <SectionIcon icon={Mail} label="Contacts" color={primaryColor} />
              <ul className="space-y-2 text-[11px] text-gray-700" style={{ lineHeight: 1.45 }}>
                {personalInfo.email && (
                  <li className="flex items-start gap-2 min-w-0">
                    <Globe className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="min-w-0 break-words" title={personalInfo.email}>
                      {formatEmailDisplay(personalInfo.email, 28)}
                    </span>
                  </li>
                )}
                {personalInfo.website && (
                  <li className="flex items-start gap-2 min-w-0">
                    <Globe className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="min-w-0 break-words" title={personalInfo.website}>
                      {formatWebsiteDisplay(personalInfo.website, 28)}
                    </span>
                  </li>
                )}
                {personalInfo.phone && (
                  <li className="flex items-start gap-2">
                    <Phone className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{personalInfo.phone}</span>
                  </li>
                )}
                {personalInfo.location && (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{personalInfo.location}</span>
                  </li>
                )}
                {personalInfo.linkedin && (
                  <li className="flex items-start gap-2 min-w-0">
                    <Linkedin className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="min-w-0 break-words" title={personalInfo.linkedin}>
                      {formatLinkedinDisplay(personalInfo.linkedin, 28)}
                    </span>
                  </li>
                )}
                {personalInfo.github && (
                  <li className="flex items-start gap-2 min-w-0">
                    <Github className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span className="min-w-0 break-words" title={personalInfo.github}>
                      {formatGithubDisplay(personalInfo.github, 28)}
                    </span>
                  </li>
                )}
              </ul>
            </section>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <section className="mb-5">
              <SectionIcon icon={Wrench} label="Skills" color={primaryColor} />
              <p className="text-[11px] text-gray-700 leading-relaxed">
                {skills.map((s) => s.name).join(" · ")}
              </p>
            </section>
          )}

          {/* Projects as "Key Achievements" in sidebar */}
          {data.projects && data.projects.length > 0 && (
            <section className="mb-5">
              <SectionIcon icon={Award} label="Key Achievements" color={primaryColor} />
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div key={project.id} className="flex items-start gap-2">
                    <span
                      className="mt-[5px] w-[6px] h-[6px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-gray-900">{project.name}</p>
                      {project.description && (
                        <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hobbies / Interests */}
          {data.hobbies && data.hobbies.length > 0 && (
            <section className="mb-5">
              <SectionIcon icon={Heart} label="Interests" color={primaryColor} />
              <div className="space-y-2.5">
                {data.hobbies.map((hobby) => (
                  <div key={hobby.id} className="flex items-start gap-2">
                    <span
                      className="mt-[5px] w-[6px] h-[6px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-gray-900">{hobby.name}</p>
                      {hobby.description && (
                        <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">
                          {hobby.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Extra-curricular */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section>
              <SectionIcon icon={User} label="Activities" color={primaryColor} />
              <div className="space-y-2.5">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2">
                    <span
                      className="mt-[5px] w-[6px] h-[6px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <div>
                      <p className="text-[11px] font-semibold text-gray-900">
                        {activity.title}
                        {activity.organization && (
                          <span className="font-normal text-gray-500"> — {activity.organization}</span>
                        )}
                      </p>
                      {activity.description && activity.description[0] && (
                        <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">
                          {activity.description[0]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>

        {/* ─── Main Content ─── */}
        <TemplateMain className="flex-1 min-w-0 px-8 py-6">
          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionIcon icon={User} label="Summary" color={primaryColor} />
              <p className="text-[12px] text-gray-700 leading-relaxed">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionIcon icon={Briefcase} label="Experience" color={primaryColor} />
              <div className="space-y-4">
                {sortedExperience.map((exp) => (
                  <article key={exp.id} style={{ breakInside: "avoid" }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[13px] font-bold text-gray-900">{exp.company}</h3>
                        <p className="text-[12px] text-gray-700">{exp.position}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        {exp.location && (
                          <p className="text-[11px] text-gray-500">{exp.location}</p>
                        )}
                        <p className="text-[11px] text-gray-500">
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
                        </p>
                      </div>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-700">
                                <span className="mt-[6px] w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            )
                        )}
                      </ul>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-800">
                                <span className="mt-[6px] w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                                <span className="font-medium">{achievement}</span>
                              </li>
                            )
                        )}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionIcon icon={GraduationCap} label="Education" color={primaryColor} />
              <div className="space-y-3">
                {sortedEducation.map((edu) => (
                  <article key={edu.id} style={{ breakInside: "avoid" }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-[13px] font-bold text-gray-900">{edu.institution}</h3>
                        <p className="text-[12px] text-gray-700">
                          {edu.degree}{edu.field && ` in ${edu.field}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        {edu.location && (
                          <p className="text-[11px] text-gray-500">{edu.location}</p>
                        )}
                        <p className="text-[11px] text-gray-500">
                          {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
                        </p>
                      </div>
                    </div>
                    {edu.gpa && (
                      <p className="text-[11px] text-gray-500 mt-0.5">Grade: {edu.gpa}</p>
                    )}
                    {edu.description && edu.description.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {edu.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex items-start gap-2 text-[11px] text-gray-700">
                                <span className="mt-[6px] w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            )
                        )}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Training / Courses */}
          {courses.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionIcon icon={BookOpen} label="Training / Courses" color={primaryColor} />
              <div className="grid grid-cols-2 gap-3">
                {courses.map((course) => (
                  <div key={course.id} style={{ breakInside: "avoid" }}>
                    <p className="text-[11px] font-semibold text-gray-900">{course.name}</p>
                    {course.description && (
                      <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">
                        {course.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionIcon icon={Award} label="Certifications" color={primaryColor} />
              <div className="space-y-2">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-2">
                    <span
                      className="mt-[5px] w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="text-[11px] text-gray-800">
                      <span className="font-semibold">{cert.name}</span>
                      {cert.issuer && <span className="text-gray-500"> — {cert.issuer}</span>}
                      {cert.date && <span className="text-gray-400"> ({formatDate(cert.date)})</span>}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <SectionIcon icon={Languages} label="Languages" color={primaryColor} />
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-3">
                    <span className="text-[11px] font-medium text-gray-900 uppercase tracking-wide">
                      {lang.name}
                    </span>
                    <span className="text-[10px] text-gray-500 capitalize">{lang.level}</span>
                    <span className="flex gap-[3px]">
                      {languageDots(lang.level).map((filled, i) => (
                        <span
                          key={i}
                          className="w-[6px] h-[6px] rounded-full"
                          style={{
                            backgroundColor: filled ? primaryColor : `${primaryColor}30`,
                          }}
                        />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Custom Sections */}
          {data.customSections && data.customSections.length > 0 && (
            <>
              {data.customSections.map((section) => (
                <section key={section.id} style={{ marginBottom: `${sectionSpacing}px` }}>
                  <SectionIcon icon={BookOpen} label={section.title || "Custom Section"} color={primaryColor} />
                  <div className="space-y-2">
                    {(section.items || []).map((item) => (
                      <article key={item.id} style={{ breakInside: "avoid" }}>
                        <h3 className="text-[12px] font-bold text-gray-900">{item.title}</h3>
                        {(item.date || item.location) && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {item.date}{item.date && item.location ? " · " : ""}{item.location}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-[10px] text-gray-700 mt-0.5">{item.description}</p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}

          {/* Empty State */}
          {!personalInfo.firstName &&
            workExperience.length === 0 &&
            education.length === 0 &&
            skills.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg mb-2">Your resume preview will appear here</p>
                <p className="text-sm">
                  Start filling out the form to see your resume come to life
                </p>
              </div>
            )}
        </TemplateMain>
      </div>
    </div>
  );
}
