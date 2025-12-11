import React, { useMemo } from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { PDF_FONTS, PDF_COLORS, PDFCustomization, getCustomizedColors, getCustomizedFont } from "@/lib/pdf/fonts";

interface ExecutivePDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type ExecutiveColors = {
  primary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
  sidebar: string;
  white: string;
  gray: string;
  lightGray: string;
};

function createStyles(colors: ExecutiveColors, fontFamily: string) {
  return StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Times-Roman",
  },
  // Top Border
  topBorder: {
    height: 6,
    backgroundColor: colors.primary,
  },
  bottomBorder: {
    height: 3,
    backgroundColor: colors.accent,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  content: {
    padding: 40,
    paddingTop: 36,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    gap: 24,
  },
  monogram: {
    width: 72,
    height: 72,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  monogramText: {
    fontSize: 28,
    fontFamily: "Times-Bold",
    color: colors.white,
    letterSpacing: 1,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontFamily: "Times-Bold",
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 18,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  contactIcon: {
    fontSize: 9,
    color: colors.accent,
  },
  contactText: {
    fontSize: 10,
    color: colors.primary,
  },
  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderLine: {
    width: 24,
    height: 1,
    backgroundColor: colors.accent,
  },
  sectionHeaderLineFade: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(184, 134, 11, 0.3)",
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  section: {
    marginBottom: 20,
  },
  // Executive Summary
  summaryText: {
    fontSize: 11,
    color: colors.primary,
    lineHeight: 1.6,
  },
  // Career Highlights
  highlightsBox: {
    backgroundColor: "rgba(30, 41, 59, 0.03)",
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: 14,
    marginBottom: 20,
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  highlightItem: {
    width: "50%",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    paddingRight: 12,
  },
  highlightDiamond: {
    fontSize: 11,
    color: colors.accent,
    marginTop: 1,
  },
  highlightText: {
    fontSize: 10,
    color: colors.primary,
    flex: 1,
    lineHeight: 1.4,
  },
  // Experience
  experienceItem: {
    marginBottom: 16,
    position: "relative",
  },
  experienceWithTimeline: {
    flexDirection: "row",
    gap: 14,
  },
  timelineDotContainer: {
    alignItems: "center",
    width: 20,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },
  timelineDotActive: {
    backgroundColor: colors.accent,
  },
  timelineDotInactive: {
    backgroundColor: "rgba(30, 41, 59, 0.15)",
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  timelineLine: {
    position: "absolute",
    left: 9,
    top: 22,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(30, 41, 59, 0.15)",
  },
  experienceContent: {
    flex: 1,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 13,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  experienceDate: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: colors.primary,
    backgroundColor: "rgba(30, 41, 59, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  experienceCompany: {
    fontSize: 11,
    color: colors.accent,
    marginBottom: 6,
  },
  experienceLocation: {
    color: colors.gray,
  },
  // Achievements first for executives
  achievementsList: {
    marginBottom: 8,
  },
  achievementItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  achievementDiamond: {
    fontSize: 9,
    color: colors.accent,
    marginTop: 1,
  },
  achievementText: {
    fontSize: 10,
    color: colors.primary,
    flex: 1,
    lineHeight: 1.4,
  },
  // Description
  descriptionList: {
    marginTop: 4,
  },
  descriptionItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 3,
  },
  descriptionDash: {
    fontSize: 10,
    color: colors.gray,
    marginTop: 1,
  },
  descriptionText: {
    fontSize: 10,
    color: colors.gray,
    flex: 1,
    lineHeight: 1.4,
  },
  // Two Column Layout
  twoColumnContainer: {
    flexDirection: "row",
    gap: 32,
  },
  columnHalf: {
    flex: 1,
  },
  // Education
  educationItem: {
    marginBottom: 12,
  },
  educationDegree: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  educationField: {
    fontFamily: "Times-Roman",
    color: colors.gray,
  },
  educationInstitution: {
    fontSize: 10,
    color: colors.accent,
  },
  educationMeta: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 2,
  },
  // Skills
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  skillsList: {
    fontSize: 10,
    color: colors.gray,
    lineHeight: 1.5,
  },
  // Additional sections row
  additionalRow: {
    flexDirection: "row",
    gap: 32,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.15)",
  },
  additionalSection: {
    flex: 1,
  },
  additionalTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  languageItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  languageLevel: {
    fontSize: 10,
    color: colors.gray,
  },
  certItem: {
    marginBottom: 6,
  },
  certName: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  certInstitution: {
    fontSize: 9,
    color: colors.gray,
  },
  // Board Positions
  boardSection: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.15)",
  },
  boardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  boardItem: {
    width: "50%",
    paddingRight: 16,
    marginBottom: 10,
  },
  boardTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  boardOrg: {
    fontSize: 10,
    color: colors.accent,
  },
  boardRole: {
    fontSize: 9,
    color: colors.gray,
  },
  boardDesc: {
    fontSize: 9,
    color: colors.gray,
    marginTop: 2,
    lineHeight: 1.4,
  },
  // Interests
  interestsSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(30, 41, 59, 0.08)",
  },
  interestsLabel: {
    fontSize: 8,
    fontFamily: "Times-Bold",
    color: colors.gray,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  interestsText: {
    fontSize: 9,
    color: colors.gray,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 30,
    fontSize: 9,
    color: colors.gray,
  },
  });
}

