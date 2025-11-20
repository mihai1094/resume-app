"use client";

import { ResumeData } from "@/lib/types/resume";
import { formatDate, sortWorkExperienceByDate, sortEducationByDate } from "@/lib/utils";

interface MinimalistTemplateProps {
  data: ResumeData;
}

export function MinimalistTemplate({ data }: MinimalistTemplateProps) {
  const { personalInfo, workExperience, education, skills } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const projectHighlights = data.projects || [];
  const researchTopics = skills.slice(0, 6).map((skill) => skill.name);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  return (
    <div className="w-full bg-white text-black p-16 min-h-[297mm]">
      {/* Header - Ultra Minimal */}
      <header className="mb-12 border-b border-gray-300 pb-8">
        <h1 className="text-3xl font-light mb-3 tracking-wider text-black">
          {fullName || "Your Name"}
        </h1>
        <div className="text-xs text-gray-600 space-y-1 font-light">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-10">
          <p className="text-sm text-gray-700 leading-relaxed font-light">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {researchTopics.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-normal mb-3 text-black tracking-widest uppercase border-b border-gray-200 pb-1">
            Research Interests
          </h2>
          <p className="text-xs text-gray-600">
            {researchTopics.join(" • ")}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {sortedExperience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-normal mb-6 text-black tracking-widest uppercase border-b border-gray-200 pb-2">
            Experience
          </h2>
          <div className="space-y-6">
            {sortedExperience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-black">
                      {exp.position}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {exp.company}
                      {exp.location && `, ${exp.location}`}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatDate(exp.startDate)} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="space-y-0.5 text-xs text-gray-700 mt-2">
                    {exp.description.map((item, idx) => (
                      item.trim() && (
                        <li key={idx} className="pl-3 border-l border-gray-200">
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

      {/* Education */}
      {sortedEducation.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-normal mb-6 text-black tracking-widest uppercase border-b border-gray-200 pb-2">
            Education
          </h2>
          <div className="space-y-6">
            {sortedEducation.map((edu) => (
              <div key={edu.id} className="space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-black">
                      {edu.degree}
                      {edu.field && `, ${edu.field}`}
                    </h3>
                    <p className="text-xs text-gray-600">{edu.institution}</p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatDate(edu.startDate)} -{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {projectHighlights.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-normal mb-6 text-black tracking-widest uppercase border-b border-gray-200 pb-2">
            Publications & Projects
          </h2>
          <div className="space-y-4">
            {projectHighlights.map((project) => (
              <div key={project.id}>
                <p className="text-sm font-medium text-black">
                  {project.name}
                </p>
                <p className="text-xs text-gray-600">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-[10px] uppercase tracking-[0.4em] text-gray-400 mt-1">
                    {project.technologies.join(" • ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills - Minimal list */}
      {skills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-normal mb-6 text-black tracking-widest uppercase border-b border-gray-200 pb-2">
            Skills
          </h2>
          <div className="text-xs text-gray-700 space-y-1">
            {skills.map((skill, idx) => (
              <span key={skill.id}>
                {skill.name}
                {idx < skills.length - 1 && <span className="mx-2">•</span>}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
