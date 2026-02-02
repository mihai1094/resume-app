"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface CreativeTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Creative Template - Editorial Magazine Style
 *
 * A bold, asymmetric layout inspired by editorial design and modern magazines.
 * Uses dramatic typography contrasts, geometric accents, and an unconventional
 * grid system to stand out from traditional resume formats.
 */
export function CreativeTemplate({ data, customization }: CreativeTemplateProps) {
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
  const initials = `${personalInfo.firstName?.[0] || ""}${personalInfo.lastName?.[0] || ""}`;

  // Customization with distinctive defaults - warm coral and deep charcoal
  const primaryColor = customization?.primaryColor || "#E85D4C";
  const secondaryColor = customization?.secondaryColor || "#1a1a1a";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 40;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

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
    return "'DM Sans', system-ui, sans-serif";
  };

  return (
    <div
      className="w-full bg-[#FAFAF8] text-[#1a1a1a] min-h-[297mm] relative overflow-hidden"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Geometric Accent - Top Right Corner */}
      <div
        className="absolute top-0 right-0 w-48 h-48"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}00 100%)`,
          clipPath: "polygon(100% 0, 0 0, 100% 100%)",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 p-10">
        {/* Header - Dramatic Typography */}
        <header className="mb-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Photo (if available) */}
              {personalInfo.photo && (
                <div className="mb-4">
                  <Image
                    src={personalInfo.photo}
                    alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                    width={144}
                    height={144}
                    className="w-36 h-36 rounded-lg object-cover"
                    style={{
                      border: `4px solid ${primaryColor}`,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    }}
                    unoptimized
                  />
                </div>
              )}

              {/* Large Initials Accent - only show if no photo */}
              {!personalInfo.photo && (
                <div
                  className="text-[120px] font-black leading-none -mb-6 -ml-2 select-none"
                  style={{
                    color: primaryColor,
                    opacity: 0.15,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {initials}
                </div>
              )}

              {/* Name */}
              <h1
                className="text-5xl font-bold tracking-tight relative"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {personalInfo.firstName}
                <br />
                <span style={{ color: primaryColor }}>{personalInfo.lastName}</span>
              </h1>

              {/* Summary as Tagline */}
              {personalInfo.summary && (
                <p
                  className="text-lg text-gray-600 mt-4 max-w-md leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {personalInfo.summary}
                </p>
              )}
            </div>

            {/* Contact Card */}
            <div
              className="p-6 min-w-[200px]"
              style={{
                borderLeft: `3px solid ${primaryColor}`,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.02) 100%)',
              }}
            >
              <div className="space-y-3 text-sm">
                {personalInfo.email && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Email
                    </span>
                    <span className="text-gray-800">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Phone
                    </span>
                    <span className="text-gray-800">{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Location
                    </span>
                    <span className="text-gray-800">{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      LinkedIn
                    </span>
                    <span className="text-gray-800" style={{ color: primaryColor }}>
                      {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                    </span>
                  </div>
                )}
                {personalInfo.website && (
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mb-0.5">
                      Portfolio
                    </span>
                    <span style={{ color: primaryColor }}>
                      {personalInfo.website.replace(/^https?:\/\//, "")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid - Asymmetric */}
        <div className="grid grid-cols-12 gap-8" style={baseTextStyle}>
          {/* Left Column - Experience */}
          <main className="col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing}px` }}>
            {/* Experience Section */}
            {sortedExperience.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    01
                  </div>
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Experience
                  </h2>
                </div>

                <div className="space-y-8">
                  {sortedExperience.map((exp, index) => (
                    <div
                      key={exp.id}
                      className="relative pl-6"
                      style={{
                        borderLeft: index === 0 ? `2px solid ${primaryColor}` : '2px solid #e5e5e5',
                      }}
                    >
                      <div className="mb-3">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-lg font-bold text-gray-900">
                            {exp.position}
                          </h3>
                          <span className="text-xs text-gray-500 tabular-nums">
                            {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                          </span>
                        </div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: primaryColor }}
                        >
                          {exp.company}
                          {exp.location && <span className="text-gray-400"> · {exp.location}</span>}
                        </p>
                      </div>

                      {exp.description.length > 0 && (
                        <ul className="space-y-2 text-sm text-gray-600">
                          {exp.description.map(
                            (item, idx) =>
                              item.trim() && (
                                <li key={idx} className="flex gap-3">
                                  <span style={{ color: primaryColor }}>→</span>
                                  <span>{item}</span>
                                </li>
                              )
                          )}
                        </ul>
                      )}

                      {exp.achievements && exp.achievements.length > 0 && (
                        <div className="mt-3 p-3 bg-white border border-gray-100">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                            Key Achievements
                          </p>
                          <ul className="space-y-1 text-sm text-gray-700">
                            {exp.achievements.map(
                              (achievement, idx) =>
                                achievement.trim() && (
                                  <li key={idx} className="flex gap-2">
                                    <span className="font-bold" style={{ color: primaryColor }}>✦</span>
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

            {/* Projects Section */}
            {data.projects && data.projects.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    02
                  </div>
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Projects
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {data.projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 bg-white border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600"
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
          </main>

          {/* Right Column - Skills, Education, etc. */}
          <aside className="col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: `${sectionSpacing * 0.8}px` }}>
            {/* Skills Section */}
            {Object.keys(skillsByCategory).length > 0 && (
              <section className="p-6 bg-white border border-gray-100">
                <h2
                  className="text-lg font-bold mb-4 pb-2 border-b border-gray-100"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Expertise
                </h2>
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <div key={category}>
                      <h3
                        className="text-[10px] uppercase tracking-[0.2em] mb-2"
                        style={{ color: primaryColor }}
                      >
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {categorySkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-3 py-1.5 text-sm bg-[#FAFAF8] text-gray-700 border border-gray-100"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education Section */}
            {sortedEducation.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Education
                </h2>
                <div className="space-y-4">
                  {sortedEducation.map((edu) => (
                    <div
                      key={edu.id}
                      className="pl-4"
                      style={{ borderLeft: `2px solid ${primaryColor}` }}
                    >
                      <h3 className="font-bold text-gray-900">
                        {edu.degree}
                        {edu.field && <span className="font-normal text-gray-600"> in {edu.field}</span>}
                      </h3>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Languages
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="text-sm">
                      <span className="font-medium text-gray-900">{lang.name}</span>
                      <span className="text-gray-400 ml-2 text-xs">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
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
                <section>
                  <h2
                    className="text-lg font-bold mb-4"
                    style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  >
                    Certifications
                  </h2>
                  <div className="space-y-3">
                    {allCourses.map((course) => (
                      <div key={course.id} className="text-sm">
                        <p className="font-medium text-gray-900">{course.name}</p>
                        {course.institution && (
                          <p className="text-gray-500">{course.institution}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Hobbies/Interests */}
            {data.hobbies && data.hobbies.length > 0 && (
              <section>
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.hobbies.map((hobby) => (
                    <span
                      key={hobby.id}
                      className="text-sm text-gray-600"
                    >
                      {hobby.name}
                      {data.hobbies && data.hobbies.indexOf(hobby) < data.hobbies.length - 1 && (
                        <span className="mx-2" style={{ color: primaryColor }}>·</span>
                      )}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>

        {/* Extra-curricular - Full Width */}
        {data.extraCurricular && data.extraCurricular.length > 0 && (
          <section className="pt-8 border-t border-gray-200" style={{ marginTop: `${sectionSpacing}px` }}>
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                03
              </div>
              <h2
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Leadership & Activities
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {data.extraCurricular.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div
                    className="w-1 flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{activity.title}</h3>
                    <p className="text-sm text-gray-600">
                      {activity.organization}
                      {activity.role && <span className="text-gray-400"> · {activity.role}</span>}
                    </p>
                    {activity.description && activity.description.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.description[0]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: primaryColor }}
      />

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
    </div>
  );
}
