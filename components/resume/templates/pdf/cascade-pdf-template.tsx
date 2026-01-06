import React, { useMemo } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import {
  PDF_ICONS,
  PDFCustomization,
  getCustomizedFont,
} from "@/lib/pdf/fonts";

interface CascadePDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Cascade PDF Template - Sidebar with Skill Progress Bars
 *
 * Two-column layout (30/70) with skill progress bars in sidebar.
 * Inspired by Zety's Cascade template.
 */

type CascadeColors = {
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: CascadeColors, fontFamily: string, customization?: PDFCustomization) {
  const baseFontSize = customization?.fontSize || 10;

  return StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: colors.background,
      fontFamily,
    },
    // Sidebar - 30% width
    sidebar: {
      width: "30%",
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 28,
      color: "#ffffff",
    },
    photo: {
      width: 70,
      height: 70,
      borderRadius: 35,
      marginBottom: 16,
      alignSelf: "center",
      objectFit: "cover",
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.2)",
    },
    sidebarSection: {
      marginBottom: 16,
    },
    sidebarSectionTitle: {
      fontSize: 8,
      fontWeight: 600,
      color: "rgba(255,255,255,0.6)",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.2)",
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    contactIcon: {
      fontSize: 8,
      color: "rgba(255,255,255,0.5)",
      marginRight: 6,
      width: 10,
    },
    contactText: {
      fontSize: 8,
      color: "#ffffff",
      flex: 1,
    },
    // Skill progress bars
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
    skillItem: {
      marginBottom: 6,
    },
    skillName: {
      fontSize: 8,
      color: "#ffffff",
      marginBottom: 2,
    },
    skillBarBg: {
      height: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 2,
    },
    skillBarFill: {
      height: 4,
      borderRadius: 2,
    },
    // Language items
    languageItem: {
      marginBottom: 6,
    },
    languageRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    languageName: {
      fontSize: 8,
      color: "#ffffff",
    },
    languageLevel: {
      fontSize: 7,
      color: "rgba(255,255,255,0.5)",
      textTransform: "capitalize",
    },
    // Hobbies
    hobbyTag: {
      fontSize: 8,
      color: "#ffffff",
      backgroundColor: "rgba(255,255,255,0.1)",
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
      marginRight: 4,
      marginBottom: 4,
    },
    hobbyContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    // Main content - 70% width
    main: {
      width: "70%",
      padding: 28,
      paddingTop: 28,
    },
    // Header
    header: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: 700,
      color: colors.text,
    },
    jobTitle: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 2,
    },
    // Summary
    summary: {
      fontSize: 9,
      color: colors.muted,
      lineHeight: 1.5,
      marginBottom: 16,
    },
    // Section
    section: {
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: "#e5e7eb",
    },
    // Experience items with timeline
    experienceItem: {
      marginBottom: 12,
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: "#e5e7eb",
      position: "relative",
    },
    experienceItemFirst: {
      marginBottom: 12,
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: colors.primary,
      position: "relative",
    },
    timelineDot: {
      position: "absolute",
      left: -5,
      top: 0,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#ffffff",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    experienceTitle: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.text,
    },
    experienceCompany: {
      fontSize: 9,
      color: colors.primary,
    },
    experienceLocation: {
      fontSize: 8,
      color: colors.muted,
    },
    experienceDate: {
      fontSize: 7,
      color: colors.muted,
      whiteSpace: "nowrap",
    },
    bulletList: {
      marginTop: 4,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      marginRight: 6,
      marginTop: 4,
    },
    bulletText: {
      fontSize: 8,
      color: colors.muted,
      flex: 1,
      lineHeight: 1.4,
    },
    // Education
    educationItem: {
      marginBottom: 8,
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: "#e5e7eb",
    },
    educationDegree: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.text,
    },
    educationField: {
      fontSize: 10,
      fontWeight: 400,
      color: colors.muted,
    },
    educationInstitution: {
      fontSize: 9,
      color: colors.primary,
    },
    educationGpa: {
      fontSize: 7,
      color: colors.muted,
      marginTop: 2,
    },
    // Certifications
    certGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    certItem: {
      width: "48%",
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 6,
      marginRight: "2%",
    },
    certDot: {
      fontSize: 9,
      color: colors.primary,
      marginRight: 4,
    },
    certName: {
      fontSize: 9,
      fontWeight: 500,
      color: colors.text,
    },
    certIssuer: {
      fontSize: 7,
      color: colors.muted,
    },
    // Projects
    projectItem: {
      marginBottom: 8,
    },
    projectName: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.text,
    },
    projectDescription: {
      fontSize: 8,
      color: colors.muted,
      marginTop: 2,
    },
    projectTechRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 4,
      gap: 3,
    },
    projectTech: {
      fontSize: 7,
      color: colors.primary,
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 2,
    },
    // Page number
    pageNumber: {
      position: "absolute",
      bottom: 20,
      right: 30,
      fontSize: 8,
      color: colors.muted,
    },
  });
}

