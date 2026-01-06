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
import {
  PDF_FONTS,
  PDF_COLORS,
  PDFCustomization,
  getCustomizedFont,
} from "@/lib/pdf/fonts";

interface FunctionalPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type FunctionalColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: FunctionalColors, fontFamily: string) {
  const boldFont =
    fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold";

  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily,
      padding: 40,
      paddingTop: 36,
      paddingBottom: 36,
    },
    // Header - centered
    header: {
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    name: {
      fontSize: 24,
      fontFamily: boldFont,
      color: colors.primary,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    jobTitle: {
      fontSize: 12,
      color: colors.muted,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 16,
    },
    contactItem: {
      fontSize: 9,
      color: colors.muted,
    },
    contactLink: {
      fontSize: 9,
      color: colors.accent,
      textDecoration: "none",
    },
    // Section
    section: {
      marginBottom: 16,
    },
    sectionHeader: {
      marginBottom: 10,
      paddingBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.primary}50`,
    },
    sectionTitle: {
      fontSize: 11,
      fontFamily: boldFont,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    // Summary
    summary: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.6,
    },
    // Skills - prominent
    skillCategoryContainer: {
      marginBottom: 12,
    },
    skillCategoryTitle: {
      fontSize: 10,
      fontFamily: boldFont,
      color: colors.accent,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
    },
    skillsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    skillItem: {
      width: "50%",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      paddingRight: 16,
    },
    skillName: {
      fontSize: 10,
      color: colors.text,
      width: 100,
    },
    skillBarContainer: {
      flex: 1,
      height: 6,
      backgroundColor: "#e2e8f0",
      borderRadius: 3,
    },
    skillBar: {
      height: 6,
      borderRadius: 3,
    },
    // Experience - condensed
    experienceItem: {
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#f1f5f9",
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 4,
    },
    experienceLeft: {
      flex: 1,
    },
    experienceTitle: {
      fontSize: 11,
      fontFamily: boldFont,
      color: colors.primary,
      marginBottom: 2,
    },
    experienceCompany: {
      fontSize: 10,
      color: colors.muted,
    },
    experienceDate: {
      fontSize: 9,
      color: colors.muted,
      textAlign: "right",
    },
    bulletList: {
      marginTop: 4,
      paddingLeft: 8,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletDot: {
      width: 10,
      fontSize: 10,
      color: colors.accent,
    },
    bulletText: {
      flex: 1,
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.4,
    },
    // Education
    educationItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    educationLeft: {
      flex: 1,
    },
    educationDegree: {
      fontSize: 11,
      fontFamily: boldFont,
      color: colors.primary,
    },
    educationSchool: {
      fontSize: 10,
      color: colors.muted,
    },
    educationGpa: {
      fontSize: 9,
      color: colors.muted,
      marginTop: 2,
    },
    // Projects
    projectItem: {
      marginBottom: 8,
    },
    projectName: {
      fontSize: 10,
      fontFamily: boldFont,
      color: colors.primary,
      marginBottom: 2,
    },
    projectDescription: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.4,
    },
    projectTech: {
      fontSize: 8,
      color: colors.accent,
      marginTop: 2,
    },
    // Certifications
    certGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    certItem: {
      width: "50%",
      flexDirection: "row",
      marginBottom: 6,
      paddingRight: 12,
    },
    certBullet: {
      fontSize: 10,
      color: colors.accent,
      marginRight: 4,
    },
    certContent: {
      flex: 1,
    },
    certName: {
      fontSize: 10,
      fontFamily: boldFont,
      color: colors.primary,
    },
    certDetails: {
      fontSize: 8,
      color: colors.muted,
    },
    // Languages
    languagesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    languageItem: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: `${colors.primary}10`,
      borderRadius: 4,
    },
    languageText: {
      fontSize: 9,
      color: colors.primary,
    },
    languageLevel: {
      color: colors.muted,
    },
  });
}

export function FunctionalPDFTemplate({
  data,
  customization,
}: FunctionalPDFTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  const baseColors = PDF_COLORS.functional;

  const colors: FunctionalColors = customization
    ? {
        ...baseColors,
        primary: customization.primaryColor || baseColors.primary,
        accent: customization.accentColor || customization.secondaryColor || baseColors.accent,
      }
    : baseColors;

  const fontFamily = customization
    ? getCustomizedFont(customization)
    : PDF_FONTS.sans;

  const styles = createStyles(colors, fontFamily);

  const fullName =
    [personalInfo.firstName, personalInfo.lastName]
      .filter(Boolean)
      .join(" ") || "Your Name";

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      const category = skill.category || "General";
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, typeof skills>
  );

  const levelToWidth: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          {personalInfo.jobTitle && (
            <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
          )}
          <View style={styles.contactRow}>
            {personalInfo.email && (
              <Link
                src={`mailto:${personalInfo.email}`}
                style={styles.contactLink}
              >
                {personalInfo.email}
              </Link>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            )}
            {personalInfo.website && (
              <Link src={personalInfo.website} style={styles.contactLink}>
                {personalInfo.website.replace(/^https?:\/\//, "")}
              </Link>
            )}
            {personalInfo.linkedin && (
              <Link src={personalInfo.linkedin} style={styles.contactLink}>
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </Link>
            )}
            {personalInfo.github && (
              <Link src={personalInfo.github} style={styles.contactLink}>
                {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
              </Link>
            )}
          </View>
        </View>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Professional Summary</Text>
            </View>
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Skills - PROMINENT, FIRST after summary */}
        {Object.keys(skillsByCategory).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Core Competencies</Text>
            </View>
            {Object.entries(skillsByCategory).map(
              ([category, categorySkills]) => (
                <View key={category} style={styles.skillCategoryContainer}>
                  <Text style={styles.skillCategoryTitle}>{category}</Text>
                  <View style={styles.skillsGrid}>
                    {categorySkills.map((skill) => {
                      const width = skill.level
                        ? levelToWidth[skill.level]
                        : 70;
                      return (
                        <View key={skill.id} style={styles.skillItem}>
                          <Text style={styles.skillName}>{skill.name}</Text>
                          <View style={styles.skillBarContainer}>
                            <View
                              style={[
                                styles.skillBar,
                                {
                                  width: `${width}%`,
                                  backgroundColor: colors.accent,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )
            )}
          </View>
        )}

        {/* Work Experience - Condensed */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Professional Experience</Text>
            </View>
            {experience.map((exp, index) => (
              <View
                key={exp.id}
                style={[
                  styles.experienceItem,
                  index === experience.length - 1 ? { borderBottomWidth: 0 } : {},
                ]}
              >
                <View style={styles.experienceHeader}>
                  <View style={styles.experienceLeft}>
                    <Text style={styles.experienceTitle}>{exp.position}</Text>
                    <Text style={styles.experienceCompany}>
                      {exp.company}
                      {exp.location && ` | ${exp.location}`}
                    </Text>
                  </View>
                  <Text style={styles.experienceDate}>
                    {formatDate(exp.startDate)} —{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </Text>
                </View>
                {/* Show only top 3 bullet points for condensed view */}
                {exp.description && exp.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.description
                      .filter((d) => d.trim())
                      .slice(0, 3)
                      .map((d, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.bulletText}>{d}</Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Education</Text>
            </View>
            {education.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.educationLeft}>
                  <Text style={styles.educationDegree}>
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </Text>
                  <Text style={styles.educationSchool}>{edu.institution}</Text>
                  {edu.gpa && (
                    <Text style={styles.educationGpa}>GPA: {edu.gpa}</Text>
                  )}
                </View>
                <Text style={styles.experienceDate}>
                  {formatDate(edu.startDate)} —{" "}
                  {edu.current ? "Present" : formatDate(edu.endDate || "")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {projects.map((project) => (
              <View key={project.id} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.name}</Text>
                {project.description && (
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.projectTech}>
                    Technologies: {project.technologies.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Certifications</Text>
            </View>
            <View style={styles.certGrid}>
              {certifications.map((cert) => (
                <View key={cert.id} style={styles.certItem}>
                  <Text style={styles.certBullet}>●</Text>
                  <View style={styles.certContent}>
                    <Text style={styles.certName}>{cert.name}</Text>
                    {cert.issuer && (
                      <Text style={styles.certDetails}>
                        {cert.issuer}
                        {cert.date && ` • ${formatDate(cert.date)}`}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Languages</Text>
            </View>
            <View style={styles.languagesRow}>
              {languages.map((lang) => (
                <View key={lang.id} style={styles.languageItem}>
                  <Text style={styles.languageText}>
                    {lang.name}
                    {lang.level && (
                      <Text style={styles.languageLevel}> — {lang.level}</Text>
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}

export default FunctionalPDFTemplate;
