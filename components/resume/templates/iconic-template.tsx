"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
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

interface IconicTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Iconic Template - Bold Headers with Distinctive Styling
 *
 * A creative yet professional two-column layout featuring:
 * - Bold, impactful section headers with geometric accents
 * - Circular photo display in the sidebar
 * - Good ATS compatibility despite creative elements
 * - Ideal for creative/engineering roles
 */
export function IconicTemplate({ data, customization }: IconicTemplateProps) {
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

  // Bold indigo and vibrant accent - distinctive color palette
  const primaryColor = customization?.primaryColor || "#4338ca";
  const secondaryColor = customization?.secondaryColor || "#7c3aed";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 24;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

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
          className="w-[280px] flex-shrink-0 min-h-[297mm] text-white relative overflow-hidden"
          style={{
            backgroundColor: primaryColor,
          }}
        >
          {/* Decorative geometric pattern */}
          <div
            className="absolute top-0 right-0 w-32 h-32 opacity-10"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
              )`,
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-full h-48 opacity-5"
            style={{
              background: `radial-gradient(circle at 0% 100%, ${secondaryColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10 p-8">
            {/* Photo */}
            {personalInfo.photo && (
              <div className="mb-6 flex justify-center">
                <div
                  className="relative"
                  style={{
                    padding: "4px",
                    background: `linear-gradient(135deg, ${secondaryColor} 0%, rgba(255,255,255,0.3) 100%)`,
                    borderRadius: "50%",
                  }}
                >
                  <Image
                    src={personalInfo.photo} width={96} height={96} unoptimized
                    alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                    className="w-28 h-28 rounded-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Name & Title */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-black tracking-tight mb-1 uppercase">
                {personalInfo.firstName || "Your"}
              </h1>
              <h1 className="text-2xl font-black tracking-tight mb-3 uppercase">
                {personalInfo.lastName || "Name"}
              </h1>
              {personalInfo.jobTitle && (
                <p
                  className="text-sm font-medium px-3 py-1 rounded-full inline-block"
                  style={{ backgroundColor: secondaryColor }}
                >
                  {personalInfo.jobTitle}
                </p>
              )}
            </div>

            {/* Contact */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-1 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  Contact
                </h2>
              </div>
              <div className="space-y-3 text-sm">
                {personalInfo.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-0.5 text-white/60" />
                    <span className="break-all text-white/90">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 mt-0.5 text-white/60" />
                    <span className="text-white/90">{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-white/60" />
                    <span className="text-white/90">{personalInfo.location}</span>
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
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-1 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                    Skills
                  </h2>
                </div>
                <div className="space-y-4">
                  {topSkillCategories.map(([category, categorySkills]) => (
                    <div key={category}>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2 font-semibold">
                        {category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {categorySkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 text-xs rounded-md bg-white/10 text-white/90 border border-white/10"
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
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-1 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                    Languages
                  </h2>
                </div>
                <div className="space-y-2">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between text-sm">
                      <span className="text-white/90">{lang.name}</span>
                      <span className="text-white/50 text-xs capitalize">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {data.hobbies && data.hobbies.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-1 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                    Interests
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.hobbies.map((hobby, index) => (
                    <span key={hobby.id} className="text-sm text-white/80">
                      {hobby.name}
                      {data.hobbies && index < data.hobbies.length - 1 && (
                        <span className="mx-1.5 text-white/30">|</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10" style={baseTextStyle}>
          {/* Summary Section */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  01
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                  Profile
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed pl-[60px]">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {/* Experience Section */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  02
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                  Experience
                </h2>
              </div>

              <div className="space-y-6 pl-[60px]">
                {sortedExperience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className="relative pl-5"
                    style={{
                      borderLeft: `3px solid ${index === 0 ? primaryColor : '#e5e7eb'}`,
                    }}
                  >
                    {/* Position indicator */}
                    <div
                      className="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 bg-white"
                      style={{ borderColor: index === 0 ? primaryColor : '#e5e7eb' }}
                    />

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {exp.position}
                        </h3>
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                          {exp.company}
                          {exp.location && (
                            <span className="text-gray-400 font-normal"> | {exp.location}</span>
                          )}
                        </p>
                      </div>
                      <span
                        className="text-xs font-medium whitespace-nowrap ml-4 px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${primaryColor}10`,
                          color: primaryColor,
                        }}
                      >
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>

                    {exp.description.length > 0 && (
                      <ul className="space-y-1.5 text-sm text-gray-600 mt-3">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span
                                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
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
                        className="mt-3 p-3 rounded-lg text-sm border-l-4"
                        style={{
                          backgroundColor: `${primaryColor}05`,
                          borderLeftColor: secondaryColor,
                        }}
                      >
                        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>
                          Key Achievements
                        </p>
                        <ul className="space-y-1 text-gray-700">
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <li key={idx} className="flex gap-2">
                                  <span style={{ color: secondaryColor }}>★</span>
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
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  03
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                  Education
                </h2>
              </div>

              <div className="space-y-5 pl-[60px]">
                {sortedEducation.map((edu) => (
                  <div
                    key={edu.id}
                    className="pl-5"
                    style={{ borderLeft: `3px solid #e5e7eb` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-base font-bold text-gray-900">
                          {edu.degree}
                          {edu.field && <span className="font-normal text-gray-600"> in {edu.field}</span>}
                        </p>
                        <p className="text-sm font-semibold" style={{ color: primaryColor }}>
                          {edu.institution}
                          {edu.location && <span className="text-gray-400 font-normal"> | {edu.location}</span>}
                        </p>
                        {edu.gpa && (
                          <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <span
                        className="text-xs font-medium whitespace-nowrap ml-4 px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: `${primaryColor}10`,
                          color: primaryColor,
                        }}
                      >
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </span>
                    </div>
                    {edu.description && edu.description.length > 0 && (
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        {edu.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} />
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
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  04
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                  Projects
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pl-[60px]">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors bg-gray-50/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{project.name}</h3>
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
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    05
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                    Certifications
                  </h2>
                </div>

                <div className="space-y-3 pl-[60px]">
                  {certs.map((cert) => (
                    <div key={cert.id} className="flex gap-3 text-sm items-start">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}10` }}
                      >
                        <span style={{ color: primaryColor }} className="font-bold">✓</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{cert.name}</p>
                        {(cert.issuer || cert.date) && (
                          <p className="text-xs text-gray-500">
                            {cert.issuer}
                            {cert.date && cert.issuer ? " | " : ""}
                            {cert.date && formatDate(cert.date)}
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
            })), ...legacyCourses];
            return allCourses.length > 0 && (
              <section style={{ marginBottom: `${sectionSpacing}px` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    06
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                    Courses
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 pl-[60px]">
                  {allCourses.map((course) => (
                    <div key={course.id} className="flex gap-3 text-sm">
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}10` }}
                      >
                        <span style={{ color: primaryColor }}>✓</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{course.name}</p>
                        {course.institution && (
                          <p className="text-gray-500 text-xs">{course.institution}</p>
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
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  07
                </div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                  Leadership & Activities
                </h2>
              </div>

              <div className="space-y-4 pl-[60px]">
                {data.extraCurricular.map((activity) => (
                  <div
                    key={activity.id}
                    className="pl-5"
                    style={{ borderLeft: `3px solid #e5e7eb` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900">{activity.title}</p>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {activity.organization}
                          {activity.role && <span className="text-gray-400"> | {activity.role}</span>}
                        </p>
                      </div>
                      {(activity.startDate || activity.endDate) && (
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {activity.startDate && formatDate(activity.startDate)} - {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                        </span>
                      )}
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-600 mt-2">
                        {activity.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} />
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
              {data.customSections.map((section, sectionIndex) => (
                <div key={section.id} className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-lg text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {String(8 + sectionIndex).padStart(2, "0")}
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-wide">
                      {section.title || "Custom Section"}
                    </h3>
                  </div>
                  <div className="space-y-3 pl-[60px]">
                    {(section.items || []).map((item) => (
                      <div key={item.id} className="pl-5" style={{ borderLeft: `3px solid #e5e7eb` }}>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        {(item.date || item.location) && (
                          <p className="text-xs text-gray-500">
                            {item.date}
                            {item.date && item.location ? " | " : ""}
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

export default IconicTemplate;
