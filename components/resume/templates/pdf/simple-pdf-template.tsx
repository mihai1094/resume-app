import React, { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import {
  PDF_COLORS,
  PDFCustomization,
  getCustomizedFont,
} from "@/lib/pdf/fonts";

interface SimplePDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type SimpleColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
  border: string;
};

function createStyles(colors: SimpleColors, fontFamily: string, customization?: PDFCustomization) {
  const fontSize = customization?.fontSize ?? 10;
  const lineSpacing = customization?.lineSpacing ?? 1.5;
  const sectionSpacing = customization?.sectionSpacing ?? 16;

  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily,
      padding: 40,
      fontSize,
      lineHeight: lineSpacing,
    },
    // Header
    header: {
      alignItems: "center",
      marginBottom: 12,
    },
    name: {
      fontSize: 24,
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    jobTitle: {
      fontSize: 11,
      color: colors.muted,
      marginBottom: 8,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 12,
    },
    contactItem: {
      fontSize: 9,
      color: colors.text,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: 12,
      marginBottom: sectionSpacing,
    },
    // Sections
    section: {
      marginBottom: sectionSpacing,
    },
    sectionHeader: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 4,
    },
    sectionDivider: {
      height: 0.5,
      backgroundColor: colors.border,
    },
    // Summary
    summaryText: {
      fontSize,
      color: colors.text,
      lineHeight: lineSpacing,
    },
    // Experience & Education
    entryContainer: {
      marginBottom: 12,
    },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    entryLeft: {
      flex: 1,
      paddingRight: 10,
    },
    entryTitle: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: colors.text,
    },
    entrySubtitle: {
      fontSize: 10,
      color: colors.muted,
    },
    entryDate: {
      fontSize: 9,
      color: colors.muted,
      textAlign: "right",
    },
    entryGpa: {
      fontSize: 9,
      color: colors.muted,
      marginTop: 2,
    },
    // Lists
    bulletList: {
      marginTop: 6,
      paddingLeft: 12,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 3,
    },
    bullet: {
      width: 10,
      fontSize: 9,
      color: colors.muted,
    },
    bulletText: {
      flex: 1,
      fontSize,
      color: colors.text,
      lineHeight: lineSpacing,
    },
    achievementText: {
      flex: 1,
      fontSize,
      fontFamily: "Helvetica-Bold",
      color: colors.text,
      lineHeight: lineSpacing,
    },
    // Skills
    skillsContainer: {
      gap: 6,
    },
    skillRow: {
      flexDirection: "row",
      gap: 8,
    },
    skillCategory: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: colors.text,
      minWidth: 80,
    },
    skillList: {
      flex: 1,
      fontSize,
      color: colors.text,
    },
    // Projects
    projectContainer: {
      marginBottom: 10,
    },
    projectHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: 2,
    },
    projectName: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: colors.text,
    },
    projectUrl: {
      fontSize: 9,
      color: colors.muted,
    },
    projectDesc: {
      fontSize,
      color: colors.text,
      lineHeight: lineSpacing,
    },
    projectTech: {
      fontSize: 9,
      color: colors.muted,
      marginTop: 4,
    },
    // Certifications
    certContainer: {
      marginBottom: 6,
    },
    certRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    },
    certName: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: colors.text,
    },
    certIssuer: {
      fontSize: 10,
      color: colors.muted,
    },
    certDate: {
      fontSize: 9,
      color: colors.muted,
    },
    // Languages
    languagesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    languageItem: {
      fontSize: 10,
      color: colors.text,
    },
    languageLevel: {
      color: colors.muted,
    },
    // Page number
    pageNumber: {
      position: "absolute",
      bottom: 20,
      right: 40,
      fontSize: 9,
      color: colors.muted,
    },
  });
}

