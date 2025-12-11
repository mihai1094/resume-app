import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { PDF_FONTS, PDF_COLORS, PDFCustomization, getCustomizedColors, getCustomizedFont } from "@/lib/pdf/fonts";

interface ClarityPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type ClarityColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: ClarityColors, fontFamily: string) {
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
      marginBottom: 24,
    },
    name: {
      fontSize: 28,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    summary: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.6,
      marginBottom: 12,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
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
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingBottom: 6,
      borderBottomWidth: 2,
      borderBottomColor: colors.accent,
    },
    sectionTitle: {
      fontSize: 12,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    // Experience
    experienceItem: {
      marginBottom: 14,
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
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
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
      marginTop: 6,
      paddingLeft: 12,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 3,
    },
    bulletDot: {
      width: 12,
      fontSize: 10,
      color: colors.accent,
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
    educationDegree: {
      fontSize: 11,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
    },
    educationSchool: {
      fontSize: 10,
      color: colors.muted,
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
      gap: 8,
    },
    skillCategory: {
      marginBottom: 8,
      width: "100%",
    },
    skillCategoryTitle: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 4,
    },
    skillsList: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.5,
    },
    // Languages
    languagesRow: {
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

export function ClarityPDFTemplate({ data, customization }: ClarityPDFTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];

  const baseColors = {
    primary: "#0f172a",
    accent: "#0ea5e9",
    text: "#334155",
    muted: "#64748b",
    background: "#ffffff",
  };

  const colors = customization
    ? { ...baseColors, ...getCustomizedColors(PDF_COLORS.clarity, customization) } as ClarityColors
    : baseColors;

  const fontFamily = customization
    ? getCustomizedFont(customization)
    : PDF_FONTS.sans;

  const styles = createStyles(colors, fontFamily);

  const fullName = [personalInfo.firstName, personalInfo.lastName]
    .filter(Boolean)
    .join(" ") || "Your Name";

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || "Skills";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>

          {personalInfo.summary && (
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          )}

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

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
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
                  <Text style={styles.educationDetails}>GPA: {edu.gpa}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {Object.keys(skillsByCategory).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>
            {Object.entries(skillsByCategory).map(([category, skillList]) => (
              <View key={category} style={styles.skillCategory}>
                <Text style={styles.skillCategoryTitle}>{category}</Text>
                <Text style={styles.skillsList}>{skillList.join(" • ")}</Text>
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
