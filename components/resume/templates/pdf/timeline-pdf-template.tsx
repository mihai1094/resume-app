import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";

interface TimelinePDFTemplateProps {
  data: ResumeData;
}

// Warm slate with coral accent - distinctive and modern
const colors = {
  primary: "#334155",
  accent: "#f97316",
  white: "#ffffff",
  lightGray: "#f8fafc",
  gray: "#64748b",
  darkGray: "#475569",
  text: "#1e293b",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Helvetica",
  },
  // Header Section
  header: {
    backgroundColor: colors.primary,
    padding: 36,
    paddingBottom: 28,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.white,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    maxWidth: 320,
    lineHeight: 1.5,
  },
  yearsBox: {
    alignItems: "flex-end",
  },
  yearsNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.accent,
  },
  yearsLabel: {
    fontSize: 8,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Contact Bar
  contactBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
    gap: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contactIcon: {
    fontSize: 9,
    color: colors.accent,
  },
  contactText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.85)",
  },
  // Main Layout
  mainContainer: {
    flexDirection: "row",
    padding: 32,
    paddingTop: 28,
    gap: 24,
  },
  mainColumn: {
    flex: 2,
  },
  sidebar: {
    flex: 1,
  },
  // Section Styling
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionLine: {
    width: 32,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 0.3,
  },
  // Timeline Items
  timelineContainer: {
    paddingLeft: 14,
    borderLeftWidth: 1,
    borderLeftColor: "#e2e8f0",
  },
  timelineItem: {
    marginBottom: 16,
    position: "relative",
  },
  timelineDot: {
    position: "absolute",
    left: -19,
    top: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
    borderWidth: 3,
  },
  timelineDotActive: {
    borderColor: colors.accent,
  },
  timelineDotInactive: {
    borderColor: "#cbd5e1",
  },
  yearBadge: {
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  yearBadgeActive: {
    backgroundColor: colors.accent,
    color: colors.white,
  },
  yearBadgeInactive: {
    backgroundColor: "#f1f5f9",
    color: colors.primary,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 3,
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 4,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.accent,
  },
  separator: {
    fontSize: 10,
    color: "#d1d5db",
  },
  metaText: {
    fontSize: 9,
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
    color: colors.accent,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 9,
    color: colors.darkGray,
    flex: 1,
    lineHeight: 1.4,
  },
  achievementBox: {
    backgroundColor: "rgba(249, 115, 22, 0.05)",
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  achievementItem: {
    flexDirection: "row",
    marginBottom: 2,
    gap: 4,
  },
  achievementStar: {
    fontSize: 8,
    color: colors.accent,
  },
  achievementText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: "bold",
    flex: 1,
  },
  // Sidebar Sections
  sidebarSection: {
    backgroundColor: "rgba(51, 65, 85, 0.03)",
    padding: 14,
    borderRadius: 6,
    marginBottom: 14,
  },
  sidebarTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(51, 65, 85, 0.15)",
  },
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 8,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 8,
    color: colors.primary,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  languageName: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
  },
  languageLevel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: "capitalize",
  },
  certItem: {
    marginBottom: 8,
  },
  certName: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
  },
  certInstitution: {
    fontSize: 8,
    color: colors.gray,
  },
  hobbiesText: {
    fontSize: 9,
    color: colors.primary,
  },
  hobbySeparator: {
    color: colors.accent,
    marginHorizontal: 4,
  },
  // Projects Grid
  projectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  projectCard: {
    width: "48%",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  projectName: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  projectDesc: {
    fontSize: 8,
    color: colors.darkGray,
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
    color: colors.accent,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
  },
  // Education
  eduItem: {
    marginBottom: 12,
  },
  eduDegree: {
    fontSize: 11,
    fontWeight: "bold",
    color: colors.primary,
  },
  eduField: {
    fontSize: 10,
    color: colors.darkGray,
  },
  eduInstitution: {
    fontSize: 9,
    color: colors.accent,
  },
  eduMeta: {
    fontSize: 8,
    color: colors.gray,
  },
});