export function SimplePDFTemplate({
  data,
  customization,
}: SimplePDFTemplateProps) {
  const fontFamily = getCustomizedFont(customization);
  const styles = useMemo(() => {
    const baseColors = PDF_COLORS.simple;
    const colors: SimpleColors = customization
      ? {
          ...baseColors,
          primary: customization.primaryColor || baseColors.primary,
          accent: customization.accentColor || customization.secondaryColor || baseColors.accent,
        }
      : baseColors;
    return createStyles(colors, fontFamily, customization);
  }, [customization, fontFamily]);

  const {
    personalInfo,
    workExperience,
    education,
    skills,
    languages,
    projects,
    certifications,
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
          <Text style={styles.name}>{fullName || "Your Name"}</Text>
          {personalInfo.jobTitle && (
            <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
          )}
          <View style={styles.contactRow}>
            {personalInfo.email && (
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            )}
            {personalInfo.website && (
              <Text style={styles.contactItem}>
                {personalInfo.website.replace(/^https?:\/\//, "")}
              </Text>
            )}
            {personalInfo.linkedin && (
              <Text style={styles.contactItem}>
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
              </Text>
            )}
            {personalInfo.github && (
              <Text style={styles.contactItem}>
                {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Summary */}
        {personalInfo.summary && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.sectionDivider} />
            </View>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {sortedExperience.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={styles.sectionDivider} />
            </View>
            {sortedExperience.map((exp) => (
              <View key={exp.id} wrap={false} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryLeft}>
                    <Text style={styles.entryTitle}>{exp.position}</Text>
                    <Text style={styles.entrySubtitle}>
                      {exp.company}
                      {exp.location && ` | ${exp.location}`}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </Text>
                </View>

                {exp.description && exp.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.description
                      .filter((d) => d.trim())
                      .map((d, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bullet}>-</Text>
                          <Text style={styles.bulletText}>{d}</Text>
                        </View>
                      ))}
                  </View>
                )}

                {exp.achievements && exp.achievements.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.achievements
                      .filter((a) => a.trim())
                      .map((a, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bullet}>-</Text>
                          <Text style={styles.achievementText}>{a}</Text>
                        </View>
                      ))}
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
              <Text style={styles.sectionTitle}>Education</Text>
              <View style={styles.sectionDivider} />
            </View>
            {sortedEducation.map((edu) => (
              <View key={edu.id} wrap={false} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryLeft}>
                    <Text style={styles.entryTitle}>
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </Text>
                    <Text style={styles.entrySubtitle}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} -{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </Text>
                </View>
                {edu.gpa && <Text style={styles.entryGpa}>Grade: {edu.gpa}</Text>}
                {edu.description && edu.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.description
                      .filter((d) => d.trim())
                      .map((d, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bullet}>-</Text>
                          <Text style={styles.bulletText}>{d}</Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.sectionDivider} />
            </View>
            <View style={styles.skillsContainer}>
              {Object.entries(skillsByCategory).map(
                ([category, categorySkills]) => (
                  <View key={category} style={styles.skillRow}>
                    <Text style={styles.skillCategory}>{category}:</Text>
                    <Text style={styles.skillList}>
                      {categorySkills.map((s) => s.name).join(", ")}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Projects</Text>
              <View style={styles.sectionDivider} />
            </View>
            {projects.map((project) => (
              <View key={project.id} wrap={false} style={styles.projectContainer}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.url && (
                    <Text style={styles.projectUrl}>
                      {project.url.replace(/^https?:\/\//, "")}
                    </Text>
                  )}
                </View>
                <Text style={styles.projectDesc}>{project.description}</Text>
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
        {certifications && certifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.sectionDivider} />
            </View>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.certContainer}>
                <View style={styles.certRow}>
                  <Text>
                    <Text style={styles.certName}>{cert.name}</Text>
                    {cert.issuer && (
                      <Text style={styles.certIssuer}> - {cert.issuer}</Text>
                    )}
                  </Text>
                  {cert.date && (
                    <Text style={styles.certDate}>{formatDate(cert.date)}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.sectionDivider} />
            </View>
            <View style={styles.languagesContainer}>
              {languages.map((lang) => (
                <Text key={lang.id} style={styles.languageItem}>
                  {lang.name}
                  <Text style={styles.languageLevel}> ({lang.level})</Text>
                </Text>
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
