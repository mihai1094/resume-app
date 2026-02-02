"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
  cn,
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

interface ModernTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Modern Template - Clean Two-Column Layout
 *
 * A contemporary design with a clear visual hierarchy, accent colors,
 * and optimal use of whitespace. Features a sidebar for contact info
 * and skills, with the main content area for experience and education.
 */
export function ModernTemplate({ data, customization }: ModernTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Deep teal and warm accent - distinctive color palette
  const primaryColor = customization?.primaryColor || "#0d9488";
  const secondaryColor = customization?.secondaryColor || "#14b8a6";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.55;
  const baseTextStyle: CSSProperties | undefined = customization
    ? { fontSize: `${baseFontSize}px`, lineHeight: baseLineSpacing }
    : { fontSize: "13px", lineHeight: 1.55 };
  const bulletStyle: CSSProperties | undefined = { color: secondaryColor };
  const sectionSpacing = customization?.sectionSpacing || 20;

  const topSkillCategories = Object.entries(skillsByCategory).slice(0, 4);

  // Font family mapping
  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") {
      return "'Georgia', 'Times New Roman', serif";
    } else if (customization?.fontFamily === "mono") {
      return "'Courier New', 'Courier', monospace";
    } else if (customization?.fontFamily === "sans") {
      return "'Inter', 'Helvetica Neue', Arial, sans-serif";
    } else if (customization?.fontFamily) {
      return customization.fontFamily;
    }
    return "'Inter', system-ui, sans-serif";
  };

  return (
    <div
      className="w-full bg-white text-gray-800 min-h-[297mm]"
      style={{ fontFamily: getFontFamily() }}
    >
      <div className="flex">
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
              <Image
                src={personalInfo.photo}
                alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                width={112}
                height={112}
                className="w-28 h-28 rounded-full object-cover border-4 border-white/30"
                unoptimized
              />
            </div>
          )}

          {/* Name & Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {personalInfo.firstName || "Your"}
              <br />
              {personalInfo.lastName || "Name"}
            </h1>
            {personalInfo.summary && (
              <p className="text-sm text-white/80 leading-relaxed mt-4">
                {personalInfo.summary.length > 150
                  ? personalInfo.summary.slice(0, 150) + "..."
                  : personalInfo.summary}
              </p>
            )}
          </div>

          {/* Contact */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60 mb-4">
              Contact
            </h2>
            <div className="space-y-3 text-sm">
              {personalInfo.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-white/60" />
                  <span className="break-all">{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-white/60" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-white/60" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 mt-0.5 text-white/60" />
                  <span className="break-all text-white/90">
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-start gap-3">
                  <Linkedin className="w-4 h-4 mt-0.5 text-white/60" />
                  <span className="break-all text-white/90">
                    {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-start gap-3">
                  <Github className="w-4 h-4 mt-0.5 text-white/60" />
                  <span className="break-all text-white/90">
                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                </div>
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
                    <p className="text-xs text-white/50 uppercase tracking-wider mb-1.5">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2 py-1 text-xs rounded bg-white/10 text-white/90"
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
        <main
          className="flex-1 p-10"
          style={{ ...baseTextStyle, marginBottom: sectionSpacing }}
        >
          {/* Experience Section */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Professional Experience
                </h2>
              </div>

              <div className="space-y-8">
                {sortedExperience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="relative pl-6"
                    style={{
                      borderLeft: `2px solid ${index === 0 ? primaryColor : '#e5e7eb'}`,
                    }}
                  >
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
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4 bg-gray-50 px-2 py-1 rounded">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>

                    {exp.description.length > 0 && (
                      <ul className="space-y-1.5 text-sm text-gray-600 mt-3">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span
                                  className="mt-2 w-1 h-1 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: secondaryColor }}
                                />
                                <span>{item}</span>
                              </li>
                            )
                        )}
                      </ul>
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
                        <ul className="space-y-1 text-gray-700">
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <li key={idx} className="flex gap-2">
                                  <span style={bulletStyle}>✓</span>
                                  <span>{achievement}</span>
                                </li>
                              )
                          )}
                        </ul>
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
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Education
                </h2>
              </div>

              <div className="space-y-6">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="pl-6" style={{ borderLeft: `2px solid #e5e7eb` }}>
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
                          <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4 bg-gray-50 px-2 py-1 rounded">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                    {edu.description && edu.description.length > 0 && (
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        {edu.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span className="mt-2 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} />
                                <span>{item}</span>
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

          {/* Projects Section */}
          {data.projects && data.projects.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Projects
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.url && (
                        <span className="text-xs" style={{ color: primaryColor }}>
                          ↗
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
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
            const certs = data.certifications?.filter(c => c.type !== "course") || [];
            return certs.length > 0 && (
              <section style={{ marginBottom: `${sectionSpacing}px` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Certifications
                  </h2>
                </div>

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
            const coursesFromCerts = data.certifications?.filter(c => c.type === "course") || [];
            const legacyCourses = data.courses || [];
            const allCourses = [...coursesFromCerts.map(c => ({
              id: c.id,
              name: c.name,
              institution: c.issuer,
              date: c.date,
              credentialId: c.credentialId,
              url: c.url,
            })), ...legacyCourses];
            return allCourses.length > 0 && (
              <section style={{ marginBottom: `${sectionSpacing}px` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${primaryColor}15` }}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Courses
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {allCourses.map((course) => (
                    <div key={course.id} className="flex gap-3 text-sm">
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
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Leadership & Activities
                </h2>
              </div>

              <div className="space-y-4">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id} className="pl-6" style={{ borderLeft: `2px solid #e5e7eb` }}>
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
                                <span>{item}</span>
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
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.title || "Custom Section"}
                    </h3>
                  </div>
                  <div className="space-y-2 pl-6" style={{ borderLeft: `2px solid #e5e7eb` }}>
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
                            {item.description}
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
        </main>
      </div>
    </div>
  );
}
