import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { PDF_FONTS, PDF_COLORS, PDFCustomization, getCustomizedColors, getCustomizedFont } from "@/lib/pdf/fonts";

interface StructuredPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type StructuredColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: StructuredColors, fontFamily: string) {
  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily,
      padding: 48,
      paddingTop: 40,
      paddingBottom: 40,
    },
    // Header
    header: {
      marginBottom: 20,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    name: {
      fontSize: 30,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      letterSpacing: -0.5,
    },
    contactColumn: {
      alignItems: "flex-end",
      gap: 2,
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
    summary: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.6,
    },
    divider: {
      height: 1,
      backgroundColor: colors.accent,
      opacity: 0.3,
      marginVertical: 16,
    },
    // Section Grid Layout (label left, content right)
    sectionGrid: {
      flexDirection: "row",
      marginBottom: 16,
    },
    sectionLabel: {
      width: 100,
      paddingRight: 16,
    },
    sectionTitle: {
      fontSize: 9,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    sectionAccent: {
      marginTop: 6,
      height: 2,
      width: 40,
      backgroundColor: colors.accent,
      opacity: 0.6,
    },
    sectionContent: {
      flex: 1,
    },
    // Experience
    experienceItem: {
      marginBottom: 12,
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
    companyName: {
      fontSize: 9,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    experienceTitle: {
      fontSize: 11,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 2,
    },
    experienceLocation: {
      fontSize: 9,
      color: colors.muted,
    },
    experienceDate: {
      fontSize: 9,
      color: colors.muted,
      textAlign: "right",
    },
    bulletList: {
      marginTop: 6,
      paddingLeft: 8,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 3,
    },
    bulletDot: {
      width: 10,
      fontSize: 10,
      color: colors.muted,
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.5,
    },
    // Education
    educationItem: {
      marginBottom: 10,
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    institutionName: {
      fontSize: 9,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    educationDegree: {
      fontSize: 11,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
    },
    educationDetails: {
      fontSize: 9,
      color: colors.muted,
      marginTop: 2,
    },
    // Skills
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skillTag: {
      fontSize: 9,
      color: colors.text,
      backgroundColor: "#f8fafc",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
    // Languages
    languagesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    languageItem: {
      fontSize: 10,
      color: colors.text,
      backgroundColor: "#f8fafc",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 3,
      borderWidth: 1,
      borderColor: "#e2e8f0",
    },
    languageLevel: {
      color: colors.muted,
      fontSize: 9,
    },
    // Certifications
    certItem: {
      marginBottom: 6,
    },
    certName: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
    },
    certDetails: {
      fontSize: 9,
      color: colors.muted,
    },
    // Projects
    projectItem: {
      marginBottom: 10,
    },
    projectName: {
      fontSize: 11,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 2,
    },
    projectDescription: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.5,
    },
    projectTech: {
      fontSize: 9,
      color: colors.accent,
      marginTop: 4,
    },
  });
}

export function StructuredPDFTemplate({ data, customization }: StructuredPDFTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  const baseColors = {
    primary: "#111827",
    accent: "#10b981",
    text: "#374151",
    muted: "#6b7280",
    background: "#ffffff",
  };

  const colors = customization
    ? { ...baseColors, ...getCustomizedColors(PDF_COLORS.structured, customization) } as StructuredColors
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
          <View style={styles.headerRow}>
            <Text style={styles.name}>{fullName}</Text>
            <View style={styles.contactColumn}>
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
            </View>
          </View>

          {personalInfo.summary && (
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.sectionGrid}>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionTitle}>Experience</Text>
              <View style={styles.sectionAccent} />
            </View>
            <View style={styles.sectionContent}>
              {experience.map((exp) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View style={styles.experienceLeft}>
                      <Text style={styles.companyName}>{exp.company}</Text>
                      <Text style={styles.experienceTitle}>{exp.position}</Text>
                      {exp.location && (
                        <Text style={styles.experienceLocation}>{exp.location}</Text>
                      )}
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
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.sectionGrid}>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionTitle}>Education</Text>
              <View style={styles.sectionAccent} />
            </View>
            <View style={styles.sectionContent}>
              {education.map((edu) => (
                <View key={edu.id} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <View style={styles.experienceLeft}>
                      <Text style={styles.institutionName}>{edu.institution}</Text>
                      <Text style={styles.educationDegree}>
                        {edu.degree}
                        {edu.field && ` — ${edu.field}`}
                      </Text>
                    </View>
                    <Text style={styles.experienceDate}>
                      {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate || "")}
                    </Text>
                  </View>
                  {edu.gpa && (
                    <Text style={styles.educationDetails}>GPA: {edu.gpa}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.sectionGrid}>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.sectionAccent} />
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.skillsContainer}>
                {skills.map((skill) => (
                  <Text key={skill.id} style={styles.skillTag}>{skill.name}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.sectionGrid}>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionTitle}>Projects</Text>
              <View style={styles.sectionAccent} />
            </View>
            <View style={styles.sectionContent}>
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
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.sectionGrid}>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionTitle}>Certifications</Text>
              <View style={styles.sectionAccent} />
            </View>
            <View style={styles.sectionContent}>
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
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View style={styles.sectionGrid}>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionTitle}>Languages</Text>
              <View style={styles.sectionAccent} />
            </View>
            <View style={styles.sectionContent}>
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
          </View>
        )}
      </Page>
    </Document>
  );
}
