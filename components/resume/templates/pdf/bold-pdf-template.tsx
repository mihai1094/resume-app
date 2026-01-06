"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import { PDFCustomization } from "@/lib/pdf/fonts";

interface BoldPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Bold PDF Template
 *
 * A typography-focused, single-column PDF template with:
 * - Extra-large name (36pt)
 * - Bold uppercase section headers
 * - Strong contrast and generous whitespace
 * - Minimal accent colors for maximum ATS compatibility
 *
 * Best for: Executive, Sales, Management, General professional
 */
export function BoldPDFTemplate({ data, customization }: BoldPDFTemplateProps) {
  const { personalInfo, workExperience, education, skills, projects, certifications, languages, hobbies } = data;

  // Default colors (charcoal palette)
  const primaryColor = customization?.primaryColor || "#334155";
  const secondaryColor = customization?.secondaryColor || "#64748b";

  const hasWorkExperience = workExperience && workExperience.length > 0;
  const hasEducation = education && education.length > 0;
  const hasSkills = skills && skills.length > 0;
  const hasProjects = projects && projects.length > 0;
  const hasCertifications = certifications && certifications.length > 0;
  const hasLanguages = languages && languages.length > 0;
  const hasHobbies = hobbies && hobbies.length > 0;

  const formatDate = (date: string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const getFontFamily = () => {
    if (customization?.fontFamily === "serif") return "Times-Roman";
    if (customization?.fontFamily === "mono") return "Courier";
    return "Helvetica";
  };

  const baseFontSize = customization?.fontSize || 10;
  const sectionSpacing = customization?.sectionSpacing || 16;

  const styles = StyleSheet.create({
    page: {
      fontFamily: getFontFamily(),
      fontSize: baseFontSize,
      lineHeight: customization?.lineSpacing || 1.5,
      padding: "36pt 42pt",
      backgroundColor: "#ffffff",
    },
    // Header
    header: {
      marginBottom: 24,
    },
    name: {
      fontSize: 36,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: primaryColor,
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 12,
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    contactItem: {
      fontSize: 9,
      color: "#4b5563",
    },
    // Section
    section: {
      marginBottom: sectionSpacing,
    },
    sectionHeader: {
      fontSize: 10,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
    },
    // Content
    summaryText: {
      fontSize: baseFontSize,
      color: "#374151",
      lineHeight: 1.6,
    },
    // Experience/Education entries
    entryContainer: {
      marginBottom: 10,
    },
    entryCompany: {
      fontSize: 12,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
      marginBottom: 1,
    },
    entryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    entryTitle: {
      fontSize: baseFontSize,
      fontFamily: "Helvetica-Bold",
      color: primaryColor,
    },
    entryDate: {
      fontSize: 9,
      color: "#6b7280",
    },
    entryDescription: {
      fontSize: baseFontSize - 1,
      color: "#4b5563",
      marginBottom: 4,
    },
    // Bullet points
    bulletList: {
      paddingLeft: 12,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: 2,
    },
    bulletPoint: {
      fontSize: baseFontSize - 1,
      color: "#4b5563",
      marginRight: 6,
    },
    bulletText: {
      fontSize: baseFontSize - 1,
      color: "#4b5563",
      flex: 1,
    },
    // Skills as tags
    skillsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skillTag: {
      fontSize: baseFontSize - 1,
      fontFamily: "Helvetica-Bold",
      color: primaryColor,
      backgroundColor: `${primaryColor}10`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 3,
      borderWidth: 0.5,
      borderColor: `${primaryColor}50`,
    },
    // Projects
    projectName: {
      fontSize: 11,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    projectDescription: {
      fontSize: baseFontSize - 1,
      color: "#4b5563",
      marginTop: 2,
    },
    techContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
      marginTop: 4,
    },
    techTag: {
      fontSize: 8,
      fontFamily: "Helvetica-Bold",
      color: secondaryColor,
      backgroundColor: `${secondaryColor}15`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 2,
    },
    // Certifications
    certRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    certName: {
      fontSize: baseFontSize,
      fontFamily: "Helvetica-Bold",
      color: "#111827",
    },
    certIssuer: {
      fontSize: baseFontSize - 1,
      color: "#6b7280",
    },
    // Languages
    languagesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    languageItem: {
      fontSize: baseFontSize,
      color: "#374151",
    },
    languageName: {
      fontFamily: "Helvetica-Bold",
    },
    languageLevel: {
      color: "#6b7280",
    },
    // Hobbies
    hobbiesText: {
      fontSize: baseFontSize,
      color: "#4b5563",
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          {personalInfo.jobTitle && (
            <Text style={styles.title}>{personalInfo.jobTitle}</Text>
          )}
          <View style={styles.contactRow}>
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo.email && (
              <Text style={styles.contactItem}>{personalInfo.email}</Text>
            )}
            {personalInfo.website && (
              <Text style={styles.contactItem}>
                {personalInfo.website.replace(/^https?:\/\//, "")}
              </Text>
            )}
            {personalInfo.linkedin && (
              <Text style={styles.contactItem}>
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
              </Text>
            )}
            {personalInfo.github && (
              <Text style={styles.contactItem}>
                {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
              </Text>
            )}
          </View>
        </View>

        {/* Summary */}
        {personalInfo.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Summary</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {hasWorkExperience && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Experience</Text>
            {workExperience.map((job) => (
              <View key={job.id} style={styles.entryContainer}>
                <Text style={styles.entryCompany}>{job.company}</Text>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>{job.position}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(job.startDate)} — {job.current ? "Present" : formatDate(job.endDate)}
                    {job.location && ` | ${job.location}`}
                  </Text>
                </View>
                {((job.description && job.description.length > 0) || (job.achievements && job.achievements.length > 0)) && (
                  <View style={styles.bulletList}>
                    {job.description?.map((desc, idx) => (
                      <View key={`desc-${idx}`} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{desc}</Text>
                      </View>
                    ))}
                    {job.achievements?.map((achievement, idx) => (
                      <View key={`ach-${idx}`} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{achievement}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {hasEducation && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={styles.entryContainer}>
                <Text style={styles.entryCompany}>{edu.institution}</Text>
                <View style={styles.entryRow}>
                  <Text style={styles.entryTitle}>
                    {edu.degree}{edu.field && ` in ${edu.field}`}
                  </Text>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} — {edu.current ? "Present" : formatDate(edu.endDate)}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={styles.entryDescription}>GPA: {edu.gpa}</Text>
                )}
                {edu.description && edu.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.description.map((desc, idx) => (
                      <View key={idx} style={styles.bulletItem}>
                        <Text style={styles.bulletPoint}>•</Text>
                        <Text style={styles.bulletText}>{desc}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {hasSkills && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skillTag}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {hasProjects && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Projects</Text>
            {projects.map((project) => (
              <View key={project.id} style={styles.entryContainer}>
                <View style={styles.entryRow}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {(project.startDate || project.endDate) && (
                    <Text style={styles.entryDate}>
                      {formatDate(project.startDate)}{project.endDate ? ` — ${formatDate(project.endDate)}` : ""}
                    </Text>
                  )}
                </View>
                {project.description && (
                  <Text style={styles.projectDescription}>{project.description}</Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <View style={styles.techContainer}>
                    {project.technologies.map((tech, idx) => (
                      <Text key={idx} style={styles.techTag}>{tech}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {hasCertifications && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.certRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.certName}>{cert.name}</Text>
                  {cert.issuer && (
                    <Text style={styles.certIssuer}> — {cert.issuer}</Text>
                  )}
                </View>
                {cert.date && (
                  <Text style={styles.entryDate}>{formatDate(cert.date)}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {hasLanguages && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Languages</Text>
            <View style={styles.languagesContainer}>
              {languages.map((lang) => (
                <Text key={lang.id} style={styles.languageItem}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  {lang.level && (
                    <Text style={styles.languageLevel}> — {lang.level}</Text>
                  )}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Hobbies/Interests */}
        {hasHobbies && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Interests</Text>
            <Text style={styles.hobbiesText}>
              {hobbies.map((h) => h.name).join(" • ")}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
