"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";

interface CascadeTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Cascade Template - Sidebar with Skill Progress Bars
 *
 * Two-column layout (30/70) with skill progress bars in sidebar.
 * Inspired by Zety's Cascade template.
 */
export function CascadeTemplate({ data, customization }: CascadeTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const primaryColor = customization?.primaryColor || "#1e40af";
  const secondaryColor = customization?.accentColor || customization?.secondaryColor || "#3b82f6";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing || 20;

  const levelToPercent: Record<string, number> = {
    beginner: 25, intermediate: 50, advanced: 75, expert: 95,
  };

  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") return "'Georgia', serif";
    if (customization?.fontFamily === "mono") return "'Courier New', monospace";
    return "'Inter', system-ui, sans-serif";
  };

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  return (
    <div className="w-full bg-white text-gray-800 min-h-[297mm]" style={{ fontFamily: getFontFamily() }}>
      <div className="flex">
        {/* Sidebar - 30% */}
        <aside className="w-[30%] flex-shrink-0 text-white min-h-[297mm]" style={{ backgroundColor: primaryColor }}>
          <div className="p-6">
            {/* Photo */}
            {personalInfo.photo && (
              <div className="mb-6 flex justify-center">
                <Image
                  src={personalInfo.photo}
                  alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                  unoptimized
                />
              </div>
            )}

            {/* Contact */}
            <div className="mb-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 border-b border-white/20 pb-2">
                Contact
              </h2>
              <div className="space-y-2 text-xs">
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-white/50" />
                    <span className="break-all">{personalInfo.email}</span>
                  </div>
                )}
                {personalInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-white/50" />
                    <span>{personalInfo.phone}</span>
                  </div>
                )}
                {personalInfo.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-white/50" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-white/50" />
                    <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-3 h-3 text-white/50" />
                    <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center gap-2">
                    <Github className="w-3 h-3 text-white/50" />
                    <span className="break-all">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills with Progress Bars */}
            {Object.keys(skillsByCategory).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 border-b border-white/20 pb-2">
                  Skills
                </h2>
                <div className="space-y-3">
                  {Object.entries(skillsByCategory).slice(0, 3).map(([category, categorySkills]) => (
                    <div key={category}>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-2">{category}</p>
                      <div className="space-y-2">
                        {categorySkills.slice(0, 4).map((skill) => {
                          const percent = skill.level ? levelToPercent[skill.level] : 70;
                          return (
                            <div key={skill.id}>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{skill.name}</span>
                              </div>
                              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ width: `${percent}%`, backgroundColor: secondaryColor }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 border-b border-white/20 pb-2">
                  Languages
                </h2>
                <div className="space-y-2">
                  {data.languages.map((lang) => {
                    const levelPercent = { basic: 25, conversational: 50, fluent: 75, native: 100 }[lang.level] || 50;
                    return (
                      <div key={lang.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{lang.name}</span>
                          <span className="text-white/50 capitalize">{lang.level}</span>
                        </div>
                        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${levelPercent}%`, backgroundColor: secondaryColor }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {data.hobbies && data.hobbies.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 border-b border-white/20 pb-2">
                  Interests
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {data.hobbies.map((hobby) => (
                    <span key={hobby.id} className="text-xs px-2 py-1 bg-white/10 rounded">
                      {hobby.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content - 70% */}
        <main className="flex-1 p-8" style={baseTextStyle}>
          {/* Header */}
          <header className="mb-6 pb-4 border-b-2" style={{ borderColor: primaryColor }}>
            <h1 className="text-3xl font-bold text-gray-900">
              {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
            </h1>
            {personalInfo.jobTitle && (
              <p className="text-lg mt-1" style={{ color: primaryColor }}>{personalInfo.jobTitle}</p>
            )}
          </header>

          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <p className="text-sm text-gray-600 leading-relaxed">{personalInfo.summary}</p>
            </section>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b" style={{ color: primaryColor }}>
                Professional Experience
              </h2>
              <div className="space-y-5">
                {sortedExperience.map((exp, index) => (
                  <div key={exp.id} className="relative pl-4" style={{ borderLeft: `3px solid ${index === 0 ? primaryColor : '#e5e7eb'}` }}>
                    <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-white border-2" style={{ borderColor: primaryColor }} />
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-sm" style={{ color: primaryColor }}>
                          {exp.company}{exp.location && ` · ${exp.location}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        {exp.description.map((item, idx) => item.trim() && (
                          <li key={idx} className="flex gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: secondaryColor }} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b" style={{ color: primaryColor }}>
                Education
              </h2>
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="pl-4" style={{ borderLeft: '3px solid #e5e7eb' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {edu.degree}{edu.field && ` in ${edu.field}`}
                        </p>
                        <p className="text-sm" style={{ color: primaryColor }}>{edu.institution}</p>
                        {edu.gpa && <p className="text-xs text-gray-500 mt-1">Grade: {edu.gpa}</p>}
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

          {/* Certifications */}
          {data.certifications && data.certifications.filter(c => c.type !== "course").length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b" style={{ color: primaryColor }}>
                Certifications
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {data.certifications.filter(c => c.type !== "course").map((cert) => (
                  <div key={cert.id} className="flex gap-2 text-sm">
                    <span style={{ color: primaryColor }}>●</span>
                    <div>
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      {cert.issuer && <p className="text-xs text-gray-500">{cert.issuer}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b" style={{ color: primaryColor }}>
                Projects
              </h2>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.map((tech, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
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
      </div>
    </div>
  );
}
