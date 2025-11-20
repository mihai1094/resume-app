"use client";

import { CSSProperties } from "react";
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

  const fontFamilyClass =
    customization?.fontFamily === "serif"
      ? "font-serif"
      : customization?.fontFamily === "mono"
      ? "font-mono"
      : "font-sans";

  const primaryColor = customization?.primaryColor || "#3b82f6";
  const secondaryColor = customization?.secondaryColor || "#60a5fa";
  const baseFontSize = customization?.fontSize ?? 14;
  const baseLineSpacing = customization?.lineSpacing ?? 1.5;
  const baseTextStyle: CSSProperties | undefined = customization
    ? { fontSize: `${baseFontSize}px`, lineHeight: baseLineSpacing }
    : undefined;
  const bulletStyle: CSSProperties | undefined = customization
    ? { color: secondaryColor }
    : undefined;
  const sectionSpacing = customization?.sectionSpacing || 16;

  const topSkillCategories = Object.entries(skillsByCategory).slice(0, 3);

  return (
    <div
      className={cn(
        "w-full bg-white text-black p-12 min-h-[297mm] shadow-2xl",
        fontFamilyClass
      )}
    >
      <div className="grid grid-cols-12 gap-8">
        <aside
          className="col-span-12 lg:col-span-4 border-gray-200 lg:border-r space-y-6 pr-0 lg:pr-6"
          style={baseTextStyle}
        >
          <div>
            <h1 className="text-4xl font-bold text-black">{fullName || "Your Name"}</h1>
            {personalInfo.summary && (
              <p className="text-sm text-gray-600 mt-3">{personalInfo.summary}</p>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xs uppercase tracking-[0.35em] text-gray-500">
              Contact
            </h2>
            <div className="space-y-1 text-sm text-gray-700">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {(personalInfo.website ||
                personalInfo.linkedin ||
                personalInfo.github) && (
                <div className="space-y-1">
                  {personalInfo.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="break-all">
                        {personalInfo.website.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  )}
                  {personalInfo.linkedin && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      <span className="break-all">
                        {personalInfo.linkedin.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  )}
                  {personalInfo.github && (
                    <div className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      <span className="break-all">
                        {personalInfo.github.replace(/^https?:\/\//, "")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {topSkillCategories.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-2">
                Core Strengths
              </h2>
              <div className="space-y-2">
                {topSkillCategories.map(([category, categorySkills]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-gray-500">
                      {category}
                    </p>
                    <p className="text-sm text-gray-700">
                      {categorySkills.map((skill) => skill.name).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.languages && data.languages.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-2">
                Languages
              </h2>
              <ul className="space-y-1 text-sm text-gray-700">
                {data.languages.map((lang) => (
                  <li key={lang.id} className="flex justify-between">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-gray-500">{lang.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.hobbies && data.hobbies.length > 0 && (
            <div>
              <h2 className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-2">
                Interests
              </h2>
              <ul className="space-y-1 text-sm text-gray-700">
                {data.hobbies.map((hobby) => (
                  <li key={hobby.id}>
                    {hobby.name}
                    {hobby.description && ` — ${hobby.description}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <main
          className="col-span-12 lg:col-span-8 space-y-8"
          style={baseTextStyle}
        >
          {sortedExperience.length > 0 && (
            <section>
              <div
                className="flex items-center justify-between border-b pb-2 mb-4"
                style={{ borderColor: primaryColor }}
              >
                <h2 className="text-xl font-semibold text-black uppercase tracking-wide">
                  Experience
                </h2>
                <span className="text-xs text-gray-500 uppercase tracking-widest">
                  Leadership & Impact
                </span>
              </div>
              <div className="space-y-6">
                {sortedExperience.map((exp) => (
                  <div key={exp.id} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-black">
                          {exp.position}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {exp.company}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </span>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-700">
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span
                                  className="text-gray-400 mt-1"
                                  style={bulletStyle}
                                >
                                  •
                                </span>
                                <span className="flex-1">{item}</span>
                              </li>
                            )
                        )}
                      </ul>
                    )}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm text-gray-700">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                          Key Wins
                        </p>
                        <ul className="space-y-1">
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <li key={idx} className="flex gap-2">
                                  <span
                                    className="text-gray-400"
                                    style={bulletStyle}
                                  >
                                    ▹
                                  </span>
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

          {sortedEducation.length > 0 && (
            <section>
              <div
                className="flex items-center justify-between border-b pb-2 mb-4"
                style={{ borderColor: primaryColor }}
              >
                <h2 className="text-xl font-semibold text-black uppercase tracking-wide">
                  Education
                </h2>
              </div>
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="flex justify-between">
                    <div>
                      <p className="text-base font-semibold text-black">
                        {edu.degree}
                        {edu.field && ` in ${edu.field}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {edu.institution}
                        {edu.location && ` • ${edu.location}`}
                      </p>
                      {edu.description && edu.description.length > 0 && (
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          {edu.description.map(
                            (item, idx) =>
                              item.trim() && (
                                <li key={idx} className="flex gap-2">
                                  <span className="text-gray-400" style={bulletStyle}>
                                    •
                                  </span>
                                  <span>{item}</span>
                                </li>
                              )
                          )}
                        </ul>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(edu.startDate)} -{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.projects && data.projects.length > 0 && (
            <section>
              <div
                className="flex items-center justify-between border-b pb-2 mb-4"
                style={{ borderColor: primaryColor }}
              >
                <h2 className="text-xl font-semibold text-black uppercase tracking-wide">
                  Strategic Projects
                </h2>
              </div>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div key={project.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-semibold text-black">
                        {project.name}
                      </h3>
                      {project.url && (
                        <span className="text-xs text-blue-600 break-all">
                          {project.url.replace(/^https?:\/\//, "")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{project.description}</p>
                    {project.technologies?.length > 0 && (
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
                        {project.technologies.join(" • ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.courses && data.courses.length > 0 && (
            <section>
              <div
                className="flex items-center justify-between border-b pb-2 mb-4"
                style={{ borderColor: primaryColor }}
              >
                <h2 className="text-xl font-semibold text-black uppercase tracking-wide">
                  Certifications
                </h2>
              </div>
              <div className="space-y-3">
                {data.courses.map((course) => (
                  <div key={course.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold text-black">{course.name}</p>
                      {course.institution && (
                        <p className="text-gray-600">{course.institution}</p>
                      )}
                    </div>
                    {course.date && (
                      <span className="text-gray-500 whitespace-nowrap ml-4">
                        {new Date(course.date + "-01").toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <section>
              <div
                className="flex items-center justify-between border-b pb-2 mb-4"
                style={{ borderColor: primaryColor }}
              >
                <h2 className="text-xl font-semibold text-black uppercase tracking-wide">
                  Community & Leadership
                </h2>
              </div>
              <div className="space-y-4">
                {data.extraCurricular.map((activity) => (
                  <div key={activity.id} className="space-y-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-base font-semibold text-black">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.organization}
                          {activity.role && ` • ${activity.role}`}
                        </p>
                      </div>
                      {(activity.startDate || activity.endDate) && (
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {activity.startDate && formatDate(activity.startDate)} -{" "}
                          {activity.current
                            ? "Present"
                            : activity.endDate
                            ? formatDate(activity.endDate)
                            : ""}
                        </span>
                      )}
                    </div>
                    {activity.description && activity.description.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-700">
                        {activity.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <li key={idx} className="flex gap-2">
                                <span className="text-gray-400" style={bulletStyle}>
                                  •
                                </span>
                                <span className="flex-1">{item}</span>
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
