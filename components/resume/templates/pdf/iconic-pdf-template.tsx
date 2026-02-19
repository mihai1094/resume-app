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

interface IconicPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Colors type for iconic template
 */
type IconicColors = {
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
function createStyles(colors: IconicColors, fontFamily: string, customization?: PDFCustomization) {
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
      paddingTop: 28,
      color: "#ffffff",
    },
    photo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 16,
      alignSelf: "center",
      objectFit: "cover",
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.3)",
    },
    sidebarNameContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    sidebarName: {
      fontSize: 18,
      fontWeight: 700,
      color: "#ffffff",
      textTransform: "uppercase",
      letterSpacing: 1,
      textAlign: "center",
    },
    sidebarJobTitle: {
      fontSize: 9,
      color: "#ffffff",
      backgroundColor: colors.accent,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      marginTop: 8,
      textAlign: "center",
    },
    sidebarSection: {
      marginBottom: 18,
    },
    sidebarSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    sidebarSectionBar: {
      width: 24,
      height: 3,
      backgroundColor: colors.accent,
      borderRadius: 2,
      marginRight: 8,
    },
    sidebarSectionTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: "rgba(255,255,255,0.8)",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 7,
    },
    contactIcon: {
      fontSize: 9,
      color: "rgba(255,255,255,0.6)",
      marginRight: 8,
      width: 12,
    },
    contactText: {
      fontSize: 9,
      color: "rgba(255,255,255,0.9)",
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
      fontWeight: 600,
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
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.1)",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 4,
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
      color: "rgba(255,255,255,0.9)",
    },
    languageLevel: {
      fontSize: 8,
      color: "rgba(255,255,255,0.5)",
      textTransform: "capitalize",
    },
    hobbyContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    hobbyText: {
      fontSize: 9,
      color: "rgba(255,255,255,0.8)",
    },
    hobbySeparator: {
      fontSize: 9,
      color: "rgba(255,255,255,0.3)",
      marginHorizontal: 4,
    },
    // Main content - right column
    main: {
      width: "68%",
      padding: 28,
      paddingTop: 28,
    },
    mainSection: {
      marginBottom: 18,
    },
    mainSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionNumberBox: {
      width: 32,
      height: 32,
      backgroundColor: colors.primary,
      borderRadius: 6,
      marginRight: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    sectionNumber: {
      fontSize: 12,
      fontWeight: 700,
      color: "#ffffff",
    },
    mainSectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: colors.text,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    summaryText: {
      fontSize: baseFontSize,
      color: colors.muted,
      lineHeight: lineSpacing,
      paddingLeft: 42,
    },
    // Experience items
    experienceContainer: {
      paddingLeft: 42,
    },
    experienceItem: {
      marginBottom: 14,
      paddingLeft: 12,
      borderLeftWidth: 3,
      borderLeftColor: "#e5e7eb",
    },
    experienceItemFirst: {
      marginBottom: 14,
      paddingLeft: 12,
      borderLeftWidth: 3,
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
      fontWeight: 700,
      color: colors.text,
    },
    experienceCompany: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.primary,
    },
    experienceLocation: {
      fontSize: 9,
      color: colors.muted,
      fontWeight: 400,
    },
    experienceDate: {
      fontSize: 8,
      fontWeight: 500,
      color: colors.primary,
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
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
      backgroundColor: `${colors.primary}08`,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
      padding: 8,
      borderRadius: 4,
      marginTop: 6,
    },
    achievementsTitle: {
      fontSize: 8,
      fontWeight: 700,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 4,
    },
    achievementItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    achievementStar: {
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
      borderLeftWidth: 3,
      borderLeftColor: "#e5e7eb",
    },
    educationDegree: {
      fontSize: 11,
      fontWeight: 700,
      color: colors.text,
    },
    educationField: {
      fontSize: 11,
      fontWeight: 400,
      color: colors.muted,
    },
    educationInstitution: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.primary,
    },
    educationGpa: {
      fontSize: 8,
      color: colors.muted,
      marginTop: 2,
    },
    // Projects grid
    projectsContainer: {
      paddingLeft: 42,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    projectCard: {
      width: "48%",
      padding: 8,
      borderWidth: 1,
      borderColor: "#f3f4f6",
      borderRadius: 6,
      backgroundColor: "#fafafa",
      marginBottom: 8,
    },
    projectName: {
      fontSize: 10,
      fontWeight: 700,
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
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 2,
    },
    // Certifications
    certContainer: {
      paddingLeft: 42,
    },
    certItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    certIcon: {
      width: 22,
      height: 22,
      backgroundColor: `${colors.primary}10`,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    certCheck: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.primary,
    },
    certName: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.text,
    },
    certIssuer: {
      fontSize: 8,
      color: colors.muted,
    },
    // Courses grid
    coursesGrid: {
      paddingLeft: 42,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    courseItem: {
      width: "48%",
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    courseIcon: {
      width: 18,
      height: 18,
      backgroundColor: `${colors.primary}10`,
      borderRadius: 3,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 6,
    },
    courseCheck: {
      fontSize: 9,
      color: colors.primary,
    },
    courseName: {
      fontSize: 9,
      fontWeight: 600,
      color: colors.text,
    },
    courseInstitution: {
      fontSize: 8,
      color: colors.muted,
    },
    // Extra-curricular
    activityContainer: {
      paddingLeft: 42,
    },
    activityItem: {
      marginBottom: 10,
      paddingLeft: 12,
      borderLeftWidth: 3,
      borderLeftColor: "#e5e7eb",
    },
    activityTitle: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.text,
    },
    activityOrg: {
      fontSize: 9,
      fontWeight: 600,
      color: colors.primary,
    },
    activityRole: {
      fontSize: 9,
      color: colors.muted,
      fontWeight: 400,
    },
    activityDate: {
      fontSize: 8,
      color: colors.muted,
    },
    // Custom sections
    customSectionContainer: {
      paddingLeft: 42,
    },
    customSectionItem: {
      marginBottom: 8,
      paddingLeft: 12,
      borderLeftWidth: 3,
      borderLeftColor: "#e5e7eb",
    },
    customItemTitle: {
      fontSize: 10,
      fontWeight: 600,
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
    // Page number
    pageNumber: {
      position: "absolute",
      bottom: 20,
      right: 30,
      fontSize: 9,
      color: colors.muted,
    },
  });
}

