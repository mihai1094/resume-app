import React from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { PDF_FONTS, PDF_COLORS, PDFCustomization, getCustomizedFont } from "@/lib/pdf/fonts";

interface StudentPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type StudentColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: StudentColors, fontFamily: string) {
  return StyleSheet.create({
    page: {
      backgroundColor: colors.background,
      fontFamily,
      padding: 40,
      paddingTop: 36,
      paddingBottom: 36,
    },
    // Header - Centered for student template
    header: {
      marginBottom: 16,
      alignItems: "center",
      borderBottomWidth: 2,
      borderBottomColor: colors.accent,
      paddingBottom: 12,
    },
    name: {
      fontSize: 24,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 4,
      textAlign: "center",
    },
    jobTitle: {
      fontSize: 11,
      color: colors.muted,
      marginBottom: 6,
      textAlign: "center",
    },
    contactRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      marginBottom: 4,
    },
    contactItem: {
      fontSize: 9,
      color: colors.muted,
    },
    contactSeparator: {
      fontSize: 9,
      color: colors.muted,
    },
    contactLink: {
      fontSize: 9,
      color: colors.accent,
      textDecoration: "none",
    },
    linksRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 12,
      marginTop: 4,
    },
    summary: {
      fontSize: 10,
      color: colors.text,
      lineHeight: 1.5,
      marginTop: 12,
      marginBottom: 4,
      textAlign: "center",
      paddingHorizontal: 20,
    },
    // Section
    section: {
      marginBottom: 14,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: `${colors.accent}40`,
      paddingBottom: 4,
    },
    sectionTitle: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.accent,
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    // Education - Prominent styling
    educationItem: {
      marginBottom: 10,
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    educationLeft: {
      flex: 1,
    },
    educationRight: {
      textAlign: "right",
    },
    educationInstitution: {
      fontSize: 11,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 1,
    },
    educationDegree: {
      fontSize: 10,
      color: colors.text,
    },
    educationLocation: {
      fontSize: 9,
      color: colors.muted,
    },
    educationDate: {
      fontSize: 9,
      color: colors.muted,
    },
    educationGpa: {
      fontSize: 9,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.muted,
      marginTop: 2,
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
    // Projects
    projectItem: {
      marginBottom: 8,
    },
    projectHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
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
      color: colors.muted,
      marginTop: 2,
    },
    projectLinks: {
      flexDirection: "row",
      gap: 10,
      marginTop: 2,
    },
    // Skills - Inline tags
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
      borderRadius: 3,
      borderWidth: 0.5,
      borderColor: "#e2e8f0",
    },
    // Activities
    activityItem: {
      marginBottom: 8,
    },
    activityHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 2,
    },
    activityTitle: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
      marginBottom: 1,
    },
    activityOrg: {
      fontSize: 9,
      color: colors.muted,
    },
    // Certifications
    certItem: {
      marginBottom: 6,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    certName: {
      fontSize: 10,
      fontFamily: `${fontFamily === PDF_FONTS.serif ? "Times-Bold" : "Helvetica-Bold"}`,
      color: colors.primary,
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
      borderRadius: 3,
      borderWidth: 0.5,
      borderColor: "#e2e8f0",
    },
    languageLevel: {
      color: colors.muted,
      fontSize: 8,
    },
  });
}

