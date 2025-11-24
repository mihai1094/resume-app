import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";

interface CreativePDFTemplateProps {
  data: ResumeData;
}

// Creative color palette - warm coral and deep charcoal
const colors = {
  primary: "#E85D4C",
  secondary: "#1a1a1a",
  background: "#FAFAF8",
  white: "#ffffff",
  gray: "#666666",
  lightGray: "#f5f5f5",
  text: "#333333",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    fontFamily: "Helvetica",
    position: "relative",
  },
  // Geometric accent
  topAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 140,
    height: 140,
    backgroundColor: colors.primary,
    opacity: 0.15,
  },
  bottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  content: {
    padding: 36,
  },
  // Header
  header: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  // Large Initials
  initialsBackground: {
    position: "absolute",
    top: -10,
    left: -8,
    fontSize: 80,
    fontFamily: "Times-Bold",
    color: colors.primary,
    opacity: 0.12,
  },
  nameContainer: {
    position: "relative",
  },
  firstName: {
    fontSize: 36,
    fontFamily: "Times-Bold",
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  lastName: {
    fontSize: 36,
    fontFamily: "Times-Bold",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  summaryText: {
    fontSize: 11,
    color: colors.gray,
    lineHeight: 1.6,
    maxWidth: 280,
    marginTop: 12,
  },
  // Contact Card
  contactCard: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: 14,
    paddingVertical: 8,
    minWidth: 160,
  },
  contactItem: {
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 7,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  contactText: {
    fontSize: 9,
    color: colors.secondary,
  },
  contactLink: {
    fontSize: 9,
    color: colors.primary,
  },
  // Main Grid
  mainGrid: {
    flexDirection: "row",
    gap: 24,
  },
  mainColumn: {
    flex: 3,
  },
  sidebar: {
    flex: 2,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionNumber: {
    width: 22,
    height: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionNumberText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    color: colors.secondary,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 22,
  },
  // Experience Items
  experienceItem: {
    borderLeftWidth: 2,
    paddingLeft: 14,
    marginBottom: 16,
  },
  experienceActive: {
    borderLeftColor: colors.primary,
  },
  experienceInactive: {
    borderLeftColor: "#e5e5e5",
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
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
  bulletArrow: {
    fontSize: 9,
    color: colors.primary,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 9,
    color: colors.gray,
    flex: 1,
    lineHeight: 1.4,
  },
  // Achievements Box
  achievementsBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    padding: 10,
    marginTop: 8,
  },
  achievementsLabel: {
    fontSize: 7,
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  achievementItem: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 3,
  },
  achievementStar: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.primary,
    marginTop: 1,
  },
  achievementText: {
    fontSize: 9,
    color: colors.text,
    flex: 1,
    lineHeight: 1.4,
  },
  // Projects Grid
  projectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  projectCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    padding: 10,
  },
  projectName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 8,
    color: colors.gray,
    lineHeight: 1.4,
    marginBottom: 6,
  },
  projectTechWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  projectTech: {
    fontSize: 7,
    color: colors.gray,
    backgroundColor: colors.lightGray,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  // Sidebar Sections
  sidebarSection: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    padding: 14,
    marginBottom: 14,
  },
  sidebarTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: colors.secondary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  // Skills
  skillCategory: {
    marginBottom: 12,
  },
  skillCategoryTitle: {
    fontSize: 8,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  // Education
  educationItem: {
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: 10,
    marginBottom: 12,
  },
  educationDegree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
  },
  educationField: {
    fontFamily: "Helvetica",
    color: colors.gray,
  },
  educationInstitution: {
    fontSize: 9,
    color: colors.gray,
  },
  educationDate: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 2,
  },
  // Languages
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  languageItem: {
    width: "50%",
    marginBottom: 6,
  },
  languageName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
  },
  languageLevel: {
    fontSize: 8,
    color: colors.gray,
  },
  // Certifications
  certItem: {
    marginBottom: 8,
  },
  certName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
  },
  certInstitution: {
    fontSize: 8,
    color: colors.gray,
  },
  // Interests
  interestsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  interestText: {
    fontSize: 9,
    color: colors.gray,
  },
  interestSeparator: {
    fontSize: 9,
    color: colors.primary,
    marginHorizontal: 6,
  },
  // Activities Section
  activitiesSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  activityItem: {
    width: "50%",
    paddingRight: 12,
    marginBottom: 12,
    flexDirection: "row",
    gap: 8,
  },
  activityBar: {
    width: 3,
    backgroundColor: colors.primary,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.secondary,
  },
  activityOrg: {
    fontSize: 9,
    color: colors.gray,
  },
  activityRole: {
    fontSize: 8,
    color: colors.gray,
  },
  activityDesc: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 2,
    lineHeight: 1.4,
  },
});

