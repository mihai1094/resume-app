"use client";

import { CSSProperties, useMemo, memo } from "react";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { TemplateCustomization } from "../template-customizer";

interface IvyTemplateProps {
  data: ResumeData;
  customization?: TemplateCustomization;
}

/**
 * Ivy Template - Investment Banking / Consulting Style
 *
 * A crisp, dense format optimized for finance and consulting industries.
 * Features education-first layout, action-oriented bullet points, and
 * the traditional Harvard Business School resume style that recruiters
 * at top firms expect.
 */
function IvyTemplateComponent({ data, customization }: IvyTemplateProps) {
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    languages,
    courses,
    certifications,
    hobbies,
    extraCurricular,
  } = data;

  // Memoize expensive sorting operations
  const sortedExperience = useMemo(
    () => sortWorkExperienceByDate(workExperience),
    [workExperience]
  );

  const sortedEducation = useMemo(
    () => sortEducationByDate(education),
    [education]
  );

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Classic black and white - no colors for ATS optimization
  const primaryColor = customization?.primaryColor || "#000000";
  const secondaryColor = customization?.secondaryColor || "#444444";
  const baseFontSize = customization?.fontSize ?? 11;
  const baseLineSpacing = customization?.lineSpacing ?? 1.4;
  const sectionSpacing = customization?.sectionSpacing || 20;

  const baseTextStyle: CSSProperties = {
    fontSize: `${baseFontSize}px`,
    lineHeight: baseLineSpacing,
  };

  // Font family mapping
  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") {
      return "'Georgia', 'Times New Roman', serif";
    } else if (customization?.fontFamily === "mono") {
      return "'Courier New', 'Courier', monospace";
    } else if (customization?.fontFamily === "sans") {
      return "'Inter', 'Helvetica Neue', Arial, sans-serif";
    } else if (customization?.fontFamily) {
      return customization.fontFamily;
    }
    return "'Times New Roman', Times, serif";
  };

  return (
    <div
      className="w-full min-h-[297mm] bg-white text-black p-10"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Header - Name and Contact in a single line block */}
      <header
        className="text-center border-b-2 pb-4 mb-4"
        style={{ borderColor: primaryColor }}
      >
        <h1
          className="text-2xl font-bold uppercase tracking-[0.15em] mb-2"
          style={{ color: primaryColor }}
        >
          {fullName || "Your Name"}
        </h1>

        <div className="flex flex-wrap justify-center gap-x-3 text-sm">
          {personalInfo.location && <span>{personalInfo.location}</span>}
          {personalInfo.phone && (
            <>
              <span className="text-gray-400">|</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span className="text-gray-400">|</span>
              <span>{personalInfo.email}</span>
            </>
          )}
          {personalInfo.linkedin && (
            <>
              <span className="text-gray-400">|</span>
              <span>
                {personalInfo.linkedin
                  .replace(/^https?:\/\/(www\.)?/, "")
                  .split("/")
                  .slice(0, 2)
                  .join("/")}
              </span>
            </>
          )}
          {personalInfo.website && (
            <>
              <span className="text-gray-400">|</span>
              <span>{personalInfo.website.replace(/^https?:\/\//, "")}</span>
            </>
          )}
        </div>
      </header>

      <div style={baseTextStyle}>
        {/* Education Section - First for Finance/Consulting */}
        {sortedEducation.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm font-bold uppercase tracking-[0.1em] border-b pb-1 mb-3"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Education
            </h2>

            <div className="space-y-3">
              {sortedEducation.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{edu.institution}</h3>
                    <span className="text-sm">
                      {formatDate(edu.startDate)} –{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="italic">
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </p>
                    {edu.location && (
                      <span className="text-sm italic">{edu.location}</span>
                    )}
                  </div>
                  {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                  {edu.description && edu.description.length > 0 && (
                    <ul className="text-sm mt-1 space-y-0.5">
                      {edu.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="flex gap-2">
                              <span>•</span>
                              <span>{item}</span>
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

        {/* Professional Experience */}
        {sortedExperience.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm font-bold uppercase tracking-[0.1em] border-b pb-1 mb-3"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Professional Experience
            </h2>

            <div className="space-y-4">
              {sortedExperience.map((job) => (
                <div key={job.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{job.company}</h3>
                    <span className="text-sm">
                      {formatDate(job.startDate)} –{" "}
                      {job.current ? "Present" : formatDate(job.endDate || "")}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="italic font-medium">{job.position}</p>
                    {job.location && (
                      <span className="text-sm italic">{job.location}</span>
                    )}
                  </div>

                  {job.description && job.description.length > 0 && (
                    <ul className="text-sm space-y-0.5">
                      {job.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="flex gap-2">
                              <span>•</span>
                              <span className="text-justify">{item}</span>
                            </li>
                          )
                      )}
                    </ul>
                  )}

                  {job.achievements && job.achievements.length > 0 && (
                    <ul className="text-sm space-y-0.5 mt-1">
                      {job.achievements.map(
                        (achievement, idx) =>
                          achievement.trim() && (
                            <li key={idx} className="flex gap-2 font-medium">
                              <span>▸</span>
                              <span className="text-justify">
                                {achievement}
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

        {/* Leadership & Activities */}
        {extraCurricular && extraCurricular.length > 0 && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm font-bold uppercase tracking-[0.1em] border-b pb-1 mb-3"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Leadership & Activities
            </h2>

            <div className="space-y-3">
              {extraCurricular.map((activity) => (
                <div key={activity.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold">{activity.organization}</h3>
                    <span className="text-sm">
                      {activity.startDate && formatDate(activity.startDate)} –{" "}
                      {activity.current
                        ? "Present"
                        : activity.endDate
                        ? formatDate(activity.endDate)
                        : ""}
                    </span>
                  </div>
                  <p className="italic font-medium mb-1">
                    {activity.role || activity.title}
                  </p>
                  {activity.description && activity.description.length > 0 && (
                    <ul className="text-sm space-y-0.5">
                      {activity.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <li key={idx} className="flex gap-2">
                              <span>•</span>
                              <span className="text-justify">{item}</span>
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

        {/* Skills, Languages & Interests - Dense single section */}
        {(skills.length > 0 ||
          (languages && languages.length > 0) ||
          (hobbies && hobbies.length > 0)) && (
          <section style={{ marginBottom: `${sectionSpacing}px` }}>
            <h2
              className="text-sm font-bold uppercase tracking-[0.1em] border-b pb-1 mb-3"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Additional Information
            </h2>

            <div className="text-sm space-y-1.5">
              {skills.length > 0 && (
                <div className="flex">
                  <span className="font-bold w-28 flex-shrink-0">
                    Technical:
                  </span>
                  <span>{skills.map((s) => s.name).join(", ")}</span>
                </div>
              )}
              {languages && languages.length > 0 && (
                <div className="flex">
                  <span className="font-bold w-28 flex-shrink-0">
                    Languages:
                  </span>
                  <span>
                    {languages.map((l) => `${l.name} (${l.level})`).join(", ")}
                  </span>
                </div>
              )}
              {hobbies && hobbies.length > 0 && (
                <div className="flex">
                  <span className="font-bold w-28 flex-shrink-0">
                    Interests:
                  </span>
                  <span>{hobbies.map((h) => h.name).join(", ")}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Certifications */}
        {(() => {
          const coursesFromCerts = certifications?.filter(c => c.type === "course") || [];
          const legacyCourses = courses || [];
          const allCourses = [...coursesFromCerts.map(c => ({
            id: c.id,
            name: c.name,
            institution: c.issuer,
            date: c.date,
            credentialId: c.credentialId,
            url: c.url,
          })), ...legacyCourses];
          return allCourses.length > 0 && (
            <section>
              <h2
                className="text-sm font-bold uppercase tracking-[0.1em] border-b pb-1 mb-3"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Certifications
              </h2>

              <div className="text-sm space-y-1">
                {allCourses.map((course) => (
                  <div key={course.id} className="flex gap-2">
                    <span>•</span>
                    <span>
                      <span className="font-medium">{course.name}</span>
                      {course.institution && <span>, {course.institution}</span>}
                      {course.date && (
                        <span className="text-gray-600">
                          {" "}
                          (
                          {new Date(course.date + "-01").toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                          )
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })()}
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

// Wrap with React.memo for performance optimization
export const IvyTemplate = memo(IvyTemplateComponent);
