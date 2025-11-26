import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";

interface MinimalistPDFTemplateProps {
  data: ResumeData;
}

// Minimalist color palette - pure black with strategic gray
const colors = {
  black: "#000000",
  darkGray: "#333333",
  gray: "#666666",
  lightGray: "#999999",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Helvetica",
    padding: 56,
  },
  // Header
  header: {
    marginBottom: 40,
  },
  headerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
    maxWidth: "65%",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  name: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  summary: {
    fontSize: 10,
    color: colors.gray,
    lineHeight: 1.6,
    fontWeight: 300,
  },
  contactInfo: {
    gap: 3,
  },
  contactText: {
    fontSize: 9,
    color: colors.gray,
    fontWeight: 300,
  },
  contactLink: {
    fontSize: 9,
    color: colors.black,
  },
  headerLine: {
    height: 1,
    backgroundColor: colors.black,
    marginTop: 24,
  },
  // Main Layout
  mainContainer: {
    flexDirection: "row",
    gap: 24,
  },
  mainColumn: {
    flex: 2,
  },
  sidebar: {
    flex: 1,
  },
  // Section Headers
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 18,
  },
  section: {
    marginBottom: 28,
  },
  // Experience
  experienceItem: {
    marginBottom: 18,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  experienceLeft: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  experienceCompany: {
    fontSize: 10,
    color: colors.gray,
  },
  experienceDate: {
    fontSize: 9,
    color: colors.lightGray,
    textAlign: "right",
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 9,
    color: colors.darkGray,
    lineHeight: 1.5,
  },
  achievementItem: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.black,
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 9,
    color: colors.black,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.5,
  },
  // Education
  educationItem: {
    marginBottom: 14,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  educationDegree: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  educationField: {
    fontFamily: "Helvetica",
    color: colors.gray,
  },
  educationInstitution: {
    fontSize: 10,
    color: colors.gray,
  },
  educationGPA: {
    fontSize: 9,
    color: colors.lightGray,
    marginTop: 2,
  },
  // Projects
  projectItem: {
    marginBottom: 14,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  projectName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  projectUrl: {
    fontSize: 9,
    color: colors.lightGray,
  },
  projectDesc: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.5,
  },
  projectTech: {
    fontSize: 8,
    color: colors.lightGray,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 6,
  },
  // Activities
  activityItem: {
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  activityTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  activityOrg: {
    fontSize: 10,
    color: colors.gray,
  },
  activityDesc: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 2,
    lineHeight: 1.5,
  },
  // Sidebar sections
  sidebarSection: {
    marginBottom: 24,
  },
  sidebarTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 12,
  },
  // Skills
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 8,
    color: colors.lightGray,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  skillsList: {
    fontSize: 9,
    color: colors.darkGray,
    lineHeight: 1.5,
  },
  // Languages
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  languageName: {
    fontSize: 9,
    color: colors.darkGray,
  },
  languageLevel: {
    fontSize: 9,
    color: colors.lightGray,
    textTransform: "capitalize",
  },
  // Certifications
  certItem: {
    marginBottom: 8,
  },
  certName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
  },
  certInstitution: {
    fontSize: 8,
    color: colors.lightGray,
  },
  // Interests
  interestsText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.5,
  },
});

