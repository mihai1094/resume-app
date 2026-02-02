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

interface DiamondPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Diamond PDF Template - Clean ATS-Optimized Professional Layout
 *
 * Single-column layout with diamond-shaped accent elements on section headers.
 * Designed for students, interns, accounting, and legal professionals.
 * Excellent ATS compatibility with clear hierarchy and professional appearance.
 */

type DiamondColors = {
  primary: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: DiamondColors, fontFamily: string, customization?: PDFCustomization) {
  const baseFontSize = customization?.fontSize || 10;
  const sectionSpacing = customization?.sectionSpacing || 14;

  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily,
      padding: 36,
    },
    // Header
    header: {
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      paddingBottom: 14,
      marginBottom: 14,
    },
    name: {
      fontSize: 22,
      fontWeight: 700,
      color: colors.text,
      letterSpacing: 0.5,
    },
    jobTitle: {
      fontSize: 11,
      fontWeight: 500,
      color: colors.primary,
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 10,
      gap: 14,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    contactIcon: {
      fontSize: 8,
      color: colors.primary,
      marginRight: 3,
    },
    contactText: {
      fontSize: 8,
      color: colors.muted,
    },
    // Section
    section: {
      marginBottom: sectionSpacing,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 6,
    },
    diamond: {
      width: 6,
      height: 6,
      backgroundColor: colors.primary,
      transform: "rotate(45deg)",
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 700,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    // Summary
    summaryText: {
      fontSize: 9,
      color: colors.muted,
      lineHeight: 1.5,
    },
    // Experience
    experienceItem: {
      marginBottom: 10,
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
      color: colors.muted,
    },
    experienceDate: {
      fontSize: 8,
      color: colors.muted,
    },
    bulletList: {
      marginTop: 4,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDiamond: {
      fontSize: 6,
      color: colors.primary,
      marginRight: 6,
      marginTop: 2,
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
      color: colors.muted,
    },
    educationGpa: {
      fontSize: 8,
      color: colors.muted,
    },
    // Skills
    skillRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    skillCategory: {
      fontSize: 8,
      fontWeight: 600,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      width: 80,
    },
    skillList: {
      fontSize: 8,
      color: colors.muted,
      flex: 1,
    },
    // Projects
    projectItem: {
      marginBottom: 8,
    },
    projectHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    projectName: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.text,
    },
    projectUrl: {
      fontSize: 7,
      color: colors.muted,
    },
    projectDescription: {
      fontSize: 8,
      color: colors.muted,
      marginTop: 2,
      lineHeight: 1.4,
    },
    projectTech: {
      fontSize: 7,
      color: colors.muted,
      marginTop: 2,
    },
    projectTechLabel: {
      fontWeight: 500,
    },
    // Certifications
    certItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    certContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      flex: 1,
    },
    certDiamond: {
      fontSize: 6,
      color: colors.primary,
      marginRight: 6,
      marginTop: 2,
    },
    certName: {
      fontSize: 9,
      fontWeight: 500,
      color: colors.text,
    },
    certIssuer: {
      fontSize: 9,
      color: colors.muted,
    },
    certDate: {
      fontSize: 8,
      color: colors.muted,
    },
    // Languages
    languageRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    languageName: {
      fontSize: 9,
      fontWeight: 500,
      color: colors.text,
    },
    languageLevel: {
      fontSize: 8,
      color: colors.muted,
      marginLeft: 4,
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

export function DiamondPDFTemplate({
  data,
  customization,
}: DiamondPDFTemplateProps) {
  const fontFamily = getCustomizedFont(customization);
  const styles = useMemo(() => {
    const primaryColor = customization?.primaryColor || "#1e40af";
    const colors: DiamondColors = {
      primary: primaryColor,
      text: "#111827",
      muted: "#4b5563",
      background: "#ffffff",
    };
    return createStyles(colors, fontFamily, customization);
  }, [customization, fontFamily]);

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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
            </View>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {sortedExperience.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
              <Text style={styles.sectionTitle}>Professional Experience</Text>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
            </View>
            {sortedExperience.map((exp) => (
              <View key={exp.id} wrap={false} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.experienceTitle}>{exp.position}</Text>
                    <Text style={styles.experienceCompany}>
                      {exp.company}
                      {exp.location && ` | ${exp.location}`}
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
                            <Text style={styles.bulletDiamond}>{PDF_ICONS.diamond}</Text>
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
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
              <Text style={styles.sectionTitle}>Education</Text>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
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
                  {formatDate(edu.startDate)} - {edu.current ? "Present" : formatDate(edu.endDate || "")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {Object.keys(skillsByCategory).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
              <Text style={styles.sectionTitle}>Skills</Text>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
            </View>
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <View key={category} style={styles.skillRow}>
                <Text style={styles.skillCategory}>{category}:</Text>
                <Text style={styles.skillList}>
                  {categorySkills.map((skill) => skill.name).join(" | ")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
              <Text style={styles.sectionTitle}>Projects</Text>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
            </View>
            {data.projects.map((project) => (
              <View key={project.id} wrap={false} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.url && (
                    <Text style={styles.projectUrl}>
                      {project.url.replace(/^https?:\/\//, "")}
                    </Text>
                  )}
                </View>
                {project.description && (
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.projectTech}>
                    <Text style={styles.projectTechLabel}>Technologies: </Text>
                    {project.technologies.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certs.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
            </View>
            {certs.map((cert) => (
              <View key={cert.id} wrap={false} style={styles.certItem}>
                <View style={styles.certContent}>
                  <Text style={styles.certDiamond}>{PDF_ICONS.diamond}</Text>
                  <View style={{ flex: 1 }}>
                    <Text>
                      <Text style={styles.certName}>{cert.name}</Text>
                      {cert.issuer && (
                        <Text style={styles.certIssuer}> - {cert.issuer}</Text>
                      )}
                    </Text>
                  </View>
                </View>
                {cert.date && (
                  <Text style={styles.certDate}>{formatDate(cert.date)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
              <Text style={styles.sectionTitle}>Languages</Text>
              <Text style={{ ...styles.diamond }}>{PDF_ICONS.diamond}</Text>
            </View>
            <View style={styles.languageRow}>
              {data.languages.map((lang) => (
                <View key={lang.id} style={styles.languageItem}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageLevel}>({lang.level})</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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

export default DiamondPDFTemplate;
