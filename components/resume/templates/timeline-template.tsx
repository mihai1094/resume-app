"use client";

import { CSSProperties } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { MapPin, Mail, Phone, Globe, Linkedin, Github } from "lucide-react";
import { TemplateCustomization } from "../template-customizer";

interface TimelineTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Timeline Template - Visual Career Journey
 *
 * A visually striking design that tells your career story through
 * a clear timeline. Features a prominent header section, visual
 * timeline for work history, and organized sidebar for skills.
 */
export function TimelineTemplate({
  data,
  customization,
}: TimelineTemplateProps) {
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    languages,
    courses,
    hobbies,
    extraCurricular,
  } = data;

  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Warm slate with coral accent - distinctive and modern
  const primaryColor = customization?.primaryColor || "#334155";
  const accentColor = customization?.secondaryColor || "#f97316";
  const baseFontSize = customization?.fontSize ?? 13;
  const baseLineSpacing = customization?.lineSpacing ?? 1.55;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <div
      className="w-full min-h-[297mm] bg-white"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Header Section */}
      <header
        className="p-10 relative overflow-hidden"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Decorative Elements */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
          style={{
            backgroundColor: accentColor,
            transform: "translate(30%, -50%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-5"
          style={{
            backgroundColor: "white",
            transform: "translate(-30%, 50%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <h1
                className="text-4xl font-bold text-white tracking-tight mb-2"
                style={{ fontFamily: "'Sora', system-ui, sans-serif" }}
              >
                {fullName || "Your Name"}
              </h1>
              {personalInfo.summary && (
                <p className="text-white/70 max-w-lg leading-relaxed text-sm">
                  {personalInfo.summary.split(".").slice(0, 2).join(".")}
                </p>
              )}
            </div>

            {/* Year Counter */}
            {sortedExperience.length > 0 && (
              <div className="text-right">
                <div
                  className="text-5xl font-bold"
                  style={{ color: accentColor }}
                >
                  {(() => {
                    const firstJob =
                      sortedExperience[sortedExperience.length - 1];
                    const startYear = firstJob
                      ? new Date(firstJob.startDate).getFullYear()
                      : new Date().getFullYear();
                    return new Date().getFullYear() - startYear;
                  })()}
                  +
                </div>
                <div className="text-white/60 text-xs uppercase tracking-wider">
                  Years Experience
                </div>
              </div>
            )}
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap gap-4 mt-8 text-sm text-white/80">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" style={{ color: accentColor }} />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: accentColor }} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: accentColor }} />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" style={{ color: accentColor }} />
                <span>
                  {personalInfo.linkedin
                    .replace(/^https?:\/\/(www\.)?/, "")
                    .split("/")
                    .slice(0, 2)
                    .join("/")}
                </span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4" style={{ color: accentColor }} />
                <span>
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" style={{ color: accentColor }} />
                <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8 p-10" style={baseTextStyle}>
        {/* Timeline Column */}
        <main className="col-span-8 space-y-10">
          {/* Work Experience Timeline */}
          {sortedExperience.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-8 flex items-center gap-3"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-12 h-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                Career Timeline
              </h2>

              <div className="relative">
                {/* Timeline Line */}
                <div
                  className="absolute left-5 top-0 bottom-0 w-0.5"
                  style={{ backgroundColor: `${primaryColor}15` }}
                />

                <div className="space-y-8">
                  {sortedExperience.map((job, index) => (
                    <div key={job.id} className="relative pl-14">
                      {/* Timeline Dot */}
                      <div
                        className="absolute left-3 top-1 w-5 h-5 rounded-full border-4 bg-white"
                        style={{
                          borderColor:
                            index === 0 ? accentColor : `${primaryColor}30`,
                        }}
                      />

                      {/* Year Badge */}
                      <div
                        className="absolute left-14 -top-1 text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor:
                            index === 0 ? accentColor : `${primaryColor}10`,
                          color: index === 0 ? "white" : primaryColor,
                        }}
                      >
                        {new Date(job.startDate).getFullYear()}
                      </div>

                      <div className="pt-6">
                        <h3
                          className="text-lg font-bold"
                          style={{ color: primaryColor }}
                        >
                          {job.position}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            style={{ color: accentColor }}
                            className="font-medium"
                          >
                            {job.company}
                          </span>
                          {job.location && (
                            <>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-500 text-sm">
                                {job.location}
                              </span>
                            </>
                          )}
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(job.startDate)} –{" "}
                            {job.current
                              ? "Present"
                              : formatDate(job.endDate || "")}
                          </span>
                        </div>

                        {job.description && job.description.length > 0 && (
                          <ul className="text-gray-600 text-sm space-y-1.5">
                            {job.description.map(
                              (item, idx) =>
                                item.trim() && (
                                  <li key={idx} className="flex gap-2">
                                    <span style={{ color: accentColor }}>
                                      →
                                    </span>
                                    <span>{item}</span>
                                  </li>
                                )
                            )}
                          </ul>
                        )}

                        {job.achievements && job.achievements.length > 0 && (
                          <div
                            className="mt-3 p-3 rounded-lg"
                            style={{ backgroundColor: `${accentColor}08` }}
                          >
                            <ul className="text-sm space-y-1">
                              {job.achievements.map(
                                (achievement, idx) =>
                                  achievement.trim() && (
                                    <li key={idx} className="flex gap-2">
                                      <span style={{ color: accentColor }}>
                                        ★
                                      </span>
                                      <span
                                        className="font-medium"
                                        style={{ color: primaryColor }}
                                      >
                                        {achievement}
                                      </span>
                                    </li>
                                  )
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Education Timeline */}
          {sortedEducation.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-8 flex items-center gap-3"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-12 h-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                Education
              </h2>

              <div className="relative">
                {/* Timeline Line */}
                <div
                  className="absolute left-5 top-0 bottom-0 w-0.5"
                  style={{ backgroundColor: `${primaryColor}15` }}
                />

                <div className="space-y-6">
                  {sortedEducation.map((edu) => (
                    <div key={edu.id} className="relative pl-14">
                      {/* Timeline Dot */}
                      <div
                        className="absolute left-3 top-1 w-5 h-5 rounded-full border-4 bg-white"
                        style={{ borderColor: `${primaryColor}30` }}
                      />

                      <div>
                        <h3
                          className="font-bold"
                          style={{ color: primaryColor }}
                        >
                          {edu.degree}
                          {edu.field && (
                            <span className="font-normal text-gray-600">
                              {" "}
                              in {edu.field}
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm">
                          <span style={{ color: accentColor }}>
                            {edu.institution}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span className="text-gray-500">
                            {formatDate(edu.startDate)} –{" "}
                            {edu.current
                              ? "Present"
                              : formatDate(edu.endDate || "")}
                          </span>
                        </div>
                        {edu.gpa && (
                          <p className="text-sm text-gray-500 mt-1">
                            GPA: {edu.gpa}
                          </p>
                        )}
                        {edu.description && edu.description.length > 0 && (
                          <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            {edu.description.map(
                              (item, idx) =>
                                item.trim() && (
                                  <li key={idx} className="flex gap-2">
                                    <span style={{ color: accentColor }}>
                                      →
                                    </span>
                                    <span>{item}</span>
                                  </li>
                                )
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <h2
                className="text-lg font-bold mb-6 flex items-center gap-3"
                style={{ color: primaryColor }}
              >
                <span
                  className="w-12 h-1 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                Projects
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-lg border border-gray-100"
                  >
                    <h3 className="font-bold" style={{ color: primaryColor }}>
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </p>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded"
                              style={{
                                backgroundColor: `${accentColor}15`,
                                color: accentColor,
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
        </main>

        {/* Sidebar */}
        <aside className="col-span-4 space-y-8">
          {/* Skills */}
          {skills.length > 0 && (
            <section
              className="p-6 rounded-xl"
              style={{ backgroundColor: `${primaryColor}05` }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}20`,
                }}
              >
                Skills
              </h2>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(
                  ([category, categorySkills]) => (
                    <div key={category}>
                      <h3
                        className="text-xs uppercase tracking-wider mb-2"
                        style={{ color: accentColor }}
                      >
                        {category}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {categorySkills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-2 py-1 text-xs rounded bg-white border border-gray-100"
                            style={{ color: primaryColor }}
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <section
              className="p-6 rounded-xl"
              style={{ backgroundColor: `${primaryColor}05` }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}20`,
                }}
              >
                Languages
              </h2>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div
                    key={lang.id}
                    className="flex justify-between items-center"
                  >
                    <span
                      className="font-medium"
                      style={{ color: primaryColor }}
                    >
                      {lang.name}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {courses && courses.length > 0 && (
            <section
              className="p-6 rounded-xl"
              style={{ backgroundColor: `${primaryColor}05` }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}20`,
                }}
              >
                Certifications
              </h2>
              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id}>
                    <p
                      className="font-medium text-sm"
                      style={{ color: primaryColor }}
                    >
                      {course.name}
                    </p>
                    {course.institution && (
                      <p className="text-xs text-gray-500">
                        {course.institution}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Interests */}
          {hobbies && hobbies.length > 0 && (
            <section
              className="p-6 rounded-xl"
              style={{ backgroundColor: `${primaryColor}05` }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}20`,
                }}
              >
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {hobbies.map((hobby) => (
                  <span
                    key={hobby.id}
                    className="text-sm"
                    style={{ color: primaryColor }}
                  >
                    {hobby.name}
                    {hobbies.indexOf(hobby) < hobbies.length - 1 && (
                      <span className="ml-2" style={{ color: accentColor }}>
                        ·
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Extra-curricular */}
          {extraCurricular && extraCurricular.length > 0 && (
            <section
              className="p-6 rounded-xl"
              style={{ backgroundColor: `${primaryColor}05` }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b"
                style={{
                  color: primaryColor,
                  borderColor: `${primaryColor}20`,
                }}
              >
                Activities
              </h2>
              <div className="space-y-3">
                {extraCurricular.map((activity) => (
                  <div key={activity.id}>
                    <p
                      className="font-medium text-sm"
                      style={{ color: primaryColor }}
                    >
                      {activity.title}
                    </p>
                    {activity.organization && (
                      <p className="text-xs" style={{ color: accentColor }}>
                        {activity.organization}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>

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
