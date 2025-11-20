"use client";

import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin } from "lucide-react";

interface ExecutiveTemplateProps {
  data: ResumeData;
}

export function ExecutiveTemplate({ data }: ExecutiveTemplateProps) {
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
  const aggregatedWins = sortedExperience
    .flatMap((exp) => exp.achievements || [])
    .filter((item) => item && item.trim().length > 0)
    .slice(0, 4);

  return (
    <div className="w-full bg-white text-black p-12 min-h-[297mm] shadow-2xl">
      {/* Executive Header - Premium Design */}
      <header className="mb-10 pb-8 border-b-4 border-gray-800">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-2 tracking-tight text-gray-900">
              {fullName || "Your Name"}
            </h1>
            {personalInfo.summary && (
              <p className="text-lg text-gray-600 font-light italic max-w-2xl mt-3">
                {personalInfo.summary.split(".").slice(0, 2).join(".")}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info - Elegant Layout */}
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-700">
          <div className="space-y-2">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-gray-500" />
                <span className="break-all">
                  {personalInfo.linkedin.replace(/^https?:\/\//, "")}
                </span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="break-all">
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Executive Summary - Prominent */}
      {personalInfo.summary && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 uppercase tracking-wider border-b-2 border-gray-300 pb-2">
            Executive Summary
          </h2>
          <p className="text-base text-gray-700 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {aggregatedWins.length > 0 && (
        <section className="mb-10 bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <h2 className="text-sm uppercase tracking-[0.4em] text-gray-500 mb-3">
            Key Wins
          </h2>
          <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
            {aggregatedWins.map((win, idx) => (
              <li key={`${win}-${idx}`} className="flex gap-3">
                <span className="font-bold text-gray-500">▹</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Professional Experience - Focus on Impact */}
      {sortedExperience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-wider border-b-2 border-gray-300 pb-2">
            Professional Experience
          </h2>
          <div className="space-y-8">
            {sortedExperience.map((exp) => (
              <div key={exp.id} className="mb-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {exp.position}
                    </h3>
                    <p className="text-lg font-semibold text-gray-700">
                      {exp.company}
                      {exp.location && (
                        <span className="font-normal text-gray-600">
                          {" "}
                          • {exp.location}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 font-medium whitespace-nowrap ml-6">
                    {formatDate(exp.startDate)} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>

                {/* Achievements First (if available) - Executive Focus */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      Key Achievements:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {exp.achievements.map(
                        (achievement, idx) =>
                          achievement.trim() && (
                            <li key={idx} className="flex gap-3">
                              <span className="text-gray-500 font-bold mt-0.5">
                                ▸
                              </span>
                              <span className="flex-1 leading-relaxed">
                                {achievement}
                              </span>
                            </li>
                          )
                      )}
                    </ul>
                  </div>
                )}

                {/* Description */}
                {exp.description.length > 0 && (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {exp.description.map(
                      (item, idx) =>
                        item.trim() && (
                          <li key={idx} className="flex gap-3">
                            <span className="text-gray-500 font-bold mt-0.5">
                              ▸
                            </span>
                            <span className="flex-1 leading-relaxed">
                              {item}
                            </span>
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

      {/* Education */}
      {sortedEducation.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-wider border-b-2 border-gray-300 pb-2">
            Education
          </h2>
          <div className="space-y-5">
            {sortedEducation.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </h3>
                    <p className="text-base font-semibold text-gray-700">
                      {edu.institution}
                      {edu.location && (
                        <span className="font-normal text-gray-600">
                          {" "}
                          • {edu.location}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 font-medium whitespace-nowrap ml-6">
                    {formatDate(edu.startDate)} -{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
                {edu.gpa && (
                  <p className="text-sm text-gray-700 font-medium">
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.description && edu.description.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-700 mt-2">
                    {edu.description.map(
                      (item, idx) =>
                        item.trim() && (
                          <li key={idx} className="flex gap-3">
                            <span className="text-gray-500 font-bold mt-0.5">
                              ▸
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

      {/* Core Competencies - Executive Style */}
      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-wider border-b-2 border-gray-300 pb-2">
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(skillsByCategory).map(
              ([category, categorySkills]) => (
                <div key={category}>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    {category}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {categorySkills.map((skill) => skill.name).join(" • ")}
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Languages & Certifications - Side by Side */}
      {(data.languages && data.languages.length > 0) ||
      (data.courses && data.courses.length > 0) ? (
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-x-12">
            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
                  Languages
                </h2>
                <div className="space-y-2">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="text-sm text-gray-700">
                      <span className="font-semibold">{lang.name}</span>
                      <span className="text-gray-600 ml-2">— {lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {data.courses && data.courses.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {data.courses.map((course) => (
                    <div key={course.id} className="text-sm">
                      <div className="font-semibold text-gray-900">
                        {course.name}
                      </div>
                      {course.institution && (
                        <div className="text-gray-700">
                          {course.institution}
                        </div>
                      )}
                      {course.date && (
                        <div className="text-gray-600 text-xs">
                          {new Date(course.date + "-01").toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* Professional Affiliations / Extra-Curricular */}
      {data.extraCurricular && data.extraCurricular.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 uppercase tracking-wider border-b-2 border-gray-300 pb-2">
            Professional Affiliations
          </h2>
          <div className="space-y-4">
            {data.extraCurricular.map((activity) => (
              <div key={activity.id} className="mb-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-lg font-bold text-gray-900">
                      {activity.title}
                    </span>
                    {activity.organization && (
                      <span className="text-base font-semibold text-gray-700">
                        , {activity.organization}
                      </span>
                    )}
                    {activity.role && (
                      <span className="text-sm text-gray-600">
                        {" "}
                        — {activity.role}
                      </span>
                    )}
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-6">
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
                  <ul className="space-y-1 text-sm text-gray-700 mt-2">
                    {activity.description.map(
                      (item, idx) =>
                        item.trim() && (
                          <li key={idx} className="flex gap-3">
                            <span className="text-gray-500 font-bold mt-0.5">
                              ▸
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

      {/* Hobbies - Minimal, if included */}
      {data.hobbies && data.hobbies.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 uppercase tracking-wide border-b border-gray-300 pb-2">
            Personal Interests
          </h2>
          <p className="text-sm text-gray-700">
            {data.hobbies.map((hobby, idx) => (
              <span key={hobby.id}>
                {hobby.name}
                {idx < data.hobbies!.length - 1 && (
                  <span className="mx-2 text-gray-500">•</span>
                )}
              </span>
            ))}
          </p>
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
    </div>
  );
}