export function CreativePDFTemplate({ data }: CreativePDFTemplateProps) {
  const { personalInfo, workExperience, education, skills, languages, courses, hobbies, projects, extraCurricular } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
  const initials = `${personalInfo.firstName?.[0] || ""}${personalInfo.lastName?.[0] || ""}`;

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
        <View style={styles.topAccent} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text style={styles.initialsBackground}>{initials}</Text>
                <View style={styles.nameContainer}>
                  <Text style={styles.firstName}>{personalInfo.firstName || "Your"}</Text>
                  <Text style={styles.lastName}>{personalInfo.lastName || "Name"}</Text>
                </View>
                {personalInfo.summary && (
                  <Text style={styles.summaryText}>{personalInfo.summary}</Text>
                )}
              </View>

              {/* Contact Card */}
              <View style={styles.contactCard}>
                {personalInfo.email && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactText}>{personalInfo.email}</Text>
                  </View>
                )}
                {personalInfo.phone && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactText}>{personalInfo.phone}</Text>
                  </View>
                )}
                {personalInfo.location && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Location</Text>
                    <Text style={styles.contactText}>{personalInfo.location}</Text>
                  </View>
                )}
                {personalInfo.linkedin && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>LinkedIn</Text>
                    <Text style={styles.contactLink}>
                      {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                    </Text>
                  </View>
                )}
                {personalInfo.website && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactLabel}>Portfolio</Text>
                    <Text style={styles.contactLink}>
                      {personalInfo.website.replace(/^https?:\/\//, "")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Main Grid */}
          <View style={styles.mainGrid}>
            {/* Main Column - Experience */}
            <View style={styles.mainColumn}>
              {/* Experience Section */}
              {sortedExperience.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionNumber}>
                      <Text style={styles.sectionNumberText}>01</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Experience</Text>
                  </View>

                  {sortedExperience.map((exp, index) => (
                    <View
                      key={exp.id}
                      style={[
                        styles.experienceItem,
                        index === 0 ? styles.experienceActive : styles.experienceInactive
                      ]}
                    >
                      <View style={styles.experienceHeader}>
                        <Text style={styles.experienceTitle}>{exp.position}</Text>
                        <Text style={styles.experienceDate}>
                          {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                        </Text>
                      </View>
                      <Text style={styles.experienceCompany}>
                        {exp.company}
                        {exp.location && (
                          <Text style={styles.experienceLocation}> · {exp.location}</Text>
                        )}
                      </Text>

                      {exp.description.length > 0 && (
                        <View style={styles.bulletList}>
                          {exp.description.map((item, idx) => item.trim() && (
                            <View key={idx} style={styles.bulletItem}>
                              <Text style={styles.bulletArrow}>→</Text>
                              <Text style={styles.bulletText}>{item}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {exp.achievements && exp.achievements.length > 0 && (
                        <View style={styles.achievementsBox}>
                          <Text style={styles.achievementsLabel}>Key Achievements</Text>
                          {exp.achievements.map((achievement, idx) => achievement.trim() && (
                            <View key={idx} style={styles.achievementItem}>
                              <Text style={styles.achievementStar}>✦</Text>
                              <Text style={styles.achievementText}>{achievement}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Projects Section */}
              {projects && projects.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionNumber}>
                      <Text style={styles.sectionNumberText}>02</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Projects</Text>
                  </View>

                  <View style={styles.projectsGrid}>
                    {projects.map((project) => (
                      <View key={project.id} style={styles.projectCard}>
                        <Text style={styles.projectName}>{project.name}</Text>
                        <Text style={styles.projectDesc}>{project.description}</Text>
                        {project.technologies && project.technologies.length > 0 && (
                          <View style={styles.projectTechWrap}>
                            {project.technologies.slice(0, 3).map((tech, i) => (
                              <Text key={i} style={styles.projectTech}>{tech}</Text>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Sidebar */}
            <View style={styles.sidebar}>
              {/* Skills */}
              {Object.keys(skillsByCategory).length > 0 && (
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarTitle}>Expertise</Text>
                  {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <View key={category} style={styles.skillCategory}>
                      <Text style={styles.skillCategoryTitle}>{category}</Text>
                      <View style={styles.skillsWrap}>
                        {categorySkills.map((skill) => (
                          <Text key={skill.id} style={styles.skillTag}>{skill.name}</Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Education */}
              {sortedEducation.length > 0 && (
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarTitle}>Education</Text>
                  {sortedEducation.map((edu) => (
                    <View key={edu.id} style={styles.educationItem}>
                      <Text style={styles.educationDegree}>
                        {edu.degree}
                        {edu.field && <Text style={styles.educationField}> in {edu.field}</Text>}
                      </Text>
                      <Text style={styles.educationInstitution}>{edu.institution}</Text>
                      <Text style={styles.educationDate}>
                        {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarTitle}>Languages</Text>
                  <View style={styles.languageGrid}>
                    {languages.map((lang) => (
                      <View key={lang.id} style={styles.languageItem}>
                        <Text style={styles.languageName}>{lang.name}</Text>
                        <Text style={styles.languageLevel}>{lang.level}</Text>
                      </View>
                    ))}
                  </View>
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
                  <View style={styles.interestsWrap}>
                    {hobbies.map((hobby, idx) => (
                      <View key={hobby.id} style={styles.interestItem}>
                        <Text style={styles.interestText}>{hobby.name}</Text>
                        {idx < hobbies.length - 1 && (
                          <Text style={styles.interestSeparator}>·</Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Activities Section */}
          {extraCurricular && extraCurricular.length > 0 && (
            <View style={styles.activitiesSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>03</Text>
                </View>
                <Text style={styles.sectionTitle}>Leadership & Activities</Text>
              </View>

              <View style={styles.activitiesGrid}>
                {extraCurricular.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityBar} />
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityOrg}>
                        {activity.organization}
                        {activity.role && <Text style={styles.activityRole}> · {activity.role}</Text>}
                      </Text>
                      {activity.description && activity.description.length > 0 && (
                        <Text style={styles.activityDesc}>{activity.description[0]}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomAccent} />
      </Page>
    </Document>
  );
}

