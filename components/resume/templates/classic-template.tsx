"use client";

import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";

interface ClassicTemplateProps {
  data: ResumeData;
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
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

  return (
    <div className="w-full bg-white text-black p-10 min-h-[297mm] shadow-2xl font-serif">
      {/* Header - Centered, Traditional Style */}
      <header className="text-center mb-8 border-b-2 border-black pb-6">
        <h1 className="text-5xl font-bold mb-3 tracking-wide text-black uppercase">
          {fullName || "Your Name"}
        </h1>

        {/* Contact Info - Simple, no icons */}
        <div className="text-sm text-gray-700 space-y-1">
          {personalInfo.location && (
            <div>{personalInfo.location}</div>
          )}
          <div className="flex justify-center gap-4 flex-wrap">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
          </div>
          {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
            <div className="flex justify-center gap-4 flex-wrap text-xs">
              {personalInfo.website && (
                <span>{personalInfo.website.replace(/^https?:\/\//, '')}</span>
              )}
              {personalInfo.linkedin && (
                <span>LinkedIn: {personalInfo.linkedin.replace(/^https?:\/\//, '').replace(/^www\./, '')}</span>
              )}
              {personalInfo.github && (
                <span>GitHub: {personalInfo.github.replace(/^https?:\/\//, '').replace(/^www\./, '')}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {sortedExperience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {sortedExperience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <h3 className="text-base font-bold text-black">
                      {exp.position}
                    </h3>
                    <p className="text-sm font-semibold text-gray-800">
                      {exp.company}
                      {exp.location && `, ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700 font-normal whitespace-nowrap ml-4">
                    {formatDate(exp.startDate)} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-800 ml-4 mt-2">
                    {exp.description.map((item, idx) => (
                      item.trim() && (
                        <li key={idx} className="list-disc">
                          {item}
                        </li>
                      )
                    ))}
                  </ul>
                )}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="mt-2 ml-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Key Achievements:</p>
                    <ul className="space-y-1 text-sm text-gray-800">
                      {exp.achievements.map((achievement, idx) => (
                        achievement.trim() && (
                          <li key={idx} className="list-disc">
                            {achievement}
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {sortedEducation.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Education
          </h2>
          <div className="space-y-4">
            {sortedEducation.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <h3 className="text-base font-bold text-black">
                      {edu.degree}
                      {edu.field && `, ${edu.field}`}
                    </h3>
                    <p className="text-sm font-semibold text-gray-800">
                      {edu.institution}
                      {edu.location && `, ${edu.location}`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700 font-normal whitespace-nowrap ml-4">
                    {formatDate(edu.startDate)} -{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
                {edu.gpa && (
                  <p className="text-sm text-gray-800 ml-4">GPA: {edu.gpa}</p>
                )}
                {edu.description && edu.description.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-800 ml-4 mt-2">
                    {edu.description.map((item, idx) => (
                      item.trim() && (
                        <li key={idx} className="list-disc">
                          {item}
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Skills
          </h2>
          <div className="space-y-3">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">
                  {category}:
                </h3>
                <p className="text-sm text-gray-700">
                  {categorySkills.map((skill) => skill.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Languages
          </h2>
          <div className="text-sm text-gray-800">
            {data.languages.map((lang, idx) => (
              <span key={lang.id}>
                <span className="font-semibold">{lang.name}</span>
                <span className="text-gray-600"> ({lang.level})</span>
                {idx < data.languages!.length - 1 && <span className="mx-2">•</span>}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Courses & Certifications */}
      {data.courses && data.courses.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Certifications
          </h2>
          <div className="space-y-2">
            {data.courses.map((course) => (
              <div key={course.id} className="text-sm">
                <span className="font-semibold text-black">{course.name}</span>
                {course.institution && (
                  <span className="text-gray-700">, {course.institution}</span>
                )}
                {course.date && (
                  <span className="text-gray-600 ml-2">
                    ({new Date(course.date + "-01").toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })})
                  </span>
                )}
                {course.credentialId && (
                  <span className="text-gray-600 text-xs ml-2">
                    - ID: {course.credentialId}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extra-Curricular */}
      {data.extraCurricular && data.extraCurricular.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Additional Activities
          </h2>
          <div className="space-y-3">
            {data.extraCurricular.map((activity) => (
              <div key={activity.id} className="text-sm">
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <span className="font-semibold text-black">{activity.title}</span>
                    {activity.organization && (
                      <span className="text-gray-700">, {activity.organization}</span>
                    )}
                    {activity.role && (
                      <span className="text-gray-600"> - {activity.role}</span>
                    )}
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <span className="text-gray-600 whitespace-nowrap ml-4">
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
                  <ul className="space-y-1 text-sm text-gray-800 ml-4 mt-1">
                    {activity.description.map((item, idx) => (
                      item.trim() && (
                        <li key={idx} className="list-disc">
                          {item}
                        </li>
                      )
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hobbies - Optional, minimal */}
      {data.hobbies && data.hobbies.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-3 text-black uppercase tracking-wide border-b border-gray-400 pb-1">
            Interests
          </h2>
          <p className="text-sm text-gray-800">
            {data.hobbies.map((hobby, idx) => (
              <span key={hobby.id}>
                {hobby.name}
                {idx < data.hobbies!.length - 1 && <span className="mx-2">•</span>}
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
          <p className="text-sm">Start filling out the form to see your resume come to life</p>
        </div>
      )}
    </div>
  );
}

