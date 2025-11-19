"use client";

import { ResumeData } from "@/lib/types/resume";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface ModernTemplateProps {
  data: ResumeData;
}

export function ModernTemplate({ data }: ModernTemplateProps) {
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
    <div className="w-full bg-white text-black p-12 min-h-[297mm] shadow-2xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2 tracking-tight text-black">
          {fullName || "Your Name"}
        </h1>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>

        {/* Online Presence */}
        {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
            {personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span className="break-all">{personalInfo.website.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" />
                <span className="break-all">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github className="w-4 h-4" />
                <span className="break-all">{personalInfo.github.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mt-4">
            <Separator className="mb-4 bg-gray-200" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}
      </header>

      {/* Work Experience */}
      {sortedExperience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
            Experience
          </h2>
          <div className="space-y-5">
            {sortedExperience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {exp.position}
                    </h3>
                    <p className="text-base text-gray-700">
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 text-right whitespace-nowrap ml-4">
                    {formatDate(exp.startDate)} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-700">
                    {exp.description.map((item, idx) => (
                      item.trim() && (
                        <li key={idx} className="flex gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span className="flex-1">{item}</span>
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

      {/* Education */}
      {sortedEducation.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-5">
            {sortedEducation.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </h3>
                    <p className="text-base text-gray-700">
                      {edu.institution}
                      {edu.location && ` • ${edu.location}`}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 text-right whitespace-nowrap ml-4">
                    {formatDate(edu.startDate)} -{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
                {edu.gpa && (
                  <p className="text-sm text-gray-700 mb-1">GPA: {edu.gpa}</p>
                )}
                {edu.description && edu.description.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-700">
                    {edu.description.map((item, idx) => (
                      item.trim() && (
                        <li key={idx} className="flex gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span className="flex-1">{item}</span>
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
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
            Skills
          </h2>
          <div className="space-y-3">
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
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

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
            Languages
          </h2>
          <div className="flex flex-wrap gap-4">
            {data.languages.map((lang) => (
              <div key={lang.id} className="text-sm text-gray-700">
                <span className="font-semibold">{lang.name}</span>
                <span className="text-gray-500 ml-1">({lang.level})</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Courses */}
      {data.courses && data.courses.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
            Courses & Certifications
          </h2>
          <div className="space-y-3">
            {data.courses.map((course) => (
              <div key={course.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-black">
                      {course.name}
                    </h3>
                    {course.institution && (
                      <p className="text-sm text-gray-600">{course.institution}</p>
                    )}
                  </div>
                  {course.date && (
                    <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                      {new Date(course.date + "-01").toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {course.credentialId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Credential ID: {course.credentialId}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Extra-Curricular */}
      {data.extraCurricular && data.extraCurricular.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
            Extra-Curricular Activities
          </h2>
          <div className="space-y-5">
            {data.extraCurricular.map((activity) => (
              <div key={activity.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {activity.title}
                    </h3>
                    <p className="text-base text-gray-700">
                      {activity.organization}
                      {activity.role && ` • ${activity.role}`}
                    </p>
                  </div>
                  {(activity.startDate || activity.endDate) && (
                    <div className="text-sm text-gray-600 text-right whitespace-nowrap ml-4">
                      {activity.startDate && formatDate(activity.startDate)} -{" "}
                      {activity.current
                        ? "Present"
                        : activity.endDate
                        ? formatDate(activity.endDate)
                        : ""}
                    </div>
                  )}
                </div>
                {activity.description && activity.description.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-700">
                    {activity.description.map((item, idx) => (
                      item.trim() && (
                        <li key={idx} className="flex gap-2">
                          <span className="text-gray-400 mt-1">•</span>
                          <span className="flex-1">{item}</span>
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

      {/* Hobbies */}
      {data.hobbies && data.hobbies.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-black uppercase tracking-wide">
            Hobbies & Interests
          </h2>
          <div className="flex flex-wrap gap-3">
            {data.hobbies.map((hobby) => (
              <div key={hobby.id} className="text-sm text-gray-700">
                <span className="font-medium">{hobby.name}</span>
                {hobby.description && (
                  <span className="text-gray-500 ml-2">- {hobby.description}</span>
                )}
              </div>
            ))}
          </div>
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