const levelToPercent: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 95,
};

const languageLevelPercent: Record<string, number> = {
  basic: 25,
  conversational: 50,
  fluent: 75,
  native: 100,
};

export function CascadePDFTemplate({
  data,
  customization,
}: CascadePDFTemplateProps) {
  const primaryColor = customization?.primaryColor || "#1e40af";
  const secondaryColor = customization?.secondaryColor || "#3b82f6";

  const colors: CascadeColors = {
    primary: primaryColor,
    secondary: secondaryColor,
    text: "#111827",
    muted: "#6b7280",
    background: "#ffffff",
  };

  const fontFamily = getCustomizedFont(customization);
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

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
  const documentTitle = fullName ? `${fullName} - Resume` : "Resume";

  // Get certifications (exclude courses)
  const certs = data.certifications?.filter((c) => c.type !== "course") || [];

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

          {/* Skills with Progress Bars */}
          {Object.keys(skillsByCategory).length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {Object.entries(skillsByCategory)
                .slice(0, 3)
                .map(([category, categorySkills]) => (
                  <View key={category} style={styles.skillCategory}>
                    <Text style={styles.skillCategoryName}>{category}</Text>
                    {categorySkills.slice(0, 4).map((skill) => {
                      const percent = skill.level
                        ? levelToPercent[skill.level]
                        : 70;
                      return (
                        <View key={skill.id} style={styles.skillItem}>
                          <Text style={styles.skillName}>{skill.name}</Text>
                          <View style={styles.skillBarBg}>
                            <View
                              style={[
                                styles.skillBarFill,
                                {
                                  width: `${percent}%`,
                                  backgroundColor: secondaryColor,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))}
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Languages</Text>
              {data.languages.map((lang) => {
                const percent = languageLevelPercent[lang.level] || 50;
                return (
                  <View key={lang.id} style={styles.languageItem}>
                    <View style={styles.languageRow}>
                      <Text style={styles.languageName}>{lang.name}</Text>
                      <Text style={styles.languageLevel}>{lang.level}</Text>
                    </View>
                    <View style={styles.skillBarBg}>
                      <View
                        style={[
                          styles.skillBarFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: secondaryColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Interests</Text>
              <View style={styles.hobbyContainer}>
                {data.hobbies.map((hobby) => (
                  <Text key={hobby.id} style={styles.hobbyTag}>
                    {hobby.name}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>
              {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
            </Text>
            {personalInfo.jobTitle && (
              <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
            )}
          </View>

          {/* Summary */}
          {personalInfo.summary && (
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Professional Experience</Text>
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
                  <View style={styles.timelineDot} />
                  <View style={styles.experienceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.experienceTitle}>{exp.position}</Text>
                      <Text style={styles.experienceCompany}>
                        {exp.company}
                        {exp.location && (
                          <Text style={styles.experienceLocation}>
                            {" "}
                            · {exp.location}
                          </Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.experienceDate}>
                      {formatDate(exp.startDate)} —{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </Text>
                  </View>

                  {exp.description && exp.description.length > 0 && (
                    <View style={styles.bulletList}>
                      {exp.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <View key={idx} style={styles.bulletItem}>
                              <View
                                style={[
                                  styles.bulletDot,
                                  { backgroundColor: secondaryColor },
                                ]}
                              />
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

          {/* Education */}
          {sortedEducation.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
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
                      </Text>
                      {edu.gpa && (
                        <Text style={styles.educationGpa}>GPA: {edu.gpa}</Text>
                      )}
                    </View>
                    <Text style={styles.experienceDate}>
                      {formatDate(edu.startDate)} —{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.certGrid}>
                {certs.map((cert) => (
                  <View key={cert.id} wrap={false} style={styles.certItem}>
                    <Text style={styles.certDot}>●</Text>
                    <View>
                      <Text style={styles.certName}>{cert.name}</Text>
                      {cert.issuer && (
                        <Text style={styles.certIssuer}>{cert.issuer}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Projects</Text>
              {data.projects.map((project) => (
                <View key={project.id} wrap={false} style={styles.projectItem}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.description && (
                    <Text style={styles.projectDescription}>
                      {project.description}
                    </Text>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <View style={styles.projectTechRow}>
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
        </View>

        {/* Page number */}
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
