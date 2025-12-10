import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";

interface AdaptivePDFTemplateProps {
  data: ResumeData;
}

// Indigo primary with emerald accent
const colors = {
  primary: "#4f46e5",
  secondary: "#10b981",
  white: "#ffffff",
  gray: "#6b7280",
  lightGray: "#f9fafb",
  text: "#374151",
  dark: "#111827",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Helvetica",
    padding: 40,
  },
  // Header
  header: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 16,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  summary: {
    fontSize: 10,
    color: colors.gray,
    lineHeight: 1.5,
    maxWidth: 350,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    justifyContent: "flex-end",
  },
  contactIcon: {
    fontSize: 8,
    color: colors.secondary,
  },
  contactText: {
    fontSize: 9,
    color: colors.gray,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionLine: {
    width: 24,
    height: 3,
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 20,
  },
  // Experience Items
  experienceItem: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginBottom: 14,
  },
  experienceActive: {
    borderLeftColor: colors.secondary,
  },
  experienceInactive: {
    borderLeftColor: "#e5e7eb",
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  experienceTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  experienceDate: {
    fontSize: 8,
    color: colors.gray,
  },
  experienceCompany: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 6,
  },
  experienceLocation: {
    fontFamily: "Helvetica",
    fontWeight: "normal",
    color: colors.gray,
  },
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    gap: 6,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
    marginTop: 5,
  },
  bulletText: {
    fontSize: 9,
    color: colors.gray,
    flex: 1,
    lineHeight: 1.4,
  },
  // Achievements Box
  achievementsBox: {
    backgroundColor: "rgba(79, 70, 229, 0.05)",
    padding: 10,
    marginTop: 6,
    borderRadius: 4,
  },
  achievementItem: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 3,
  },
  achievementCheck: {
    fontSize: 8,
    color: colors.secondary,
    marginTop: 1,
  },
  achievementText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.text,
    flex: 1,
    lineHeight: 1.4,
  },
  // Projects
  projectCard: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  projectName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  projectLink: {
    fontSize: 8,
    color: colors.primary,
  },
  projectDesc: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  projectTechWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  projectTech: {
    fontSize: 7,
    color: colors.secondary,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  // Activities
  activityItem: {
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 10,
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  activityOrg: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
  },
  activityDesc: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 2,
    lineHeight: 1.4,
  },
  // Sidebar Sections
  sidebarSection: {
    marginBottom: 18,
  },
  sidebarTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(79, 70, 229, 0.15)",
  },
  // Skills
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginBottom: 5,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    color: colors.text,
    backgroundColor: colors.lightGray,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  // Education
  educationItem: {
    marginBottom: 12,
  },
  educationInstitution: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  educationDegree: {
    fontSize: 9,
    color: colors.text,
  },
  educationField: {
    color: colors.text,
  },
  educationMeta: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 2,
  },
  // Languages
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  languageName: {
    fontSize: 9,
    color: colors.text,
  },
  languageLevel: {
    fontSize: 9,
    color: colors.gray,
    textTransform: "capitalize",
  },
  // Certifications
  certItem: {
    marginBottom: 6,
  },
  certName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.dark,
  },
  certInstitution: {
    fontSize: 8,
    color: colors.gray,
  },
  // Interests
  interestsText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.5,
  },
});

