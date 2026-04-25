import { renderFormattedText, renderSummaryText } from "@/lib/utils/format-text";
import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import { getTemplateFontFamily } from "@/lib/fonts/template-fonts";
import { ProfilePhoto } from "./shared/profile-photo";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  cn,
  groupSkillsByCategory,
  getCertifications,
  getAllCourses,
} from "@/lib/utils";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from "lucide-react";
import { TemplateCustomization } from "../template-customizer";
import { TemplateMain, TemplateH1 } from "./shared/template-preview-context";
import {
  TemplateBulletList,
  TemplateChipList,
  TemplateContactLine,
} from "./shared";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  normalizeUrl,
} from "@/lib/utils/contact-display";

interface ModernTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

function ModernSectionHeading({ title, primaryColor }: { title: string; primaryColor: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-0.5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
      <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-700 whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px" style={{ backgroundColor: `${primaryColor}20` }} />
    </div>
  );
}

export function ModernTemplate({ data, customization }: ModernTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const skillsByCategory = groupSkillsByCategory(skills);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Deep teal and warm accent - distinctive color palette
  const primaryColor = customization?.primaryColor || "#0d9488";
  const secondaryColor = customization?.secondaryColor || customization?.accentColor || "#14b8a6";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.55;
  const baseTextStyle: CSSProperties | undefined = customization
    ? { fontSize: `${baseFontSize}px`, lineHeight: baseLineSpacing }
    : { fontSize: "13px", lineHeight: 1.55 };
  const bulletStyle: CSSProperties | undefined = { color: secondaryColor };
  const sectionSpacing = customization?.sectionSpacing || 20;

  const topSkillCategories = Object.entries(skillsByCategory).slice(0, 4);

  const fontFamily = getTemplateFontFamily(customization, "professional");

  return (
    <div
      className="w-full bg-white text-gray-800"
      style={{ fontFamily: fontFamily }}
    >
      <div className="flex" style={{ minHeight: "297mm" }}>
        {/* Sidebar */}
        <aside
          className="w-72 flex-shrink-0 p-8 text-white"
          style={{
            backgroundColor: primaryColor,
            backgroundImage: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}ee 100%)`,
          }}
        >
          {/* Photo */}
          {personalInfo.photo && (
            <div className="mb-6 flex justify-center">
              <ProfilePhoto
                photo={personalInfo.photo}
                firstName={personalInfo.firstName}
                lastName={personalInfo.lastName}
                size={112}
                shape="circular"
                className="border-4 border-white/30"
              />
            </div>
          )}

          {/* Name & Title */}
          <div className="mb-8">
            <TemplateH1 className="text-3xl font-bold tracking-tight mb-2">
              {personalInfo.firstName || "Your"}
              <br />
              {personalInfo.lastName || "Name"}
            </TemplateH1>
            {personalInfo.jobTitle && (
              <p className="text-sm font-semibold text-white/90 uppercase tracking-wider mt-1">
                {personalInfo.jobTitle}
              </p>
            )}
            {personalInfo.summary && (
              <p className="text-sm text-white/80 leading-relaxed mt-4">
                {renderSummaryText(personalInfo.summary)}
              </p>
            )}
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60 mb-4">
              Contact
            </h2>
            <div className="space-y-3 text-sm min-w-0">
              {personalInfo.email && (
                <TemplateContactLine
                  icon={Mail}
                  iconClassName="text-white/60"
                >
                  <a title={personalInfo.email} href={`mailto:${personalInfo.email}`} target="_blank" rel="noopener noreferrer">
                    {formatEmailDisplay(personalInfo.email, 32)}
                  </a>
                </TemplateContactLine>
              )}
              {personalInfo.phone && (
                <TemplateContactLine
                  icon={Phone}
                  iconClassName="text-white/60"
                >
                  {personalInfo.phone}
                </TemplateContactLine>
              )}
              {personalInfo.location && (
                <TemplateContactLine
                  icon={MapPin}
                  iconClassName="text-white/60"
                >
                  {personalInfo.location}
                </TemplateContactLine>
              )}
              {personalInfo.website && (
                <TemplateContactLine
                  icon={Globe}
                  iconClassName="text-white/60"
                >
                  <a className="text-white/90" title={personalInfo.website} href={normalizeUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer">
                    {formatWebsiteDisplay(personalInfo.website, 32)}
                  </a>
                </TemplateContactLine>
              )}
              {personalInfo.linkedin && (
                <TemplateContactLine
                  icon={Linkedin}
                  iconClassName="text-white/60"
                >
                  <a className="text-white/90" title={personalInfo.linkedin} href={normalizeUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer">
                    {formatLinkedinDisplay(personalInfo.linkedin, 32)}
                  </a>
                </TemplateContactLine>
              )}
              {personalInfo.github && (
                <TemplateContactLine
                  icon={Github}
                  iconClassName="text-white/60"
                >
                  <a className="text-white/90" title={personalInfo.github} href={normalizeUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer">
                    {formatGithubDisplay(personalInfo.github, 32)}
                  </a>
                </TemplateContactLine>
              )}
            </div>
          </div>

          {/* Skills */}
          {topSkillCategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60 mb-4">
                Skills
              </h2>
              <div className="space-y-4">
                {topSkillCategories.map(([category, categorySkills]) => (
                  <div key={category}>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">
                      {category}
                    </p>
                    <TemplateChipList
                      items={categorySkills.map((skill) => ({
                        key: skill.id,
                        label: skill.name,
                      }))}
                      chipClassName="border border-white/20 text-white/80 bg-white/5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60 mb-4">
                Languages
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-sm">
                    <span>{lang.name}</span>
                    <span className="text-white/60 text-xs capitalize">{lang.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60 mb-4">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.hobbies.map((hobby) => (
                  <span
                    key={hobby.id}
                    className="text-sm text-white/80"
                  >
                    {hobby.name}
                    {data.hobbies && data.hobbies.indexOf(hobby) < data.hobbies.length - 1 && (
                      <span className="mx-2 text-white/30">·</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <TemplateMain
          className="flex-1 p-10"
          style={{ ...baseTextStyle, marginBottom: sectionSpacing }}
        >
          {/* Experience Section */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <ModernSectionHeading title="Professional Experience" primaryColor={primaryColor} />

              <div className="space-y-8">
                {sortedExperience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="relative pl-6"
                    style={{
                      borderLeft: `2px solid ${primaryColor}30`,
                    }}
                  >
                    <div
                      className="absolute -left-[5px] top-[7px] w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: index === 0 ? primaryColor : `${primaryColor}70` }}
                    />
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {exp.position}
                        </h3>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {exp.company}
                          {exp.location && (
                            <span className="text-gray-500"> · {exp.location}</span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4 tracking-wide font-medium">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>

                    {exp.description.length > 0 && (
                      <TemplateBulletList
                        items={exp.description}
                        className="text-sm text-gray-600 mt-3"
                        renderBullet={() => (
                          <span
                            className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: secondaryColor }}
                          />
                        )}
                      />
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div
                        className="mt-3 p-3 rounded-lg text-sm"
                        style={{ backgroundColor: `${primaryColor}08` }}
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-wider mb-2"
                          style={{ color: primaryColor }}
                        >
                          Key Achievements
                        </p>
                        <TemplateBulletList
                          items={exp.achievements}
                          className="space-y-1 text-gray-700"
                          renderBullet={() => <span style={bulletStyle}>✓</span>}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {sortedEducation.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <ModernSectionHeading title="Education" primaryColor={primaryColor} />

              <div className="space-y-6">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="relative pl-6" style={{ borderLeft: `2px solid ${primaryColor}25` }}>
                    <div
                      className="absolute -left-[5px] top-[7px] w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: `${primaryColor}60` }}
                    />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {edu.degree}
                          {edu.field && <span className="font-normal text-gray-600"> in {edu.field}</span>}
                        </p>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {edu.institution}
                          {edu.location && <span className="text-gray-500"> · {edu.location}</span>}
                        </p>
                        {edu.gpa && (
                          <p className="text-xs text-gray-500 mt-1">Grade: {edu.gpa}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4 tracking-wide font-medium">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                    {edu.description && edu.description.length > 0 && (
                      <TemplateBulletList
                        items={edu.description}
                        className="text-sm text-gray-600 mt-2 space-y-1"
                        renderBullet={() => (
                          <span
                            className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ backgroundColor: secondaryColor }}
                          />
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section */}
          {data.projects && data.projects.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <ModernSectionHeading title="Projects" primaryColor={primaryColor} />

              <div className="flex flex-wrap gap-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors flex-1 min-w-[250px]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.url && (
                        <span className="text-xs" style={{ color: primaryColor }}>
                          ↗
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{renderFormattedText(project.description)}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${primaryColor}10`,
                              color: primaryColor,
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

          {/* Certifications (excluding courses) */}
          {(() => {
            const certs = getCertifications(data);
            return certs.length > 0 && (
              <section style={{ marginBottom: `${sectionSpacing}px` }}>
                <ModernSectionHeading title="Certifications" primaryColor={primaryColor} />

                <div className="space-y-3">
                  {certs.map((cert) => (
                    <div key={cert.id} className="flex gap-3 text-sm items-start">
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}10` }}
                      >
                        <span style={{ color: primaryColor }}>✓</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        {(cert.issuer || cert.date) && (
                          <p className="text-xs text-gray-500">
                            {cert.issuer}
                            {cert.date && cert.issuer ? " · " : ""}
                            {cert.date && formatDate(cert.date)}
                          </p>
                        )}
                        {cert.url && (
                          <p className="text-xs" style={{ color: primaryColor }}>
                            {cert.url}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Courses (from certifications with type="course" or legacy data.courses) */}
          {(() => {
            const allCourses = getAllCourses(data);
            return allCourses.length > 0 && (
              <section style={{ marginBottom: `${sectionSpacing}px` }}>
                <ModernSectionHeading title="Courses" primaryColor={primaryColor} />

                <div className="flex flex-wrap gap-4">
                  {allCourses.map((course) => (
                    <div key={course.id} className="flex gap-3 text-sm flex-1 min-w-[200px]">
                      <div className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: `${primaryColor}10` }}>
                        <span style={{ color: primaryColor }}>✓</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{course.name}</p>
                        {course.institution && (
                          <p className="text-gray-500 text-xs">{course.institution}</p>
                        )}
                        {course.date && (
                          <p className="text-gray-400 text-xs mt-1">
                            {formatDate(course.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Extra-curricular */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section>
              <ModernSectionHeading title="Activities" primaryColor={primaryColor} />

              <div className="space-y-4">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id} className="relative pl-6" style={{ borderLeft: `2px solid ${primaryColor}25` }}>
                    <div className="absolute -left-[5px] top-[7px] w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: `${primaryColor}50` }} />
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{activity.title}</p>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {activity.organization}
                          {activity.role && <span className="text-gray-500"> · {activity.role}</span>}
                        </p>
                      </div>
                      {(activity.startDate || activity.endDate) && (
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {activity.startDate && formatDate(activity.startDate)} — {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                        </span>
                      )}
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-600 mt-2">
                        {activity.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} />
                                <span>{renderFormattedText(item)}</span>
                              </li>
                            )
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Custom Sections */}
          {data.customSections && data.customSections.length > 0 && (
            <section style={{ marginTop: `${sectionSpacing}px` }}>
              {data.customSections.map((section) => (
                <div key={section.id} className="mb-6">
                  <ModernSectionHeading title={section.title || "Custom Section"} primaryColor={primaryColor} />
                  <div className="space-y-2 pl-6" style={{ borderLeft: `2px solid ${primaryColor}25` }}>
                    {(section.items || []).map((item) => (
                      <div key={item.id}>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {(item.date || item.location) && (
                          <p className="text-xs text-gray-500">
                            {item.date}
                            {item.date && item.location ? " · " : ""}
                            {item.location}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {renderFormattedText(item.description)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
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
