import React, { useMemo } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
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

interface CubicPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Cubic PDF Template - Clean Scannable Layout
 *
 * Single-column with left accent stripe. ATS-friendly design.
 * Inspired by Zety's Cubic template.
 */

type CubicColors = {
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: CubicColors, fontFamily: string, customization?: PDFCustomization) {
  const baseFontSize = customization?.fontSize || 10;

  return StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: colors.background,
      fontFamily,
    },
    // Left accent stripe
    accentStripe: {
      width: 6,
      backgroundColor: colors.primary,
    },
    // Main content
    main: {
      flex: 1,
      padding: 28,
    },
    // Header
    header: {
      marginBottom: 20,
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
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 10,
      gap: 12,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    contactIcon: {
      fontSize: 9,
      color: colors.primary,
      marginRight: 4,
    },
    contactText: {
      fontSize: 9,
      color: colors.muted,
    },
    // Summary box
    summaryBox: {
      backgroundColor: "#f9fafb",
      borderRadius: 4,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      marginBottom: 18,
    },
    summaryText: {
      fontSize: 9,
      color: colors.muted,
      lineHeight: 1.5,
    },
    // Section
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    sectionMarker: {
      width: 6,
      height: 6,
      borderRadius: 1,
      backgroundColor: colors.primary,
      marginRight: 8,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 700,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    // Experience card
    experienceCard: {
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: "#f0f0f0",
      borderRadius: 4,
      padding: 10,
      marginBottom: 10,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
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
      fontSize: 8,
      color: colors.muted,
    },
    bulletList: {
      marginTop: 6,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      fontSize: 8,
      color: colors.muted,
      marginRight: 6,
    },
    bulletText: {
      fontSize: 8,
      color: colors.muted,
      flex: 1,
      lineHeight: 1.4,
    },
    // Education
    educationItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    educationDegree: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.text,
    },
    educationInstitution: {
      fontSize: 9,
      color: colors.primary,
    },
    educationGpa: {
      fontSize: 8,
      color: colors.muted,
    },
    // Skills grid
    skillsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    skillCategory: {
      width: "30%",
    },
    skillCategoryName: {
      fontSize: 7,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    skillsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 3,
    },
    skillTag: {
      fontSize: 7,
      color: colors.primary,
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 2,
    },
    // Projects grid
    projectsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    projectCard: {
      width: "48%",
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: "#f0f0f0",
      borderRadius: 4,
      padding: 8,
    },
    projectName: {
      fontSize: 9,
      fontWeight: 600,
      color: colors.text,
    },
    projectDescription: {
      fontSize: 7,
      color: colors.muted,
      marginTop: 2,
      lineHeight: 1.3,
    },
    techRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 3,
      marginTop: 4,
    },
    techTag: {
      fontSize: 6,
      color: colors.text,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 2,
    },
    // Certifications
    certRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    certBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fafafa",
      borderWidth: 1,
      borderColor: "#f0f0f0",
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },
    certCheck: {
      fontSize: 9,
      color: colors.primary,
      marginRight: 4,
    },
    certName: {
      fontSize: 8,
      fontWeight: 500,
      color: colors.text,
    },
    certIssuer: {
      fontSize: 7,
      color: colors.muted,
      marginLeft: 4,
    },
    // Languages
    languageRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    languageName: {
      fontSize: 9,
      fontWeight: 500,
      color: colors.text,
      marginRight: 6,
    },
    languageLevel: {
      fontSize: 7,
      color: colors.primary,
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      textTransform: "capitalize",
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

export function CubicPDFTemplate({
  data,
  customization,
}: CubicPDFTemplateProps) {
  const primaryColor = customization?.primaryColor || "#0ea5e9";
  const secondaryColor = customization?.secondaryColor || "#22d3ee";

  const colors: CubicColors = {
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
        {/* Left accent stripe */}
        <View style={styles.accentStripe} />

        {/* Main content */}
        <View style={styles.main}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>
              {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
            </Text>
            {personalInfo.jobTitle && (
              <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
            )}

            {/* Contact row */}
            <View style={styles.contactRow}>
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
          </View>

          {/* Summary */}
          {personalInfo.summary && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{personalInfo.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {sortedExperience.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionMarker} />
                <Text style={styles.sectionTitle}>Professional Experience</Text>
              </View>
              {sortedExperience.map((exp) => (
                <View key={exp.id} wrap={false} style={styles.experienceCard}>
                  <View style={styles.experienceHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.experienceTitle}>{exp.position}</Text>
                      <Text style={styles.experienceCompany}>
                        {exp.company}
                        {exp.location && (
                          <Text style={styles.experienceLocation}>
                            {" "}· {exp.location}
                          </Text>
                        )}
                      </Text>
                    </View>
                    <Text style={styles.experienceDate}>
                      {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                    </Text>
                  </View>
                  {exp.description && exp.description.length > 0 && (
                    <View style={styles.bulletList}>
                      {exp.description.map(
                        (item, idx) =>
                          item.trim() && (
                            <View key={idx} style={styles.bulletItem}>
                              <Text style={styles.bulletDot}>•</Text>
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
              <View style={styles.sectionHeader}>
                <View style={styles.sectionMarker} />
                <Text style={styles.sectionTitle}>Education</Text>
              </View>
              {sortedEducation.map((edu) => (
                <View key={edu.id} wrap={false} style={styles.educationItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.educationDegree}>
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </Text>
                    <Text style={styles.educationInstitution}>
                      {edu.institution}
                    </Text>
                    {edu.gpa && (
                      <Text style={styles.educationGpa}>GPA: {edu.gpa}</Text>
                    )}
                  </View>
                  <Text style={styles.experienceDate}>
                    {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionMarker} />
                <Text style={styles.sectionTitle}>Skills</Text>
              </View>
              <View style={styles.skillsGrid}>
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <View key={category} style={styles.skillCategory}>
                    <Text style={styles.skillCategoryName}>{category}</Text>
                    <View style={styles.skillsRow}>
                      {categorySkills.map((skill) => (
                        <Text key={skill.id} style={styles.skillTag}>
                          {skill.name}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionMarker} />
                <Text style={styles.sectionTitle}>Projects</Text>
              </View>
              <View style={styles.projectsGrid}>
                {data.projects.map((project) => (
                  <View key={project.id} wrap={false} style={styles.projectCard}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    {project.description && (
                      <Text style={styles.projectDescription}>
                        {project.description.length > 60
                          ? project.description.slice(0, 60) + "..."
                          : project.description}
                      </Text>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <View style={styles.techRow}>
                        {project.technologies.slice(0, 4).map((tech, i) => (
                          <Text key={i} style={styles.techTag}>
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

          {/* Certifications */}
          {certs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionMarker} />
                <Text style={styles.sectionTitle}>Certifications</Text>
              </View>
              <View style={styles.certRow}>
                {certs.map((cert) => (
                  <View key={cert.id} wrap={false} style={styles.certBadge}>
                    <Text style={styles.certCheck}>✓</Text>
                    <Text style={styles.certName}>{cert.name}</Text>
                    {cert.issuer && (
                      <Text style={styles.certIssuer}>— {cert.issuer}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionMarker} />
                <Text style={styles.sectionTitle}>Languages</Text>
              </View>
              <View style={styles.languageRow}>
                {data.languages.map((lang) => (
                  <View key={lang.id} style={styles.languageItem}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.languageLevel}>{lang.level}</Text>
                  </View>
                ))}
              </View>
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
