import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";

interface ClassicPDFTemplateProps {
  data: ResumeData;
}

// Classic color palette - deep charcoal with burgundy accent
const colors = {
  primary: "#2c2c2c",
  accent: "#8b2942",
  white: "#ffffff",
  gray: "#666666",
  lightGray: "#f5f5f5",
  text: "#333333",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Times-Roman",
    padding: 48,
  },
  // Header
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  decorativeLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  decorativeBar: {
    width: 48,
    height: 1,
    backgroundColor: colors.accent,
  },
  decorativeDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
  },
  name: {
    fontSize: 28,
    fontFamily: "Times-Bold",
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  contactInfo: {
    alignItems: "center",
    gap: 4,
  },
  contactLocation: {
    fontSize: 11,
    color: colors.gray,
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  contactText: {
    fontSize: 10,
    color: colors.gray,
  },
  contactSeparator: {
    fontSize: 10,
    color: "#ccc",
  },
  linksRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  linkText: {
    fontSize: 9,
    color: colors.accent,
  },
  bottomDecorativeLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  decorativeBarLong: {
    flex: 1,
    maxWidth: 200,
    height: 1,
    backgroundColor: colors.primary,
  },
  smallDiamond: {
    width: 4,
    height: 4,
    backgroundColor: colors.accent,
    transform: "rotate(45deg)",
  },
  // Summary
  summarySection: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 11,
    color: colors.text,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 1.6,
    maxWidth: 450,
    alignSelf: "center",
  },
  // Key Strengths
  strengthsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(44, 44, 44, 0.15)",
    marginBottom: 20,
  },
  strengthItem: {
    flex: 1,
    alignItems: "center",
  },
  strengthCategory: {
    fontSize: 8,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  strengthSkills: {
    fontSize: 9,
    color: colors.text,
    textAlign: "center",
  },
  // Section Headers
  sectionHeader: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  // Experience Section
  section: {
    marginBottom: 18,
  },
  experienceItem: {
    marginBottom: 14,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
  },
  experienceTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  experienceDate: {
    fontSize: 10,
    color: colors.gray,
    fontStyle: "italic",
  },
  experienceCompanyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  experienceCompany: {
    fontSize: 11,
    color: colors.accent,
  },
  experienceLocation: {
    fontSize: 10,
    color: colors.gray,
  },
  bulletList: {
    marginLeft: 16,
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
  },
  bulletDot: {
    fontSize: 10,
    color: colors.primary,
    marginRight: 6,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
    lineHeight: 1.5,
  },
  // Achievements
  achievementsSection: {
    marginTop: 6,
    marginLeft: 16,
  },
  achievementsTitle: {
    fontSize: 8,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  achievementItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  achievementDot: {
    fontSize: 9,
    color: colors.accent,
    marginRight: 6,
  },
  achievementText: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  // Education
  educationItem: {
    marginBottom: 10,
  },
  educationDegree: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  educationField: {
    fontFamily: "Times-Roman",
    fontWeight: "normal",
  },
  educationInstitution: {
    fontSize: 11,
    color: colors.accent,
  },
  educationGPA: {
    fontSize: 10,
    color: colors.gray,
    marginLeft: 16,
  },
  // Skills
  skillsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 6,
  },
  skillCategoryLabel: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.accent,
    width: 100,
  },
  skillsList: {
    fontSize: 10,
    color: colors.text,
    flex: 1,
  },
  // Two Column Layout
  twoColumnContainer: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 18,
  },
  columnHalf: {
    flex: 1,
  },
  smallSectionHeader: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  // Languages
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  languageName: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.text,
  },
  languageLevel: {
    fontSize: 10,
    color: colors.gray,
  },
  languageSeparator: {
    fontSize: 10,
    color: colors.accent,
    marginHorizontal: 6,
  },
  // Certifications
  certificationItem: {
    marginBottom: 6,
  },
  certificationName: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  certificationInstitution: {
    fontSize: 9,
    color: colors.gray,
  },
  certificationDate: {
    fontSize: 8,
    color: colors.gray,
  },
  // Activities
  activityItem: {
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  activityTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.primary,
  },
  activityOrg: {
    fontSize: 10,
    color: colors.text,
  },
  activityRole: {
    fontSize: 9,
    color: colors.gray,
  },
  // Interests
  interestsSection: {
    textAlign: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(44, 44, 44, 0.15)",
  },
  interestsLabel: {
    fontSize: 8,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginRight: 6,
  },
  interestsText: {
    fontSize: 10,
    color: colors.gray,
    fontStyle: "italic",
  },
});