export function MinimalistPDFTemplate({ data }: MinimalistPDFTemplateProps) {
  const { personalInfo, workExperience, education, skills, languages, courses, hobbies, projects, extraCurricular } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerGrid}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{fullName || "Your Name"}</Text>
              {personalInfo.summary && (
                <Text style={styles.summary}>{personalInfo.summary}</Text>
              )}
            </View>

            <View style={styles.headerRight}>
              <View style={styles.contactInfo}>
                {personalInfo.email && (
                  <Text style={styles.contactText}>{personalInfo.email}</Text>
                )}
                {personalInfo.phone && (
                  <Text style={styles.contactText}>{personalInfo.phone}</Text>
                )}
                {personalInfo.location && (
                  <Text style={styles.contactText}>{personalInfo.location}</Text>
                )}
                {personalInfo.website && (
                  <Text style={styles.contactLink}>
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </Text>
                )}
                {personalInfo.linkedin && (
                  <Text style={styles.contactLink}>
                    {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/")}
                  </Text>
                )}
                {personalInfo.github && (
                  <Text style={styles.contactLink}>
                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.headerLine} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContainer}>
          {/* Main Column */}
          <View style={styles.mainColumn}>
            {/* Experience */}
            {sortedExperience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experience</Text>

                {sortedExperience.map((exp) => (
                  <View key={exp.id} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <View style={styles.experienceLeft}>
                        <Text style={styles.experienceTitle}>{exp.position}</Text>
                        <Text style={styles.experienceCompany}>
                          {exp.company}
                          {exp.location && ` — ${exp.location}`}
                        </Text>
                      </View>
                      <Text style={styles.experienceDate}>
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                      </Text>
                    </View>

                    {exp.description.length > 0 && (
                      <View style={styles.bulletList}>
                        {exp.description.map((item, idx) => item.trim() && (
                          <View key={idx} style={styles.bulletItem}>
                            <Text style={styles.bulletText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <View style={styles.bulletList}>
                        {exp.achievements.map((achievement, idx) => achievement.trim() && (
                          <View key={idx} style={styles.achievementItem}>
                            <Text style={styles.achievementText}>{achievement}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {sortedEducation.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>

                {sortedEducation.map((edu) => (
                  <View key={edu.id} style={styles.educationItem}>
                    <View style={styles.educationHeader}>
                      <View>
                        <Text style={styles.educationDegree}>
                          {edu.degree}
                          {edu.field && <Text style={styles.educationField}> in {edu.field}</Text>}
                        </Text>
                        <Text style={styles.educationInstitution}>{edu.institution}</Text>
                        {edu.gpa && <Text style={styles.educationGPA}>GPA: {edu.gpa}</Text>}
                      </View>
                      <Text style={styles.experienceDate}>
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Selected Projects</Text>

                {projects.map((project) => (
                  <View key={project.id} style={styles.projectItem}>
                    <View style={styles.projectHeader}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      {project.url && (
                        <Text style={styles.projectUrl}>
                          {project.url.replace(/^https?:\/\//, "")}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.projectDesc}>{project.description}</Text>
                    {project.technologies && project.technologies.length > 0 && (
                      <Text style={styles.projectTech}>
                        {project.technologies.join(" · ")}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Activities */}
            {extraCurricular && extraCurricular.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Activities</Text>

                {extraCurricular.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityHeader}>
                      <View>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        {activity.organization && (
                          <Text style={styles.activityOrg}> — {activity.organization}</Text>
                        )}
                      </View>
                      {(activity.startDate || activity.endDate) && (
                        <Text style={styles.experienceDate}>
                          {activity.startDate && formatDate(activity.startDate)} — {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                        </Text>
                      )}
                    </View>
                    {activity.description && activity.description.length > 0 && (
                      <Text style={styles.activityDesc}>{activity.description[0]}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            {/* Skills */}
            {skills.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Skills</Text>

                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <View key={category} style={styles.skillCategory}>
                    <Text style={styles.skillCategoryTitle}>{category}</Text>
                    <Text style={styles.skillsList}>
                      {categorySkills.map((skill) => skill.name).join(", ")}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Languages</Text>

                {languages.map((lang) => (
                  <View key={lang.id} style={styles.languageItem}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.languageLevel}>{lang.level}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {courses && courses.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Certifications</Text>

                {courses.map((course) => (
                  <View key={course.id} style={styles.certItem}>
                    <Text style={styles.certName}>{course.name}</Text>
                    {course.institution && (
                      <Text style={styles.certInstitution}>{course.institution}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Interests */}
            {hobbies && hobbies.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Interests</Text>
                <Text style={styles.interestsText}>
                  {hobbies.map((hobby) => hobby.name).join(", ")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}