export function IconicPDFTemplate({
  data,
  customization,
}: IconicPDFTemplateProps) {
  // Get customized colors and font
  const colors = getCustomizedColors(PDF_COLORS.iconic, customization) as IconicColors;
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
  const coursesFromCerts = data.certifications?.filter((c) => c.type === "course") || [];
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

  // Section counter
  let sectionNumber = 0;
  const getNextSectionNumber = () => {
    sectionNumber++;
    return String(sectionNumber).padStart(2, "0");
  };

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
          <View style={styles.sidebarNameContainer}>
            <Text style={styles.sidebarName}>
              {personalInfo.firstName || "Your"}
            </Text>
            <Text style={styles.sidebarName}>
              {personalInfo.lastName || "Name"}
            </Text>
            {personalInfo.jobTitle && (
              <Text style={styles.sidebarJobTitle}>
                {personalInfo.jobTitle}
              </Text>
            )}
          </View>

          {/* Contact Section */}
          <View style={styles.sidebarSection}>
            <View style={styles.sidebarSectionHeader}>
              <View style={styles.sidebarSectionBar} />
              <Text style={styles.sidebarSectionTitle}>Contact</Text>
            </View>

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
              <View style={styles.sidebarSectionHeader}>
                <View style={styles.sidebarSectionBar} />
                <Text style={styles.sidebarSectionTitle}>Skills</Text>
              </View>
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
              <View style={styles.sidebarSectionHeader}>
                <View style={styles.sidebarSectionBar} />
                <Text style={styles.sidebarSectionTitle}>Languages</Text>
              </View>
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
              <View style={styles.sidebarSectionHeader}>
                <View style={styles.sidebarSectionBar} />
                <Text style={styles.sidebarSectionTitle}>Interests</Text>
              </View>
              <View style={styles.hobbyContainer}>
                {data.hobbies.map((hobby, index) => (
                  <React.Fragment key={hobby.id}>
                    <Text style={styles.hobbyText}>{hobby.name}</Text>
                    {index < (data.hobbies?.length || 0) - 1 && (
                      <Text style={styles.hobbySeparator}>|</Text>
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Profile/Summary Section */}
          {personalInfo.summary && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionNumberBox}>
                  <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                </View>
                <Text style={styles.mainSectionTitle}>Profile</Text>
              </View>
              <Text style={styles.summaryText}>{personalInfo.summary}</Text>
            </View>
          )}

          {/* Experience Section */}
          {sortedExperience.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionNumberBox}>
                  <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                </View>
                <Text style={styles.mainSectionTitle}>Experience</Text>
              </View>

              <View style={styles.experienceContainer}>
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
                              {" "}| {exp.location}
                            </Text>
                          )}
                        </Text>
                      </View>
                      <Text style={styles.experienceDate}>
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate || "")}
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

          {/* Education Section */}
          {sortedEducation.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionNumberBox}>
                  <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                </View>
                <Text style={styles.mainSectionTitle}>Education</Text>
              </View>

              <View style={styles.experienceContainer}>
                {sortedEducation.map((edu) => (
                  <View key={edu.id} wrap={false} style={styles.educationItem}>
                    <View style={styles.experienceHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.educationDegree}>
                          {edu.degree}
                          {edu.field && (
                            <Text style={styles.educationField}>
                              {" "}in {edu.field}
                            </Text>
                          )}
                        </Text>
                        <Text style={styles.educationInstitution}>
                          {edu.institution}
                          {edu.location && (
                            <Text style={styles.experienceLocation}>
                              {" "}| {edu.location}
                            </Text>
                          )}
                        </Text>
                        {edu.gpa && (
                          <Text style={styles.educationGpa}>Grade: {edu.gpa}</Text>
                        )}
                      </View>
                      <Text style={styles.experienceDate}>
                        {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
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
            </View>
          )}

          {/* Projects Section */}
          {data.projects && data.projects.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionNumberBox}>
                  <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                </View>
                <Text style={styles.mainSectionTitle}>Projects</Text>
              </View>

              <View style={styles.projectsContainer}>
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
                <View style={styles.sectionNumberBox}>
                  <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                </View>
                <Text style={styles.mainSectionTitle}>Certifications</Text>
              </View>

              <View style={styles.certContainer}>
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
                          {cert.date && cert.issuer ? " | " : ""}
                          {cert.date && formatDate(cert.date)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Courses Section */}
          {allCourses.length > 0 && (
            <View style={styles.mainSection}>
              <View style={styles.mainSectionHeader}>
                <View style={styles.sectionNumberBox}>
                  <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                </View>
                <Text style={styles.mainSectionTitle}>Courses</Text>
              </View>

              <View style={styles.coursesGrid}>
                {allCourses.map((course) => (
                  <View key={course.id} wrap={false} style={styles.courseItem}>
                    <View style={styles.courseIcon}>
                      <Text style={styles.courseCheck}>{PDF_ICONS.check}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.courseName}>{course.name}</Text>
                      {course.institution && (
                        <Text style={styles.courseInstitution}>
                          {course.institution}
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
                <View style={styles.sectionNumberBox}>
                  <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                </View>
                <Text style={styles.mainSectionTitle}>
                  Leadership & Activities
                </Text>
              </View>

              <View style={styles.activityContainer}>
                {data.extraCurricular.map((activity) => (
                  <View key={activity.id} wrap={false} style={styles.activityItem}>
                    <View style={styles.experienceHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{activity.title}</Text>
                        <Text style={styles.activityOrg}>
                          {activity.organization}
                          {activity.role && (
                            <Text style={styles.activityRole}>
                              {" "}| {activity.role}
                            </Text>
                          )}
                        </Text>
                      </View>
                      {(activity.startDate || activity.endDate) && (
                        <Text style={styles.activityDate}>
                          {activity.startDate && formatDate(activity.startDate)} -{" "}
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
            </View>
          )}

          {/* Custom Sections */}
          {data.customSections && data.customSections.length > 0 && (
            <>
              {data.customSections.map((section) => (
                <View key={section.id} style={styles.mainSection}>
                  <View style={styles.mainSectionHeader}>
                    <View style={styles.sectionNumberBox}>
                      <Text style={styles.sectionNumber}>{getNextSectionNumber()}</Text>
                    </View>
                    <Text style={styles.mainSectionTitle}>
                      {section.title || "Custom Section"}
                    </Text>
                  </View>

                  <View style={styles.customSectionContainer}>
                    {(section.items || []).map((item) => (
                      <View key={item.id} wrap={false} style={styles.customSectionItem}>
                        <Text style={styles.customItemTitle}>{item.title}</Text>
                        {(item.date || item.location) && (
                          <Text style={styles.customItemMeta}>
                            {item.date}
                            {item.date && item.location ? " | " : ""}
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

export default IconicPDFTemplate;
