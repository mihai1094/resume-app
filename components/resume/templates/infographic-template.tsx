"use client";

import { CSSProperties } from "react";
import Image from "next/image";
import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Briefcase, Award } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";

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

  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  const primaryColor = customization?.primaryColor || "#f97316";
  const secondaryColor = customization?.secondaryColor || "#fb923c";
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

  // Calculate stats
  const yearsExperience = sortedExperience.reduce((acc, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || "");
    return acc + (end.getFullYear() - start.getFullYear());
  }, 0);

  return (
    <div className="w-full bg-white text-gray-800 min-h-[297mm]" style={{ fontFamily: getFontFamily() }}>
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
                  <Image
                    src={personalInfo.photo} width={96} height={96} unoptimized
                    alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
              </h1>
              {personalInfo.jobTitle && (
                <p className="text-sm opacity-80 mt-1">{personalInfo.jobTitle}</p>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 opacity-60" />
                <div className="text-xl font-bold">{yearsExperience}+</div>
                <div className="text-[10px] opacity-60 uppercase">Years Exp</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <Briefcase className="w-5 h-5 mx-auto mb-1 opacity-60" />
                <div className="text-xl font-bold">{sortedExperience.length}</div>
                <div className="text-[10px] opacity-60 uppercase">Positions</div>
              </div>
              {data.projects && data.projects.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <Award className="w-5 h-5 mx-auto mb-1 opacity-60" />
                  <div className="text-xl font-bold">{data.projects.length}</div>
                  <div className="text-[10px] opacity-60 uppercase">Projects</div>
                </div>
              )}
              {skills.length > 0 && (
                <div className="bg-white/10 rounded-lg p-3 text-center">
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
              <div className="space-y-2 text-sm">
                {personalInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 opacity-50" />
                    <span className="break-all">{personalInfo.email}</span>
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
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 opacity-50" />
                    <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                {personalInfo.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 opacity-50" />
                    <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </div>
                )}
                {personalInfo.github && (
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 opacity-50" />
                    <span className="break-all">{personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills with Circular Progress */}
            {Object.keys(skillsByCategory).length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                  Skills
                </h2>
                <div className="space-y-4">
                  {Object.entries(skillsByCategory).slice(0, 2).map(([category, categorySkills]) => (
                    <div key={category}>
                      <p className="text-[10px] opacity-50 uppercase tracking-wider mb-2">{category}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {categorySkills.slice(0, 6).map((skill) => {
                          const percent = skill.level ? levelToPercent[skill.level] : 70;
                          const size = 45;
                          const strokeWidth = 3;
                          const radius = (size - strokeWidth) / 2;
                          const circumference = radius * 2 * Math.PI;
                          const offset = circumference - (percent / 100) * circumference;

                          return (
                            <div key={skill.id} className="flex flex-col items-center">
                              <svg width={size} height={size} className="-rotate-90">
                                <circle
                                  cx={size / 2}
                                  cy={size / 2}
                                  r={radius}
                                  fill="none"
                                  stroke="rgba(255,255,255,0.2)"
                                  strokeWidth={strokeWidth}
                                />
                                <circle
                                  cx={size / 2}
                                  cy={size / 2}
                                  r={radius}
                                  fill="none"
                                  stroke={secondaryColor}
                                  strokeWidth={strokeWidth}
                                  strokeLinecap="round"
                                  strokeDasharray={circumference}
                                  strokeDashoffset={offset}
                                />
                              </svg>
                              <span className="text-[9px] mt-1 text-center opacity-80 leading-tight">{skill.name}</span>
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
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-3">
                  Languages
                </h2>
                <div className="space-y-2">
                  {data.languages.map((lang) => {
                    const levelPercent = { basic: 25, conversational: 50, fluent: 75, native: 100 }[lang.level] || 50;
                    return (
                      <div key={lang.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span>{lang.name}</span>
                          <span className="opacity-50 capitalize">{lang.level}</span>
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
          </div>
        </aside>

        {/* Main Content - 65% */}
        <main className="flex-1 p-8">
          {/* Summary */}
          {personalInfo.summary && (
            <section style={{ marginBottom: `${sectionSpacing}px` }}>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderColor: primaryColor }}>
                <p className="text-sm text-gray-600 leading-relaxed">{personalInfo.summary}</p>
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
                    <div>
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
                              <span>{item}</span>
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
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {edu.degree}{edu.field && ` in ${edu.field}`}
                        </p>
                        <p className="text-sm" style={{ color: primaryColor }}>{edu.institution}</p>
                        {edu.gpa && <p className="text-xs text-gray-500 mt-0.5">GPA: {edu.gpa}</p>}
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
              <div className="grid grid-cols-2 gap-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: `${primaryColor}30` }}
                  >
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{project.description}</p>
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

          {/* Certifications */}
          {data.certifications && data.certifications.filter(c => c.type !== "course").length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4" style={{ color: primaryColor }}>
                Certifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.certifications.filter(c => c.type !== "course").map((cert) => (
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
        </main>
      </div>
    </div>
  );
}
