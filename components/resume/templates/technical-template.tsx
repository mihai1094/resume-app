"use client";

import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface TechnicalTemplateProps {
  data: ResumeData;
}

export function TechnicalTemplate({ data }: TechnicalTemplateProps) {
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
    <div className="w-full bg-gray-900 text-gray-100 p-10 min-h-[297mm] shadow-2xl font-mono">
      {/* Header - Tech Style */}
      <header className="mb-8 border-l-4 border-blue-500 pl-4">
        <h1 className="text-4xl font-bold mb-2 text-blue-400">
          {fullName || "Your Name"}
        </h1>
        <div className="text-xs text-gray-400 space-y-1">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1 text-blue-400">
                <Linkedin className="w-3 h-3" />
                <span className="text-xs">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-1 text-blue-400">
                <Github className="w-3 h-3" />
                <span className="text-xs">{personalInfo.github.replace(/^https?:\/\//, '')}</span>
              </div>
            )}
          </div>
        </div>
        {personalInfo.summary && (
          <div className="mt-4 text-sm text-gray-300 leading-relaxed">
            <span className="text-blue-400">// </span>
            {personalInfo.summary}
          </div>
        )}
      </header>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="col-span-2 space-y-6">
          {/* Work Experience */}
          {sortedExperience.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 text-blue-400 border-b border-gray-700 pb-2">
                &gt; EXPERIENCE
              </h2>
              <div className="space-y-4">
                {sortedExperience.map((exp) => (
                  <div key={exp.id} className="bg-gray-800 p-4 rounded border-l-2 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {exp.position}
                        </h3>
                        <p className="text-sm text-blue-400">
                          {exp.company}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </div>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="space-y-1 text-xs text-gray-300 mt-2">
                        {exp.description.map((item, idx) => (
                          item.trim() && (
                            <li key={idx} className="flex gap-2">
                              <span className="text-blue-500">-</span>
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
            <section>
              <h2 className="text-lg font-bold mb-4 text-blue-400 border-b border-gray-700 pb-2">
                &gt; EDUCATION
              </h2>
              <div className="space-y-3">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="bg-gray-800 p-4 rounded border-l-2 border-green-500">
                    <h3 className="text-base font-bold text-white">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </h3>
                    <p className="text-sm text-green-400">{edu.institution}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(edu.startDate)} -{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 text-blue-400 border-b border-gray-700 pb-2">
                &gt; SKILLS
              </h2>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h3 className="text-xs font-bold text-yellow-400 mb-2 uppercase">
                      {category}
                    </h3>
                    <div className="space-y-1">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded border border-gray-700"
                        >
                          {skill.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 text-blue-400 border-b border-gray-700 pb-2">
                &gt; LANGUAGES
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="text-xs text-gray-300">
                    <span className="text-white font-bold">{lang.name}</span>
                    <span className="text-gray-500 ml-2">({lang.level})</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

