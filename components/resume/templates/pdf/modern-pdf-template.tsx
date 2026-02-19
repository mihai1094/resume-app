import React, { useMemo } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import {
  PDF_FONTS,
  PDF_COLORS,
  PDF_ICONS,
  PDFCustomization,
  getCustomizedColors,
  getCustomizedFont,
} from "@/lib/pdf/fonts";

interface ModernPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Colors type for modern template
 */
type ModernColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
  sidebar: string;
};

/**
 * Create styles dynamically based on customization
 */
function createStyles(colors: ModernColors, fontFamily: string, customization?: PDFCustomization) {
  const baseFontSize = customization?.fontSize || 10;
  const lineSpacing = customization?.lineSpacing || 1.4;

  return StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: colors.background,
    fontFamily,
  },
  // Sidebar - left column
  sidebar: {
    width: "32%",
    backgroundColor: colors.sidebar,
    padding: 24,
    paddingTop: 32,
    color: "#ffffff",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    alignSelf: "center",
    objectFit: "cover",
  },
  sidebarName: {
    fontSize: 22,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 4,
    lineHeight: 1.2,
  },
  sidebarNameLast: {
    fontSize: 22,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 16,
    lineHeight: 1.2,
  },
  sidebarSummary: {
    fontSize: 8,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 1.5,
    marginBottom: 20,
  },
  sidebarSection: {
    marginBottom: 18,
  },
  sidebarSectionTitle: {
    fontSize: 8,
    fontWeight: 600,
    color: "rgba(255,255,255,0.6)",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  contactIcon: {
    fontSize: 9,
    color: "rgba(255,255,255,0.6)",
    marginRight: 8,
    width: 12,
  },
  contactText: {
    fontSize: 9,
    color: "#ffffff",
    flex: 1,
  },
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryName: {
    fontSize: 7,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillPill: {
    fontSize: 8,
    color: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  languageName: {
    fontSize: 9,
    color: "#ffffff",
  },
  languageLevel: {
    fontSize: 8,
    color: "rgba(255,255,255,0.6)",
  },
  hobbyText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  // Main content - right column
  main: {
    width: "68%",
    padding: 28,
    paddingTop: 32,
  },
  mainSection: {
    marginBottom: 18,
  },
  mainSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(13,148,136,0.1)",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionDot: {
    width: 6,
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  mainSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.text,
  },
  // Experience items
  experienceItem: {
    marginBottom: 14,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
  experienceItemFirst: {
    marginBottom: 14,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.text,
  },
  experienceCompany: {
    fontSize: 10,
    color: colors.primary,
  },
  experienceLocation: {
    fontSize: 9,
    color: colors.muted,
  },
  experienceDate: {
    fontSize: 8,
    color: colors.muted,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginRight: 8,
    marginTop: 5,
  },
  bulletText: {
    fontSize: 9,
    color: colors.muted,
    flex: 1,
    lineHeight: 1.4,
  },
  achievementsBox: {
    backgroundColor: "rgba(13,148,136,0.05)",
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  achievementsTitle: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  achievementItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  achievementCheck: {
    fontSize: 9,
    color: colors.accent,
    marginRight: 6,
  },
  achievementText: {
    fontSize: 9,
    color: "#374151",
    flex: 1,
  },
  // Education
  educationItem: {
    marginBottom: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
  educationDegree: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.text,
  },
  educationField: {
    fontSize: 11,
    fontWeight: 400,
    color: colors.muted,
  },
  educationInstitution: {
    fontSize: 10,
    color: colors.primary,
  },
  educationGpa: {
    fontSize: 8,
    color: colors.muted,
    marginTop: 2,
  },
  // Projects grid
  projectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  projectCard: {
    width: "48%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 4,
    marginBottom: 8,
  },
  projectName: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.4,
    marginBottom: 4,
  },
  projectTechRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  projectTech: {
    fontSize: 7,
    color: colors.primary,
    backgroundColor: "rgba(13,148,136,0.1)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  // Certifications
  certItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  certIcon: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(13,148,136,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  certCheck: {
    fontSize: 10,
    color: colors.primary,
  },
  certName: {
    fontSize: 10,
    fontWeight: 500,
    color: colors.text,
  },
  certIssuer: {
    fontSize: 8,
    color: colors.muted,
  },
  // Extra-curricular
  activityItem: {
    marginBottom: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
  activityTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.text,
  },
  activityOrg: {
    fontSize: 9,
    color: colors.primary,
  },
  activityRole: {
    fontSize: 9,
    color: colors.muted,
  },
  // Custom sections
  customSectionItem: {
    marginBottom: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#e5e7eb",
  },
  customItemTitle: {
    fontSize: 10,
    fontWeight: 500,
    color: colors.text,
  },
  customItemMeta: {
    fontSize: 8,
    color: colors.muted,
  },
  customItemDescription: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 2,
  },
  // Page number for multi-page resumes
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 30,
    fontSize: 9,
    color: colors.muted,
  },
  });
}