export function ExecutivePDFTemplate({ data, customization }: ExecutivePDFTemplateProps) {
  const baseColors = getCustomizedColors(PDF_COLORS.executive, customization) as typeof PDF_COLORS.executive;
  const colors: ExecutiveColors = {
    ...baseColors,
    white: baseColors.background,
    gray: baseColors.muted,
    lightGray: "#f8fafc",
  };
  const fontFamily = getCustomizedFont(customization);
  const styles = useMemo(() => createStyles(colors, fontFamily), [colors, fontFamily]);

  const {
    personalInfo,
    workExperience,
    education,
    skills,
    languages,
    courses,
    hobbies,
    extraCurricular,
  } = data;
  const sortedExperience = sortWorkExperienceByDate(workExperience);
  const sortedEducation = sortEducationByDate(education);
  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();
  const initials = `${personalInfo.firstName?.[0] || ""}${
    personalInfo.lastName?.[0] || ""
  }`;

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Aggregate key wins from all experiences
  const aggregatedWins = sortedExperience
    .flatMap((exp) => exp.achievements || [])
    .filter((item) => item && item.trim().length > 0)
    .slice(0, 4);

  const documentTitle = fullName ? `${fullName} - Resume` : "Resume";

  return (
    <Document
      title={documentTitle}
      author={fullName || "ResumeForge User"}
      subject="Professional Resume"
      keywords="resume, cv, professional, career, executive"
      creator="ResumeForge"
      producer="ResumeForge - react-pdf"
    >
      <Page size="A4" style={styles.page}>
        {/* Top Border */}
        <View style={styles.topBorder} />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.monogram}>
              <Text style={styles.monogramText}>{initials || "CV"}</Text>
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.name}>{fullName || "Your Name"}</Text>

              <View style={styles.contactRow}>
                {personalInfo.email && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactIcon}>✉</Text>
                    <Text style={styles.contactText}>{personalInfo.email}</Text>
                  </View>
                )}
                {personalInfo.phone && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactIcon}>☎</Text>
                    <Text style={styles.contactText}>{personalInfo.phone}</Text>
                  </View>
                )}
                {personalInfo.location && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactIcon}>◉</Text>
                    <Text style={styles.contactText}>
                      {personalInfo.location}
                    </Text>
                  </View>
                )}
                {personalInfo.linkedin && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactIcon}>in</Text>
                    <Text style={styles.contactText}>
                      {personalInfo.linkedin
                        .replace(/^https?:\/\/(www\.)?/, "")
                        .split("/")
                        .slice(0, 2)
                        .join("/")}
                    </Text>
                  </View>
                )}
                {personalInfo.website && (
                  <View style={styles.contactItem}>
                    <Text style={styles.contactIcon}>◎</Text>
                    <Text style={styles.contactText}>
                      {personalInfo.website.replace(/^https?:\/\//, "")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Executive Summary */}
          {personalInfo.summary && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLine} />
                <Text style={styles.sectionTitle}>Executive Summary</Text>
                <View style={styles.sectionHeaderLineFade} />
              </View>
              <Text style={styles.summaryText}>{personalInfo.summary}</Text>
            </View>
          )}

          {/* Career Highlights */}
          {aggregatedWins.length > 0 && (
            <View style={styles.highlightsBox}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Career Highlights</Text>
              </View>
              <View style={styles.highlightsGrid}>
                {aggregatedWins.map((win, idx) => (
                  <View key={idx} style={styles.highlightItem}>
                    <Text style={styles.highlightDiamond}>◆</Text>
                    <Text style={styles.highlightText}>{win}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Professional Experience */}
          {sortedExperience.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLine} />
                <Text style={styles.sectionTitle}>Professional Experience</Text>
                <View style={styles.sectionHeaderLineFade} />
              </View>

              {sortedExperience.map((exp, index) => (
                <View key={exp.id} wrap={false} style={styles.experienceItem}>
                  <View style={styles.experienceWithTimeline}>
                    <View style={styles.timelineDotContainer}>
                      <View
                        style={[
                          styles.timelineDot,
                          index === 0
                            ? styles.timelineDotActive
                            : styles.timelineDotInactive,
                        ]}
                      >
                        {index === 0 && (
                          <View style={styles.timelineDotInner} />
                        )}
                      </View>
                      {index < sortedExperience.length - 1 && (
                        <View style={styles.timelineLine} />
                      )}
                    </View>

                    <View style={styles.experienceContent}>
                      <View style={styles.experienceHeader}>
                        <View>
                          <Text style={styles.experienceTitle}>
                            {exp.position}
                          </Text>
                          <Text style={styles.experienceCompany}>
                            {exp.company}
                            {exp.location && (
                              <Text style={styles.experienceLocation}>
                                {" "}
                                — {exp.location}
                              </Text>
                            )}
                          </Text>
                        </View>
                        <Text style={styles.experienceDate}>
                          {formatDate(exp.startDate)} —{" "}
                          {exp.current
                            ? "Present"
                            : formatDate(exp.endDate || "")}
                        </Text>
                      </View>

                      {/* Achievements First */}
                      {exp.achievements && exp.achievements.length > 0 && (
                        <View style={styles.achievementsList}>
                          {exp.achievements.map(
                            (achievement, idx) =>
                              achievement.trim() && (
                                <View key={idx} style={styles.achievementItem}>
                                  <Text style={styles.achievementDiamond}>
                                    ◆
                                  </Text>
                                  <Text style={styles.achievementText}>
                                    {achievement}
                                  </Text>
                                </View>
                              )
                          )}
                        </View>
                      )}

                      {/* Description */}
                      {exp.description.length > 0 && (
                        <View style={styles.descriptionList}>
                          {exp.description.map(
                            (item, idx) =>
                              item.trim() && (
                                <View key={idx} style={styles.descriptionItem}>
                                  <Text style={styles.descriptionDash}>—</Text>
                                  <Text style={styles.descriptionText}>
                                    {item}
                                  </Text>
                                </View>
                              )
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Two Column: Education & Skills */}
          <View style={styles.twoColumnContainer}>
            {/* Education */}
            {sortedEducation.length > 0 && (
              <View style={styles.columnHalf}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLine} />
                  <Text style={styles.sectionTitle}>Education</Text>
                </View>

                {sortedEducation.map((edu) => (
                  <View key={edu.id} wrap={false} style={styles.educationItem}>
                    <Text style={styles.educationDegree}>
                      {edu.degree}
                      {edu.field && (
                        <Text style={styles.educationField}>
                          {" "}
                          in {edu.field}
                        </Text>
                      )}
                    </Text>
                    <Text style={styles.educationInstitution}>
                      {edu.institution}
                    </Text>
                    <Text style={styles.educationMeta}>
                      {formatDate(edu.startDate)} —{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate || "")}
                      {edu.gpa && ` · GPA: ${edu.gpa}`}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <View style={styles.columnHalf}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderLine} />
                  <Text style={styles.sectionTitle}>Core Competencies</Text>
                </View>

                {Object.entries(skillsByCategory).map(
                  ([category, categorySkills]) => (
                    <View key={category} style={styles.skillCategory}>
                      <Text style={styles.skillCategoryTitle}>{category}</Text>
                      <Text style={styles.skillsList}>
                        {categorySkills.map((skill) => skill.name).join(" · ")}
                      </Text>
                    </View>
                  )
                )}
              </View>
            )}
          </View>

          {/* Languages & Certifications */}
          {((languages && languages.length > 0) ||
            (courses && courses.length > 0)) && (
            <View style={styles.additionalRow}>
              {languages && languages.length > 0 && (
                <View style={styles.additionalSection}>
                  <Text style={styles.additionalTitle}>Languages</Text>
                  {languages.map((lang) => (
                    <View key={lang.id} style={styles.languageItem}>
                      <Text style={styles.languageName}>{lang.name}</Text>
                      <Text style={styles.languageLevel}>({lang.level})</Text>
                    </View>
                  ))}
                </View>
              )}

              {(() => {
                const certs = data.certifications?.filter(c => c.type !== "course") || [];
                const coursesFromCerts = data.certifications?.filter(c => c.type === "course") || [];
                const legacyCourses = courses || [];
                // Normalize all items to have the same shape
                const allItems = [
                  ...certs.map(c => ({ id: c.id, name: c.name, institution: c.issuer })),
                  ...coursesFromCerts.map(c => ({ id: c.id, name: c.name, institution: c.issuer })),
                  ...legacyCourses.map(c => ({ id: c.id, name: c.name, institution: c.institution })),
                ];
                return allItems.length > 0 && (
                  <View style={styles.additionalSection}>
                    <Text style={styles.additionalTitle}>Certifications</Text>
                    {allItems.map((item) => (
                      <View key={item.id} style={styles.certItem}>
                        <Text style={styles.certName}>{item.name}</Text>
                        {item.institution && (
                          <Text style={styles.certInstitution}>
                            {" "}
                            — {item.institution}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                );
              })()}
            </View>
          )}

          {/* Board & Advisory Positions */}
          {extraCurricular && extraCurricular.length > 0 && (
            <View style={styles.boardSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLine} />
                <Text style={styles.sectionTitle}>
                  Board & Advisory Positions
                </Text>
                <View style={styles.sectionHeaderLineFade} />
              </View>

              <View style={styles.boardGrid}>
                {extraCurricular.map((activity) => (
                  <View key={activity.id} wrap={false} style={styles.boardItem}>
                    <Text style={styles.boardTitle}>{activity.title}</Text>
                    {activity.organization && (
                      <Text style={styles.boardOrg}>
                        {" "}
                        — {activity.organization}
                      </Text>
                    )}
                    {activity.role && (
                      <Text style={styles.boardRole}>{activity.role}</Text>
                    )}
                    {activity.description &&
                      activity.description.length > 0 && (
                        <Text style={styles.boardDesc}>
                          {activity.description[0]}
                        </Text>
                      )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Interests */}
          {hobbies && hobbies.length > 0 && (
            <View style={styles.interestsSection}>
              <Text>
                <Text style={styles.interestsLabel}>Interests: </Text>
                <Text style={styles.interestsText}>
                  {hobbies.map((hobby) => hobby.name).join(" · ")}
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Border */}
        <View style={styles.bottomBorder} />

        {/* Page number - only shows on multi-page resumes */}
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