export function StudentPDFTemplate({ data, customization }: StudentPDFTemplateProps) {
  const { personalInfo } = data;
  const experience = sortWorkExperienceByDate(data.workExperience);
  const education = sortEducationByDate(data.education);
  const skills = data.skills || [];
  const languages = data.languages || [];
  const certifications = data.certifications || [];
  const projects = data.projects || [];
  const extraCurricular = data.extraCurricular || [];

  const baseColors = PDF_COLORS.student;

  const colors: StudentColors = customization
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

  const fullName = [personalInfo.firstName, personalInfo.lastName]
    .filter(Boolean)
    .join(" ") || "Your Name";

  // Education goes first if minimal work experience (student-friendly)
  const showEducationFirst = experience.length <= 1;

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
              <Link src={`mailto:${personalInfo.email}`} style={styles.contactLink}>
                {personalInfo.email}
              </Link>
            )}
            {personalInfo.email && personalInfo.phone && (
              <Text style={styles.contactSeparator}>|</Text>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo.phone && personalInfo.location && (
              <Text style={styles.contactSeparator}>|</Text>
            )}
            {personalInfo.location && (
              <Text style={styles.contactItem}>{personalInfo.location}</Text>
            )}
          </View>

          <View style={styles.linksRow}>
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
            {personalInfo.website && (
              <Link src={personalInfo.website} style={styles.contactLink}>
                {personalInfo.website.replace(/^https?:\/\//, "")}
              </Link>
            )}
          </View>
        </View>

        {/* Summary */}
        {personalInfo.summary && (
          <Text style={styles.summary}>{personalInfo.summary}</Text>
        )}

        {/* Education - Shown first for students */}
        {showEducationFirst && education.length > 0 && (
          <EducationSection education={education} styles={styles} />
        )}

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

        {/* Education - Shown after experience for experienced candidates */}
        {!showEducationFirst && education.length > 0 && (
          <EducationSection education={education} styles={styles} />
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Projects</Text>
            </View>
            {projects.map((project) => (
              <View key={project.id} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {(project.startDate || project.endDate) && (
                    <Text style={styles.experienceDate}>
                      {project.startDate && formatDate(project.startDate)}
                      {project.endDate && ` — ${formatDate(project.endDate)}`}
                    </Text>
                  )}
                </View>
                {project.description && (
                  <Text style={styles.projectDescription}>{project.description}</Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.projectTech}>
                    Technologies: {project.technologies.join(", ")}
                  </Text>
                )}
                {(project.url || project.github) && (
                  <View style={styles.projectLinks}>
                    {project.url && (
                      <Link src={project.url} style={styles.contactLink}>
                        {project.url.replace(/^https?:\/\//, "")}
                      </Link>
                    )}
                    {project.github && (
                      <Link src={project.github} style={styles.contactLink}>
                        {project.github.replace(/^https?:\/\/(www\.)?/, "")}
                      </Link>
                    )}
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
            </View>
            <View style={styles.skillsContainer}>
              {skills.map((skill) => (
                <Text key={skill.id} style={styles.skillTag}>{skill.name}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Activities & Leadership */}
        {extraCurricular.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Activities & Leadership</Text>
            </View>
            {extraCurricular.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <View style={styles.experienceLeft}>
                    <Text style={styles.activityTitle}>
                      {activity.role || activity.title}
                    </Text>
                    {activity.organization && (
                      <Text style={styles.activityOrg}>{activity.organization}</Text>
                    )}
                  </View>
                  {(activity.startDate || activity.endDate) && (
                    <Text style={styles.experienceDate}>
                      {activity.startDate && formatDate(activity.startDate)}
                      {activity.startDate && " — "}
                      {activity.current ? "Present" : activity.endDate && formatDate(activity.endDate)}
                    </Text>
                  )}
                </View>
                {activity.description && activity.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {activity.description.filter((d) => d.trim()).map((d, idx) => (
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

        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Certifications</Text>
            </View>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.certItem}>
                <View>
                  <Text style={styles.certName}>{cert.name}</Text>
                  <Text style={styles.certIssuer}>{cert.issuer}</Text>
                </View>
                {cert.date && (
                  <Text style={styles.certDate}>{formatDate(cert.date)}</Text>
                )}
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

function EducationSection({
  education,
  styles,
}: {
  education: ResumeData["education"];
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Education</Text>
      </View>
      {education.map((edu) => (
        <View key={edu.id} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <View style={styles.educationLeft}>
              <Text style={styles.educationInstitution}>{edu.institution}</Text>
              <Text style={styles.educationDegree}>
                {[edu.degree, edu.field].filter(Boolean).join(" in ")}
              </Text>
              {edu.location && (
                <Text style={styles.educationLocation}>{edu.location}</Text>
              )}
            </View>
            <View style={styles.educationRight}>
              <Text style={styles.educationDate}>
                {formatDate(edu.startDate)} —{" "}
                {edu.current ? `Expected ${formatDate(edu.endDate || "")}` : formatDate(edu.endDate || "")}
              </Text>
              {edu.gpa && (
                <Text style={styles.educationGpa}>GPA: {edu.gpa}</Text>
              )}
            </View>
          </View>
          {edu.description && edu.description.length > 0 && (
            <View style={styles.bulletList}>
              {edu.description.filter((d) => d.trim()).map((d, idx) => (
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
  );
}

export default StudentPDFTemplate;
