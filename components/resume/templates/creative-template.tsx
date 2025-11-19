"use client";

import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

interface CreativeTemplateProps {
  data: ResumeData;
}

export function CreativeTemplate({ data }: CreativeTemplateProps) {
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
    <div className="w-full bg-gradient-to-br from-purple-50 to-pink-50 text-black p-10 min-h-[297mm] shadow-2xl">
      {/* Header - Creative Style */}
      <header className="mb-10 bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {fullName || "Your Name"}
            </h1>
            {personalInfo.summary && (
              <p className="text-sm text-gray-700 leading-relaxed italic">
                {personalInfo.summary}
              </p>
            )}
          </div>
        </div>

        {/* Contact Info - Colorful */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {personalInfo.email && (
            <div className="flex items-center gap-2 text-purple-700">
              <Mail className="w-4 h-4" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2 text-purple-700">
              <Phone className="w-4 h-4" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-2 text-purple-700">
              <MapPin className="w-4 h-4" />
              <span>{personalInfo.location}</span>
            </div>
          )}
          {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
            <div className="flex items-center gap-2 text-purple-700">
              {personalInfo.linkedin && (
                <Linkedin className="w-4 h-4" />
              )}
              {personalInfo.github && (
                <Github className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Work Experience */}
          {sortedExperience.length > 0 && (
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-purple-600 border-b-2 border-purple-200 pb-2">
                Experience
              </h2>
              <div className="space-y-5">
                {sortedExperience.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-purple-400 pl-4">
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-black">
                        {exp.position}
                      </h3>
                      <p className="text-sm text-purple-700 font-semibold">
                        {exp.company}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </p>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="space-y-1 text-sm text-gray-700">
                        {exp.description.map((item, idx) => (
                          item.trim() && (
                            <li key={idx} className="flex gap-2">
                              <span className="text-purple-500 mt-1">▸</span>
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
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-purple-600 border-b-2 border-purple-200 pb-2">
                Education
              </h2>
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-pink-400 pl-4">
                    <h3 className="text-base font-bold text-black">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </h3>
                    <p className="text-sm text-purple-700">{edu.institution}</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(edu.startDate)} -{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Skills */}
          {skills.length > 0 && (
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-pink-600 border-b-2 border-pink-200 pb-2">
                Skills
              </h2>
              <div className="space-y-4">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category}>
                    <h3 className="text-sm font-bold text-purple-700 mb-2">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs rounded-full font-medium"
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
            <section className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-pink-600 border-b-2 border-pink-200 pb-2">
                Languages
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-black">{lang.name}</span>
                    <span className="text-xs text-purple-600 font-semibold">{lang.level}</span>
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