export function TimelinePDFTemplate({ data }: TimelinePDFTemplateProps) {
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

  // Calculate years of experience
  const calculateYearsExperience = () => {
    if (sortedExperience.length === 0) return 0;
    const firstJob = sortedExperience[sortedExperience.length - 1];
    const startYear = firstJob
      ? new Date(firstJob.startDate).getFullYear()
      : new Date().getFullYear();
    return new Date().getFullYear() - startYear;
  };

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
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.name}>{fullName || "Your Name"}</Text>
              {personalInfo.summary && (
                <Text style={styles.summaryText}>
                  {personalInfo.summary.split(".").slice(0, 2).join(".")}
                </Text>
              )}
            </View>

            {sortedExperience.length > 0 && (
              <View style={styles.yearsBox}>
                <Text style={styles.yearsNumber}>
                  {calculateYearsExperience()}+
                </Text>
                <Text style={styles.yearsLabel}>Years Experience</Text>
              </View>
            )}
          </View>

          {/* Contact Bar */}
          <View style={styles.contactBar}>
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
                <Text style={styles.contactText}>{personalInfo.location}</Text>
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

        {/* Main Content */}
        <View style={styles.mainContainer}>
          {/* Main Column - Timeline */}
          <View style={styles.mainColumn}>
            {/* Work Experience Timeline */}
            {sortedExperience.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionTitle}>Career Timeline</Text>
                </View>

                <View style={styles.timelineContainer}>
                  {sortedExperience.map((job, index) => (
                    <View key={job.id} style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          index === 0
                            ? styles.timelineDotActive
                            : styles.timelineDotInactive,
                        ]}
                      />

                      <Text
                        style={[
                          styles.yearBadge,
                          index === 0
                            ? styles.yearBadgeActive
                            : styles.yearBadgeInactive,
                        ]}
                      >
                        {new Date(job.startDate).getFullYear()}
                      </Text>

                      <Text style={styles.jobTitle}>{job.position}</Text>

                      <View style={styles.jobMeta}>
                        <Text style={styles.companyName}>{job.company}</Text>
                        {job.location && (
                          <>
                            <Text style={styles.separator}>·</Text>
                            <Text style={styles.metaText}>{job.location}</Text>
                          </>
                        )}
                        <Text style={styles.separator}>·</Text>
                        <Text style={styles.metaText}>
                          {formatDate(job.startDate)} –{" "}
                          {job.current
                            ? "Present"
                            : formatDate(job.endDate || "")}
                        </Text>
                      </View>

                      {job.description && job.description.length > 0 && (
                        <View style={styles.bulletList}>
                          {job.description.map(
                            (item, idx) =>
                              item.trim() && (
                                <View key={idx} style={styles.bulletItem}>
                                  <Text style={styles.bulletArrow}>→</Text>
                                  <Text style={styles.bulletText}>{item}</Text>
                                </View>
                              )
                          )}
                        </View>
                      )}

                      {job.achievements && job.achievements.length > 0 && (
                        <View style={styles.achievementBox}>
                          {job.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <View key={idx} style={styles.achievementItem}>
                                  <Text style={styles.achievementStar}>★</Text>
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
              </View>
            )}

            {/* Education Timeline */}
            {sortedEducation.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionTitle}>Education</Text>
                </View>

                <View style={styles.timelineContainer}>
                  {sortedEducation.map((edu) => (
                    <View key={edu.id} style={styles.eduItem}>
                      <View
                        style={[styles.timelineDot, styles.timelineDotInactive]}
                      />
                      <Text style={styles.eduDegree}>
                        {edu.degree}
                        {edu.field && (
                          <Text style={styles.eduField}> in {edu.field}</Text>
                        )}
                      </Text>
                      <Text style={styles.eduInstitution}>
                        {edu.institution}
                      </Text>
                      <Text style={styles.eduMeta}>
                        {formatDate(edu.startDate)} –{" "}
                        {edu.current
                          ? "Present"
                          : formatDate(edu.endDate || "")}
                        {edu.gpa && ` · GPA: ${edu.gpa}`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionLine} />
                  <Text style={styles.sectionTitle}>Projects</Text>
                </View>

                <View style={styles.projectsGrid}>
                  {projects.map((project) => (
                    <View key={project.id} style={styles.projectCard}>
                      <Text style={styles.projectName}>{project.name}</Text>
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
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            {/* Skills */}
            {skills.length > 0 && (
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

            {/* Languages */}
            {languages && languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Languages</Text>
                {languages.map((lang) => (
                  <View key={lang.id} style={styles.languageRow}>
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
                <Text style={styles.hobbiesText}>
                  {hobbies.map((hobby, idx) => (
                    <React.Fragment key={hobby.id}>
                      {hobby.name}
                      {idx < hobbies.length - 1 && (
                        <Text style={styles.hobbySeparator}> · </Text>
                      )}
                    </React.Fragment>
                  ))}
                </Text>
              </View>
            )}

            {/* Extra-curricular */}
            {extraCurricular && extraCurricular.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Activities</Text>
                {extraCurricular.map((activity) => (
                  <View key={activity.id} style={styles.certItem}>
                    <Text style={styles.certName}>{activity.title}</Text>
                    {activity.organization && (
                      <Text style={styles.certInstitution}>
                        {activity.organization}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
