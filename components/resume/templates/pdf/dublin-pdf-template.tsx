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

interface DublinPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Dublin PDF Template - Professional with Personality
 *
 * Two-column asymmetric layout (65/35 split) with photo and elegant header.
 * Inspired by Resume.io's Dublin template.
 */

type DublinColors = {
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  background: string;
  sidebar: string;
};

function createStyles(colors: DublinColors, fontFamily: string, customization?: PDFCustomization) {
  const baseFontSize = customization?.fontSize || 10;

  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily,
    },
    // Header
    header: {
      paddingHorizontal: 28,
      paddingTop: 28,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    photo: {
      width: 70,
      height: 70,
      borderRadius: 6,
      marginRight: 16,
      objectFit: "cover",
    },
    headerContent: {
      flex: 1,
    },
    nameFirst: {
      fontSize: 26,
      fontWeight: 300,
      color: colors.primary,
      fontFamily: "Times-Roman",
    },
    nameLast: {
      fontSize: 26,
      fontWeight: 700,
      color: colors.primary,
      fontFamily: "Times-Bold",
    },
    jobTitle: {
      fontSize: 12,
      color: colors.secondary,
      marginTop: 2,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 8,
      gap: 12,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    contactIcon: {
      fontSize: 8,
      color: colors.primary,
      marginRight: 4,
    },
    contactText: {
      fontSize: 8,
      color: colors.muted,
    },
    // Body
    body: {
      flexDirection: "row",
    },
    // Main content - 65%
    main: {
      width: "65%",
      padding: 24,
      paddingRight: 16,
    },
    // Sidebar - 35%
    sidebar: {
      width: "35%",
      backgroundColor: colors.sidebar,
      padding: 16,
      minHeight: "100%",
    },
    // Sections
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: 600,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    sidebarSectionTitle: {
      fontSize: 8,
      fontWeight: 600,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
    },
    summary: {
      fontSize: 9,
      color: colors.muted,
      lineHeight: 1.5,
    },
    // Experience items
    experienceItem: {
      marginBottom: 12,
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
    experienceDate: {
      fontSize: 7,
      color: colors.muted,
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 3,
    },
    bulletList: {
      marginTop: 4,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      fontSize: 8,
      color: colors.muted,
      marginRight: 4,
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
      fontSize: 7,
      color: colors.muted,
      marginTop: 1,
    },
    // Projects
    projectItem: {
      marginBottom: 10,
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
    techRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 4,
      gap: 3,
    },
    techTag: {
      fontSize: 7,
      color: colors.primary,
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 8,
    },
    // Certifications
    certItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    certCheck: {
      fontSize: 8,
      color: colors.primary,
      marginRight: 4,
    },
    certText: {
      fontSize: 9,
      color: colors.text,
      flex: 1,
    },
    certIssuer: {
      fontSize: 8,
      color: colors.muted,
    },
    // Sidebar items
    sidebarItem: {
      marginBottom: 12,
    },
    linkItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    linkIcon: {
      fontSize: 9,
      color: colors.primary,
      marginRight: 6,
    },
    linkText: {
      fontSize: 8,
      color: colors.text,
      flex: 1,
    },
    // Skills
    skillCategory: {
      marginBottom: 8,
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
      color: colors.text,
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: "#e5e7eb",
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 2,
    },
    // Languages
    languageItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    languageName: {
      fontSize: 8,
      color: colors.text,
    },
    languageLevel: {
      fontSize: 7,
      color: colors.muted,
      textTransform: "capitalize",
    },
    // Interests
    interestTag: {
      fontSize: 7,
      color: colors.primary,
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 10,
    },
    interestRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
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

export function DublinPDFTemplate({
  data,
  customization,
}: DublinPDFTemplateProps) {
  const fontFamily = getCustomizedFont(customization);
  const styles = useMemo(() => {
    const primaryColor = customization?.primaryColor || "#334155";
    const secondaryColor = customization?.secondaryColor || "#64748b";
    const colors: DublinColors = {
      primary: primaryColor,
      secondary: secondaryColor,
      text: "#111827",
      muted: "#6b7280",
      background: "#ffffff",
      sidebar: "#f9fafb",
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
          {personalInfo.photo && (
            <Image src={personalInfo.photo} style={styles.photo} />
          )}
          <View style={styles.headerContent}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.nameFirst}>
                {personalInfo.firstName || "Your"}{" "}
              </Text>
              <Text style={styles.nameLast}>
                {personalInfo.lastName || "Name"}
              </Text>
            </View>
            {personalInfo.jobTitle && (
              <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
            )}
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
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* Main Content */}
          <View style={styles.main}>
            {/* Summary */}
            {personalInfo.summary && (
              <View style={styles.section}>
                <Text style={styles.summary}>{personalInfo.summary}</Text>
              </View>
            )}

            {/* Experience */}
            {sortedExperience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                {sortedExperience.map((exp) => (
                  <View key={exp.id} wrap={false} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.experienceTitle}>{exp.position}</Text>
                        <Text style={styles.experienceCompany}>
                          {exp.company}
                          {exp.location && ` · ${exp.location}`}
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
                <Text style={styles.sectionTitle}>Education</Text>
                {sortedEducation.map((edu) => (
                  <View key={edu.id} wrap={false} style={styles.educationItem}>
                    <View style={styles.experienceHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.educationDegree}>
                          {edu.degree}
                          {edu.field && ` in ${edu.field}`}
                        </Text>
                        <Text style={styles.educationInstitution}>
                          {edu.institution}
                        </Text>
                        {edu.gpa && (
                          <Text style={styles.educationGpa}>Grade: {edu.gpa}</Text>
                        )}
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
                      <View style={styles.techRow}>
                        {project.technologies.map((tech, i) => (
                          <Text key={i} style={styles.techTag}>
                            {tech}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {certs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                {certs.map((cert) => (
                  <View key={cert.id} wrap={false} style={styles.certItem}>
                    <Text style={styles.certCheck}>✓</Text>
                    <View>
                      <Text style={styles.certText}>
                        {cert.name}
                        {cert.issuer && (
                          <Text style={styles.certIssuer}> — {cert.issuer}</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            {/* Links */}
            {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarSectionTitle}>Links</Text>
                {personalInfo.website && (
                  <View style={styles.linkItem}>
                    <Text style={styles.linkIcon}>{PDF_ICONS.website}</Text>
                    <Text style={styles.linkText}>
                      {personalInfo.website.replace(/^https?:\/\//, "")}
                    </Text>
                  </View>
                )}
                {personalInfo.linkedin && (
                  <View style={styles.linkItem}>
                    <Text style={styles.linkIcon}>{PDF_ICONS.linkedin}</Text>
                    <Text style={styles.linkText}>
                      {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                    </Text>
                  </View>
                )}
                {personalInfo.github && (
                  <View style={styles.linkItem}>
                    <Text style={styles.linkIcon}>{PDF_ICONS.github}</Text>
                    <Text style={styles.linkText}>
                      {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Skills */}
            {Object.keys(skillsByCategory).length > 0 && (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarSectionTitle}>Skills</Text>
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
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarSectionTitle}>Languages</Text>
                {data.languages.map((lang) => (
                  <View key={lang.id} style={styles.languageItem}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.languageLevel}>{lang.level}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Interests */}
            {data.hobbies && data.hobbies.length > 0 && (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarSectionTitle}>Interests</Text>
                <View style={styles.interestRow}>
                  {data.hobbies.map((hobby) => (
                    <Text key={hobby.id} style={styles.interestTag}>
                      {hobby.name}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
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