export function AdaptivePDFTemplate({ data }: AdaptivePDFTemplateProps) {
  const {
    personalInfo,
    workExperience,
    education,
    skills,
    languages,
    courses,
    hobbies,
    projects,
    extraCurricular,
  } = data;
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

  const documentTitle = fullName ? `${fullName} - Resume` : "Resume";

  return (
    <Document
      title={documentTitle}
      author={fullName || "ResumeForge User"}
      subject="Professional Resume"
      keywords="resume, cv, professional, career"
      creator="ResumeForge"
      producer="ResumeForge - react-pdf"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.name}>{fullName || "Your Name"}</Text>
              {personalInfo.summary && (
                <Text style={styles.summary}>{personalInfo.summary}</Text>
              )}
            </View>

            <View style={styles.headerRight}>
              {personalInfo.email && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>✉</Text>
                  <Text style={styles.contactText}>{personalInfo.email}</Text>
                </View>
              )}
              {personalInfo.phone && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>☎</Text>
                  <Text style={styles.contactText}>{personalInfo.phone}</Text>
                </View>
              )}
              {personalInfo.location && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>◉</Text>
                  <Text style={styles.contactText}>
                    {personalInfo.location}
                  </Text>
                </View>
              )}
              {personalInfo.linkedin && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>in</Text>
                  <Text style={styles.contactText}>
                    {personalInfo.linkedin
                      .replace(/^https?:\/\/(www\.)?/, "")
                      .split("/")
                      .slice(0, 2)
                      .join("/")}
                  </Text>
                </View>
              )}
              {personalInfo.github && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>⌂</Text>
                  <Text style={styles.contactText}>
                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </Text>
                </View>
              )}
              {personalInfo.website && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>◎</Text>
                  <Text style={styles.contactText}>
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContainer}>
          {/* Main Column */}
          <View style={styles.mainColumn}>
            {/* Experience Section */}
            {sortedExperience.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionTitle}>Experience</Text>
                </View>

                {sortedExperience.map((exp, index) => (
                  <View
                    key={exp.id}
                    style={[
                      styles.experienceItem,
                      index === 0
                        ? styles.experienceActive
                        : styles.experienceInactive,
                    ]}
                  >
                    <View style={styles.experienceHeader}>
                      <Text style={styles.experienceTitle}>{exp.position}</Text>
                      <Text style={styles.experienceDate}>
                        {formatDate(exp.startDate)} —{" "}
                        {exp.current
                          ? "Present"
                          : formatDate(exp.endDate || "")}
                      </Text>
                    </View>
                    <Text style={styles.experienceCompany}>
                      {exp.company}
                      {exp.location && (
                        <Text style={styles.experienceLocation}>
                          {" "}
                          · {exp.location}
                        </Text>
                      )}
                    </Text>

                    {exp.description.length > 0 && (
                      <View style={styles.bulletList}>
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <View key={idx} style={styles.bulletItem}>
                                <View style={styles.bulletDot} />
                                <Text style={styles.bulletText}>{item}</Text>
                              </View>
                            )
                        )}
                      </View>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <View style={styles.achievementsBox}>
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <View key={idx} style={styles.achievementItem}>
                                <Text style={styles.achievementCheck}>✓</Text>
                                <Text style={styles.achievementText}>
                                  {achievement}
                                </Text>
                              </View>
                            )
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionTitle}>Projects</Text>
                </View>

                {projects.map((project) => (
                  <View key={project.id} style={styles.projectCard}>
                    <View style={styles.projectHeader}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      {project.url && <Text style={styles.projectLink}>↗</Text>}
                    </View>
                    <Text style={styles.projectDesc}>
                      {project.description}
                    </Text>
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <View style={styles.projectTechWrap}>
                          {project.technologies.map((tech, i) => (
                            <Text key={i} style={styles.projectTech}>
                              {tech}
                            </Text>
                          ))}
                        </View>
                      )}
                  </View>
                ))}
              </View>
            )}

            {/* Activities */}
            {extraCurricular && extraCurricular.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionTitle}>Activities</Text>
                </View>

                {extraCurricular.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <Text style={styles.activityTitle}>
                      {activity.title}
                      {activity.organization && (
                        <Text style={styles.activityOrg}>
                          {" "}
                          — {activity.organization}
                        </Text>
                      )}
                    </Text>
                    {activity.description &&
                      activity.description.length > 0 && (
                        <Text style={styles.activityDesc}>
                          {activity.description[0]}
                        </Text>
                      )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            {/* Skills */}
            {Object.keys(skillsByCategory).length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Skills</Text>
                {Object.entries(skillsByCategory).map(
                  ([category, categorySkills]) => (
                    <View key={category} style={styles.skillCategory}>
                      <Text style={styles.skillCategoryTitle}>{category}</Text>
                      <View style={styles.skillsWrap}>
                        {categorySkills.map((skill) => (
                          <Text key={skill.id} style={styles.skillTag}>
                            {skill.name}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )
                )}
              </View>
            )}

            {/* Education */}
            {sortedEducation.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Education</Text>
                {sortedEducation.map((edu) => (
                  <View key={edu.id} style={styles.educationItem}>
                    <Text style={styles.educationInstitution}>
                      {edu.institution}
                    </Text>
                    <Text style={styles.educationDegree}>
                      {edu.degree}
                      {edu.field && (
                        <Text style={styles.educationField}>
                          {" "}
                          in {edu.field}
                        </Text>
                      )}
                    </Text>
                    <Text style={styles.educationMeta}>
                      {formatDate(edu.startDate)} —{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      {edu.gpa && ` · GPA: ${edu.gpa}`}
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
            {(() => {
              const certs = data.certifications?.filter(c => c.type !== "course") || [];
              const coursesFromCerts = data.certifications?.filter(c => c.type === "course") || [];
              const legacyCourses = courses || [];
              // Normalize all items to have the same shape
              const allItems = [
                ...certs.map(c => ({ id: c.id, name: c.name, institution: c.issuer })),
                ...coursesFromCerts.map(c => ({ id: c.id, name: c.name, institution: c.issuer })),
                ...legacyCourses.map(c => ({ id: c.id, name: c.name, institution: c.institution })),
              ];
              return allItems.length > 0 && (
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarTitle}>Certifications</Text>
                  {allItems.map((item) => (
                    <View key={item.id} style={styles.certItem}>
                      <Text style={styles.certName}>{item.name}</Text>
                      {item.institution && (
                        <Text style={styles.certInstitution}>
                          {item.institution}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              );
            })()}

            {/* Hobbies */}
            {hobbies && hobbies.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Interests</Text>
                <Text style={styles.interestsText}>
                  {hobbies.map((hobby) => hobby.name).join(" · ")}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