export function ModernPDFTemplate({
  data,
  customization,
}: ModernPDFTemplateProps) {
  // Get customized colors and font
  const colors = getCustomizedColors(PDF_COLORS.modern, customization) as ModernColors;
  const fontFamily = getCustomizedFont(customization);

  // Create styles with customization
  const styles = useMemo(
    () => createStyles(colors, fontFamily, customization),
    [colors, fontFamily, customization]
  );

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

  const topSkillCategories = Object.entries(skillsByCategory).slice(0, 4);

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
  const documentTitle = fullName ? `${fullName} - Resume` : "Resume";

  // Get certifications and courses
  const certs = data.certifications?.filter((c) => c.type !== "course") || [];
  const coursesFromCerts =
    data.certifications?.filter((c) => c.type === "course") || [];
  const legacyCourses = data.courses || [];
  const allCourses = [
    ...coursesFromCerts.map((c) => ({
      id: c.id,
      name: c.name,
      institution: c.issuer,
      date: c.date,
    })),
    ...legacyCourses,
  ];

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
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Photo */}
          {personalInfo.photo && (
            <Image src={personalInfo.photo} style={styles.photo} />
          )}

          {/* Name */}
          <Text style={styles.sidebarName}>
            {personalInfo.firstName || "Your"}
          </Text>
          <Text style={styles.sidebarNameLast}>
            {personalInfo.lastName || "Name"}
          </Text>

          {/* Summary - truncated for sidebar */}
          {personalInfo.summary && (
            <Text style={styles.sidebarSummary}>
              {personalInfo.summary.length > 150
                ? personalInfo.summary.slice(0, 150) + "..."
                : personalInfo.summary}
            </Text>
          )}

          {/* Contact Section */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>

            {personalInfo.email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>{PDF_ICONS.email}</Text>
                <Text style={styles.contactText}>{personalInfo.email}</Text>
              </View>
            )}

            {personalInfo.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>{PDF_ICONS.phone}</Text>
                <Text style={styles.contactText}>{personalInfo.phone}</Text>
              </View>
            )}

            {personalInfo.location && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>{PDF_ICONS.location}</Text>
                <Text style={styles.contactText}>{personalInfo.location}</Text>
              </View>
            )}

            {personalInfo.website && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>{PDF_ICONS.website}</Text>
                <Text style={styles.contactText}>
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </Text>
              </View>
            )}

            {personalInfo.linkedin && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>{PDF_ICONS.linkedin}</Text>
                <Text style={styles.contactText}>
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                </Text>
              </View>
            )}

            {personalInfo.github && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>{PDF_ICONS.github}</Text>
                <Text style={styles.contactText}>
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                </Text>
              </View>
            )}
          </View>

          {/* Skills Section */}
          {topSkillCategories.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {topSkillCategories.map(([category, categorySkills]) => (
                <View key={category} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryName}>{category}</Text>
                  <View style={styles.skillsRow}>
                    {categorySkills.map((skill) => (
                      <Text key={skill.id} style={styles.skillPill}>
                        {skill.name}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Languages Section */}
          {data.languages && data.languages.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Languages</Text>
              {data.languages.map((lang) => (
                <View key={lang.id} style={styles.languageRow}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageLevel}>{lang.level}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Hobbies Section */}
          {data.hobbies && data.hobbies.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Interests</Text>
              {data.hobbies.map((hobby, index) => (
                <Text key={hobby.id} style={styles.hobbyText}>
                  {hobby.name}
                  {index < (data.hobbies?.length || 0) - 1 ? " " : ""}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Experience Section */}
          {sortedExperience.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.mainSectionTitle}>
                  Professional Experience
                </Text>
              </View>

              {sortedExperience.map((exp, index) => (
                <View
                  key={exp.id}
                  wrap={false}
                  style={
                    index === 0
                      ? styles.experienceItemFirst
                      : styles.experienceItem
                  }
                >
                  <View style={styles.experienceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.experienceTitle}>{exp.position}</Text>
                      <Text style={styles.experienceCompany}>
                        {exp.company}
                        {exp.location && (
                          <Text style={styles.experienceLocation}>
                            {" "}
                            {PDF_ICONS.bullet} {exp.location}
                          </Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.experienceDate}>
                      {formatDate(exp.startDate)} {PDF_ICONS.arrow}{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </Text>
                  </View>

                  {exp.description && exp.description.length > 0 && (
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
                      <Text style={styles.achievementsTitle}>
                        Key Achievements
                      </Text>
                      {exp.achievements.map(
                        (achievement, idx) =>
                          achievement.trim() && (
                            <View key={idx} style={styles.achievementItem}>
                              <Text style={styles.achievementCheck}>
                                {PDF_ICONS.check}
                              </Text>
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

          {/* Education Section */}
          {sortedEducation.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.mainSectionTitle}>Education</Text>
              </View>

              {sortedEducation.map((edu) => (
                <View key={edu.id} wrap={false} style={styles.educationItem}>
                  <View style={styles.experienceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.educationDegree}>
                        {edu.degree}
                        {edu.field && (
                          <Text style={styles.educationField}>
                            {" "}
                            in {edu.field}
                          </Text>
                        )}
                      </Text>
                      <Text style={styles.educationInstitution}>
                        {edu.institution}
                        {edu.location && (
                          <Text style={styles.experienceLocation}>
                            {" "}
                            {PDF_ICONS.bullet} {edu.location}
                          </Text>
                        )}
                      </Text>
                      {edu.gpa && (
                        <Text style={styles.educationGpa}>Grade: {edu.gpa}</Text>
                      )}
                    </View>
                    <Text style={styles.experienceDate}>
                      {formatDate(edu.startDate)} {PDF_ICONS.arrow}{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </Text>
                  </View>

                  {edu.description && edu.description.length > 0 && (
                    <View style={styles.bulletList}>
                      {edu.description.map(
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
                </View>
              ))}
            </View>
          )}

          {/* Projects Section */}
          {data.projects && data.projects.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.mainSectionTitle}>Projects</Text>
              </View>

              <View style={styles.projectsGrid}>
                {data.projects.map((project) => (
                  <View key={project.id} wrap={false} style={styles.projectCard}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    {project.description && (
                      <Text style={styles.projectDescription}>
                        {project.description.length > 80
                          ? project.description.slice(0, 80) + "..."
                          : project.description}
                      </Text>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <View style={styles.projectTechRow}>
                        {project.technologies.slice(0, 4).map((tech, i) => (
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

          {/* Certifications Section */}
          {certs.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.mainSectionTitle}>Certifications</Text>
              </View>

              {certs.map((cert) => (
                <View key={cert.id} wrap={false} style={styles.certItem}>
                  <View style={styles.certIcon}>
                    <Text style={styles.certCheck}>{PDF_ICONS.check}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.certName}>{cert.name}</Text>
                    {(cert.issuer || cert.date) && (
                      <Text style={styles.certIssuer}>
                        {cert.issuer}
                        {cert.date && cert.issuer ? " " + PDF_ICONS.bullet + " " : ""}
                        {cert.date && formatDate(cert.date)}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Courses Section */}
          {allCourses.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.mainSectionTitle}>Courses</Text>
              </View>

              <View style={styles.projectsGrid}>
                {allCourses.map((course) => (
                  <View key={course.id} wrap={false} style={styles.certItem}>
                    <View style={styles.certIcon}>
                      <Text style={styles.certCheck}>{PDF_ICONS.check}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.certName}>{course.name}</Text>
                      {course.institution && (
                        <Text style={styles.certIssuer}>
                          {course.institution}
                        </Text>
                      )}
                      {course.date && (
                        <Text style={styles.certIssuer}>
                          {formatDate(course.date)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Extra-curricular Section */}
          {data.extraCurricular && data.extraCurricular.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.mainSectionTitle}>
                  Leadership & Activities
                </Text>
              </View>

              {data.extraCurricular.map((activity) => (
                <View key={activity.id} wrap={false} style={styles.activityItem}>
                  <View style={styles.experienceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityOrg}>
                        {activity.organization}
                        {activity.role && (
                          <Text style={styles.activityRole}>
                            {" "}
                            {PDF_ICONS.bullet} {activity.role}
                          </Text>
                        )}
                      </Text>
                    </View>
                    {(activity.startDate || activity.endDate) && (
                      <Text style={styles.experienceDate}>
                        {activity.startDate && formatDate(activity.startDate)}{" "}
                        {PDF_ICONS.arrow}{" "}
                        {activity.current
                          ? "Present"
                          : activity.endDate
                          ? formatDate(activity.endDate)
                          : ""}
                      </Text>
                    )}
                  </View>

                  {activity.description && activity.description.length > 0 && (
                    <View style={styles.bulletList}>
                      {activity.description.map(
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
                </View>
              ))}
            </View>
          )}

          {/* Custom Sections */}
          {data.customSections && data.customSections.length > 0 && (
            <>
              {data.customSections.map((section) => (
                <View key={section.id} style={styles.mainSection}>
                  <View style={styles.mainSectionHeader}>
                    <View style={styles.sectionIcon}>
                      <View style={styles.sectionDot} />
                    </View>
                    <Text style={styles.mainSectionTitle}>
                      {section.title || "Custom Section"}
                    </Text>
                  </View>

                  {(section.items || []).map((item) => (
                    <View key={item.id} wrap={false} style={styles.customSectionItem}>
                      <Text style={styles.customItemTitle}>{item.title}</Text>
                      {(item.date || item.location) && (
                        <Text style={styles.customItemMeta}>
                          {item.date}
                          {item.date && item.location
                            ? " " + PDF_ICONS.bullet + " "
                            : ""}
                          {item.location}
                        </Text>
                      )}
                      {item.description && (
                        <Text style={styles.customItemDescription}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Page number - only shows on multi-page resumes */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
          }
          fixed
        />
      </Page>
    </Document>
  );
}