export function ClassicPDFTemplate({ data }: ClassicPDFTemplateProps) {
  const { personalInfo, workExperience, education, skills, languages, courses, hobbies, extraCurricular } = data;
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

  const strengthHighlights = Object.entries(skillsByCategory).slice(0, 3);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.decorativeLine}>
            <View style={styles.decorativeBar} />
            <View style={styles.decorativeDiamond} />
            <View style={styles.decorativeBar} />
          </View>

          <Text style={styles.name}>{fullName || "Your Name"}</Text>

          <View style={styles.contactInfo}>
            {personalInfo.location && (
              <Text style={styles.contactLocation}>{personalInfo.location}</Text>
            )}
            <View style={styles.contactRow}>
              {personalInfo.email && (
                <Text style={styles.contactText}>{personalInfo.email}</Text>
              )}
              {personalInfo.phone && (
                <>
                  <Text style={styles.contactSeparator}>|</Text>
                  <Text style={styles.contactText}>{personalInfo.phone}</Text>
                </>
              )}
            </View>
            {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
              <View style={styles.linksRow}>
                {personalInfo.linkedin && (
                  <Text style={styles.linkText}>
                    {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, "").split("/").slice(0, 2).join("/")}
                  </Text>
                )}
                {personalInfo.website && (
                  <Text style={styles.linkText}>
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </Text>
                )}
                {personalInfo.github && (
                  <Text style={styles.linkText}>
                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View style={styles.bottomDecorativeLine}>
            <View style={styles.decorativeBarLong} />
            <View style={styles.smallDiamond} />
            <View style={styles.decorativeBarLong} />
          </View>
        </View>

        {/* Summary */}
        {personalInfo.summary && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Key Strengths */}
        {strengthHighlights.length > 0 && (
          <View style={styles.strengthsSection}>
            {strengthHighlights.map(([category, categorySkills]) => (
              <View key={category} style={styles.strengthItem}>
                <Text style={styles.strengthCategory}>{category}</Text>
                <Text style={styles.strengthSkills}>
                  {categorySkills.map((skill) => skill.name).join(", ")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Professional Experience */}
        {sortedExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Experience</Text>

            {sortedExperience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.experienceTitle}>{exp.position}</Text>
                    <View style={styles.experienceCompanyRow}>
                      <Text style={styles.experienceCompany}>{exp.company}</Text>
                      {exp.location && (
                        <Text style={styles.experienceLocation}>, {exp.location}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.experienceDate}>
                    {formatDate(exp.startDate)} – {exp.current ? "Present" : formatDate(exp.endDate || "")}
                  </Text>
                </View>

                {exp.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.description.map((item, idx) => item.trim() && (
                      <View key={idx} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {exp.achievements && exp.achievements.length > 0 && (
                  <View style={styles.achievementsSection}>
                    <Text style={styles.achievementsTitle}>Key Achievements</Text>
                    {exp.achievements.map((achievement, idx) => achievement.trim() && (
                      <View key={idx} style={styles.achievementItem}>
                        <Text style={styles.achievementDot}>◦</Text>
                        <Text style={styles.achievementText}>{achievement}</Text>
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
            <Text style={styles.sectionHeader}>Education</Text>

            {sortedEducation.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.educationDegree}>
                      {edu.degree}
                      {edu.field && <Text style={styles.educationField}>, {edu.field}</Text>}
                    </Text>
                    <View style={styles.experienceCompanyRow}>
                      <Text style={styles.educationInstitution}>{edu.institution}</Text>
                      {edu.location && (
                        <Text style={styles.experienceLocation}>, {edu.location}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.experienceDate}>
                    {formatDate(edu.startDate)} – {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={styles.educationGPA}>GPA: {edu.gpa}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Skills & Expertise</Text>

            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <View key={category} style={styles.skillsRow}>
                <Text style={styles.skillCategoryLabel}>{category}:</Text>
                <Text style={styles.skillsList}>
                  {categorySkills.map((skill) => skill.name).join(" · ")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Languages & Certifications */}
        {((languages && languages.length > 0) || (courses && courses.length > 0)) && (
          <View style={styles.twoColumnContainer}>
            {languages && languages.length > 0 && (
              <View style={styles.columnHalf}>
                <Text style={styles.smallSectionHeader}>Languages</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {languages.map((lang, idx) => (
                    <View key={lang.id} style={styles.languageItem}>
                      <Text style={styles.languageName}>{lang.name}</Text>
                      <Text style={styles.languageLevel}> ({lang.level})</Text>
                      {idx < languages.length - 1 && (
                        <Text style={styles.languageSeparator}>·</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {courses && courses.length > 0 && (
              <View style={styles.columnHalf}>
                <Text style={styles.smallSectionHeader}>Certifications</Text>
                {courses.map((course) => (
                  <View key={course.id} style={styles.certificationItem}>
                    <Text style={styles.certificationName}>{course.name}</Text>
                    {course.institution && (
                      <Text style={styles.certificationInstitution}>, {course.institution}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Extra-curricular */}
        {extraCurricular && extraCurricular.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Leadership & Community</Text>

            {extraCurricular.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <View>
                    <Text style={styles.activityTitle}>
                      {activity.title}
                      {activity.organization && (
                        <Text style={styles.activityOrg}>, {activity.organization}</Text>
                      )}
                    </Text>
                    {activity.role && (
                      <Text style={styles.activityRole}> — {activity.role}</Text>
                    )}
                  </View>
                  {(activity.startDate || activity.endDate) && (
                    <Text style={styles.experienceDate}>
                      {activity.startDate && formatDate(activity.startDate)} – {activity.current ? "Present" : activity.endDate ? formatDate(activity.endDate) : ""}
                    </Text>
                  )}
                </View>
                {activity.description && activity.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {activity.description.map((item, idx) => item.trim() && (
                      <View key={idx} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
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
      </Page>
    </Document>
  );
}





