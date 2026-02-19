import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { PDF_FONTS, PDF_COLORS, PDFCustomization, getCustomizedColors, getCustomizedFont } from "@/lib/pdf/fonts";

interface CompactPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type CompactColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: CompactColors, fontFamily: string) {
  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily,
      padding: 40,
      paddingTop: 36,
      paddingBottom: 36,
    },
    // Header - Compact
    header: {
      marginBottom: 14,
    },
    name: {
      fontSize: 26,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    contactItem: {
      fontSize: 8,
      color: colors.muted,
    },
    contactLink: {
      fontSize: 8,
      color: colors.accent,
      textDecoration: "none",
    },
    summary: {
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.5,
      marginTop: 10,
    },
    divider: {
      height: 1,
      backgroundColor: colors.accent,
      opacity: 0.4,
      marginVertical: 12,
    },
    // Section
    section: {
      marginBottom: 12,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 6,
    },
    sectionAccent: {
      width: 3,
      height: 10,
      backgroundColor: colors.accent,
      borderRadius: 1,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    // Experience - Compact layout
    experienceItem: {
      marginBottom: 8,
    },
    experienceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    experienceLeft: {
      flex: 1,
    },
    experienceTitle: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 1,
    },
    experienceCompany: {
      fontSize: 9,
      color: colors.muted,
    },
    experienceDate: {
      fontSize: 8,
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
      width: 8,
      fontSize: 9,
      color: colors.muted,
    },
    bulletText: {
      flex: 1,
      fontSize: 9,
      color: colors.text,
      lineHeight: 1.4,
    },
    // Education - Compact
    educationItem: {
      marginBottom: 6,
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 1,
    },
    educationDegree: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
    },
    educationSchool: {
      fontSize: 9,
      color: colors.muted,
    },
    educationDetails: {
      fontSize: 8,
      color: colors.muted,
      marginTop: 1,
    },
    // Skills - Inline compact
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    skillTag: {
      fontSize: 8,
      color: colors.text,
      backgroundColor: "#f1f5f9",
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 2,
      borderWidth: 0.5,
      borderColor: "#e2e8f0",
    },
    // Languages - Compact inline
    languagesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    languageItem: {
      fontSize: 9,
      color: colors.text,
      backgroundColor: "#f1f5f9",
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 2,
      borderWidth: 0.5,
      borderColor: "#e2e8f0",
    },
    languageLevel: {
      color: colors.muted,
      fontSize: 8,
    },
    // Certifications - Compact
    certItem: {
      marginBottom: 4,
    },
    certName: {
      fontSize: 9,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
    },
    certDetails: {
      fontSize: 8,
      color: colors.muted,
    },
    // Projects - Compact
    projectItem: {
      marginBottom: 6,
    },
    projectName: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 1,
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
  });
}

export function CompactPDFTemplate({ data, customization }: CompactPDFTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  const baseColors = {
    primary: "#0f172a",
    accent: "#6366f1",
    text: "#334155",
    muted: "#64748b",
    background: "#ffffff",
  };

  const colors = customization
    ? { ...baseColors, ...getCustomizedColors(PDF_COLORS.compact, customization) } as CompactColors
    : baseColors;

  const fontFamily = customization
    ? getCustomizedFont(customization)
    : PDF_FONTS.sans;

  const styles = createStyles(colors, fontFamily);

  const fullName = [personalInfo.firstName, personalInfo.lastName]
    .filter(Boolean)
    .join(" ") || "Your Name";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>

          <View style={styles.contactRow}>
            {personalInfo.email && (
              <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                {personalInfo.email}
              </Link>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
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

          {personalInfo.summary && (
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Experience</Text>
            </View>
            {experience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View style={styles.experienceLeft}>
                    <Text style={styles.experienceTitle}>{exp.position}</Text>
                    <Text style={styles.experienceCompany}>
                      {exp.company}
                      {exp.location && ` — ${exp.location}`}
                    </Text>
                  </View>
                  <Text style={styles.experienceDate}>
                    {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </Text>
                </View>
                {exp.description && exp.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.description.filter((d) => d.trim()).map((d, idx) => (
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
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Education</Text>
            </View>
            {education.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <View style={styles.experienceLeft}>
                    <Text style={styles.educationDegree}>
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </Text>
                    <Text style={styles.educationSchool}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.experienceDate}>
                    {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={styles.educationDetails}>Grade: {edu.gpa}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>
            <View style={styles.skillsContainer}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skillTag}>{skill.name}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {projects.map((project) => (
              <View key={project.id} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.name}</Text>
                {project.description && (
                  <Text style={styles.projectDescription}>{project.description}</Text>
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
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Certifications</Text>
            </View>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.certItem}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certDetails}>
                  {cert.issuer}
                  {cert.date && ` • ${formatDate(cert.date)}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Languages</Text>
            </View>
            <View style={styles.languagesRow}>
              {languages.map((lang) => (
                <Text key={lang.id} style={styles.languageItem}>
                  {lang.name}
                  {lang.level && (
                    <Text style={styles.languageLevel}> ({lang.level})</Text>
                  )}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
