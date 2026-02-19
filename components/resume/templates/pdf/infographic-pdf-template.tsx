import React, { useMemo } from "react";
import { Document, Page, Text, View, StyleSheet, Image, Svg, Circle } from "@react-pdf/renderer";
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

interface InfographicPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

/**
 * Infographic PDF Template - Visual Data Representation
 *
 * Two-column layout (35/65 split) with visual skill indicators,
 * timeline experience, and stats cards.
 */

type InfographicColors = {
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  background: string;
};

function createStyles(colors: InfographicColors, fontFamily: string, customization?: PDFCustomization) {
  const baseFontSize = customization?.fontSize || 10;

  return StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: colors.background,
      fontFamily,
    },
    // Sidebar - 35%
    sidebar: {
      width: "35%",
      backgroundColor: colors.primary,
      padding: 20,
      paddingTop: 28,
      color: "#ffffff",
    },
    photoContainer: {
      alignItems: "center",
      marginBottom: 16,
    },
    photo: {
      width: 70,
      height: 70,
      borderRadius: 35,
      objectFit: "cover",
      borderWidth: 3,
      borderColor: "#ffffff",
    },
    nameContainer: {
      alignItems: "center",
      marginBottom: 16,
    },
    name: {
      fontSize: 18,
      fontWeight: 700,
      color: "#ffffff",
      textAlign: "center",
    },
    jobTitle: {
      fontSize: 10,
      color: "rgba(255,255,255,0.8)",
      marginTop: 2,
      textAlign: "center",
    },
    // Stats grid
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginBottom: 16,
    },
    statCard: {
      width: "47%",
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 6,
      padding: 8,
      alignItems: "center",
    },
    statValue: {
      fontSize: 16,
      fontWeight: 700,
      color: "#ffffff",
    },
    statLabel: {
      fontSize: 7,
      color: "rgba(255,255,255,0.6)",
      textTransform: "uppercase",
      marginTop: 2,
    },
    // Sidebar sections
    sidebarSection: {
      marginBottom: 14,
    },
    sidebarSectionTitle: {
      fontSize: 8,
      fontWeight: 600,
      color: "rgba(255,255,255,0.6)",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 8,
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 5,
    },
    contactIcon: {
      fontSize: 8,
      color: "rgba(255,255,255,0.5)",
      marginRight: 6,
      width: 10,
    },
    contactText: {
      fontSize: 8,
      color: "#ffffff",
      flex: 1,
    },
    // Skills grid
    skillsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    skillItem: {
      alignItems: "center",
      width: 40,
    },
    skillName: {
      fontSize: 7,
      color: "rgba(255,255,255,0.8)",
      textAlign: "center",
      marginTop: 3,
    },
    skillCategory: {
      marginBottom: 10,
    },
    skillCategoryName: {
      fontSize: 7,
      color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    // Language bar
    languageItem: {
      marginBottom: 6,
    },
    languageRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    languageName: {
      fontSize: 8,
      color: "#ffffff",
    },
    languageLevel: {
      fontSize: 7,
      color: "rgba(255,255,255,0.5)",
      textTransform: "capitalize",
    },
    languageBarBg: {
      height: 4,
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 2,
    },
    languageBarFill: {
      height: 4,
      borderRadius: 2,
    },
    // Main content
    main: {
      width: "65%",
      padding: 24,
    },
    // Summary box
    summaryBox: {
      backgroundColor: "#f9fafb",
      borderRadius: 6,
      padding: 12,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      marginBottom: 16,
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
    sectionIcon: {
      width: 20,
      height: 20,
      borderRadius: 4,
      backgroundColor: `${colors.primary}20`,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    sectionDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: colors.primary,
    },
    // Timeline
    timeline: {
      paddingLeft: 16,
      borderLeftWidth: 2,
      borderLeftColor: `${colors.primary}20`,
    },
    timelineItem: {
      marginBottom: 12,
      position: "relative",
    },
    timelineNode: {
      position: "absolute",
      left: -21,
      top: 0,
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    timelineNodeText: {
      fontSize: 7,
      fontWeight: 700,
      color: "#ffffff",
    },
    timelineNodeDot: {
      position: "absolute",
      left: -19,
      top: 2,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: "#ffffff",
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
      width: 4,
      height: 4,
      borderRadius: 2,
      marginRight: 6,
      marginTop: 4,
    },
    bulletText: {
      fontSize: 8,
      color: colors.muted,
      flex: 1,
      lineHeight: 1.4,
    },
    // Education
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
    // Projects grid
    projectsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    projectCard: {
      width: "48%",
      padding: 8,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      borderRadius: 6,
    },
    projectName: {
      fontSize: 9,
      fontWeight: 600,
      color: colors.text,
    },
    projectDescription: {
      fontSize: 7,
      color: colors.muted,
      marginTop: 3,
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
      color: colors.primary,
      backgroundColor: `${colors.primary}10`,
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
      backgroundColor: `${colors.primary}10`,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 12,
    },
    certIcon: {
      fontSize: 9,
      color: colors.primary,
      marginRight: 4,
    },
    certName: {
      fontSize: 8,
      fontWeight: 500,
      color: colors.primary,
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

const levelToPercent: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 95,
};

const languageLevelPercent: Record<string, number> = {
  basic: 25,
  conversational: 50,
  fluent: 75,
  native: 100,
};

export function InfographicPDFTemplate({
  data,
  customization,
}: InfographicPDFTemplateProps) {
  const fontFamily = getCustomizedFont(customization);
  const secondaryColor = customization?.secondaryColor || "#fb923c";
  const styles = useMemo(() => {
    const primaryColor = customization?.primaryColor || "#f97316";
    const colors: InfographicColors = {
      primary: primaryColor,
      secondary: secondaryColor,
      text: "#111827",
      muted: "#6b7280",
      background: "#ffffff",
    };
    return createStyles(colors, fontFamily, customization);
  }, [customization, fontFamily, secondaryColor]);

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

  // Calculate stats
  const yearsExperience = sortedExperience.reduce((acc, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : new Date(exp.endDate || "");
    return acc + Math.max(0, end.getFullYear() - start.getFullYear());
  }, 0);

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
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Photo */}
          {personalInfo.photo && (
            <View style={styles.photoContainer}>
              <Image src={personalInfo.photo} style={styles.photo} />
            </View>
          )}

          {/* Name */}
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {personalInfo.firstName || "Your"} {personalInfo.lastName || "Name"}
            </Text>
            {personalInfo.jobTitle && (
              <Text style={styles.jobTitle}>{personalInfo.jobTitle}</Text>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{yearsExperience}+</Text>
              <Text style={styles.statLabel}>Years Exp</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{sortedExperience.length}</Text>
              <Text style={styles.statLabel}>Positions</Text>
            </View>
            {data.projects && data.projects.length > 0 && (
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.projects.length}</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </View>
            )}
            {skills.length > 0 && (
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{skills.length}</Text>
                <Text style={styles.statLabel}>Skills</Text>
              </View>
            )}
          </View>

          {/* Contact */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarSectionTitle}>Contact</Text>
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

          {/* Skills */}
          {Object.keys(skillsByCategory).length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Skills</Text>
              {Object.entries(skillsByCategory)
                .slice(0, 2)
                .map(([category, categorySkills]) => (
                  <View key={category} style={styles.skillCategory}>
                    <Text style={styles.skillCategoryName}>{category}</Text>
                    <View style={styles.skillsGrid}>
                      {categorySkills.slice(0, 6).map((skill) => {
                        const percent = skill.level ? levelToPercent[skill.level] : 70;
                        return (
                          <View key={skill.id} style={styles.skillItem}>
                            <Svg width={35} height={35} viewBox="0 0 35 35">
                              <Circle
                                cx={17.5}
                                cy={17.5}
                                r={14}
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth={3}
                              />
                              <Circle
                                cx={17.5}
                                cy={17.5}
                                r={14}
                                fill="none"
                                stroke={secondaryColor}
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeDasharray={`${(percent / 100) * 88} 88`}
                                transform="rotate(-90, 17.5, 17.5)"
                              />
                            </Svg>
                            <Text style={styles.skillName}>{skill.name}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>Languages</Text>
              {data.languages.map((lang) => {
                const percent = languageLevelPercent[lang.level] || 50;
                return (
                  <View key={lang.id} style={styles.languageItem}>
                    <View style={styles.languageRow}>
                      <Text style={styles.languageName}>{lang.name}</Text>
                      <Text style={styles.languageLevel}>{lang.level}</Text>
                    </View>
                    <View style={styles.languageBarBg}>
                      <View
                        style={[
                          styles.languageBarFill,
                          { width: `${percent}%`, backgroundColor: secondaryColor },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
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
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.sectionTitle}>Experience</Text>
              </View>
              <View style={styles.timeline}>
                {sortedExperience.map((exp, index) => (
                  <View key={exp.id} wrap={false} style={styles.timelineItem}>
                    <View style={styles.timelineNode}>
                      <Text style={styles.timelineNodeText}>{index + 1}</Text>
                    </View>
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
                                <View
                                  style={[
                                    styles.bulletDot,
                                    { backgroundColor: secondaryColor },
                                  ]}
                                />
                                <Text style={styles.bulletText}>{item}</Text>
                              </View>
                            )
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.sectionTitle}>Education</Text>
              </View>
              <View style={styles.timeline}>
                {sortedEducation.map((edu) => (
                  <View key={edu.id} wrap={false} style={styles.timelineItem}>
                    <View style={styles.timelineNodeDot} />
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
            </View>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
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
                <View style={styles.sectionIcon}>
                  <View style={styles.sectionDot} />
                </View>
                <Text style={styles.sectionTitle}>Certifications</Text>
              </View>
              <View style={styles.certRow}>
                {certs.map((cert) => (
                  <View key={cert.id} wrap={false} style={styles.certBadge}>
                    <Text style={styles.certIcon}>{PDF_ICONS.check}</Text>
                    <Text style={styles.certName}>{cert.name}</Text>
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
