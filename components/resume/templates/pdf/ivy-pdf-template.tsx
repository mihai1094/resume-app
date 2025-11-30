import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";

interface IvyPDFTemplateProps {
  data: ResumeData;
}

// Classic black and white - ATS optimized
const colors = {
  black: "#000000",
  darkGray: "#333333",
  gray: "#666666",
  lightGray: "#999999",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.white,
    fontFamily: "Times-Roman",
    padding: 40,
    fontSize: 11,
    lineHeight: 1.4,
    color: colors.black,
  },
  // Header
  header: {
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
    paddingBottom: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  name: {
    fontSize: 20,
    fontFamily: "Times-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 10,
    color: colors.black,
  },
  contactSeparator: {
    fontSize: 10,
    color: colors.lightGray,
  },
  // Section Headers
  sectionHeader: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingBottom: 4,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
  },
  section: {
    marginBottom: 14,
  },
  // Education (first for finance/consulting)
  educationItem: {
    marginBottom: 10,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  educationInstitution: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: colors.black,
  },
  educationDate: {
    fontSize: 10,
    color: colors.black,
  },
  educationDegreeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  educationDegree: {
    fontSize: 11,
    fontStyle: "italic",
    color: colors.black,
  },
  educationLocation: {
    fontSize: 10,
    fontStyle: "italic",
    color: colors.black,
  },
  educationGPA: {
    fontSize: 10,
    color: colors.black,
  },
  // Experience
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  experienceCompany: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: colors.black,
  },
  experiencePositionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  experiencePosition: {
    fontSize: 11,
    fontStyle: "italic",
    fontFamily: "Times-Bold",
    color: colors.black,
  },
  // Bullet points
  bulletList: {
    marginTop: 2,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
    gap: 6,
  },
  bulletDot: {
    fontSize: 10,
    color: colors.black,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 10,
    color: colors.black,
    flex: 1,
    lineHeight: 1.35,
    textAlign: "justify",
  },
  // Achievement bullets (bolder)
  achievementItem: {
    flexDirection: "row",
    marginBottom: 2,
    gap: 6,
  },
  achievementArrow: {
    fontSize: 10,
    color: colors.black,
    marginTop: 1,
  },
  achievementText: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.black,
    flex: 1,
    lineHeight: 1.35,
    textAlign: "justify",
  },
  // Activities
  activityItem: {
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  activityOrg: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: colors.black,
  },
  activityRole: {
    fontSize: 11,
    fontStyle: "italic",
    fontFamily: "Times-Bold",
    color: colors.black,
    marginBottom: 2,
  },
  // Additional Information section
  additionalSection: {
    marginBottom: 14,
  },
  additionalRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  additionalLabel: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: colors.black,
    width: 80,
  },
  additionalText: {
    fontSize: 10,
    color: colors.black,
    flex: 1,
  },
  // Certifications
  certificationItem: {
    flexDirection: "row",
    marginBottom: 3,
    gap: 6,
  },
  certificationText: {
    fontSize: 10,
    color: colors.black,
    flex: 1,
  },
  certificationName: {
    fontFamily: "Times-Bold",
  },
  certificationInstitution: {
    color: colors.black,
  },
  certificationDate: {
    color: colors.gray,
  },
});

export function IvyPDFTemplate({ data }: IvyPDFTemplateProps) {
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
  const documentTitle = fullName ? `${fullName} - Resume` : "Resume";

  return (
    <Document
      title={documentTitle}
      author={fullName || "ResumeForge User"}
      subject="Professional Resume"
      keywords="resume, cv, professional, career, academic"
      creator="ResumeForge"
      producer="ResumeForge - react-pdf"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{fullName || "Your Name"}</Text>

          <View style={styles.contactRow}>
            {personalInfo.location && (
              <Text style={styles.contactText}>{personalInfo.location}</Text>
            )}
            {personalInfo.phone && (
              <>
                <Text style={styles.contactSeparator}>|</Text>
                <Text style={styles.contactText}>{personalInfo.phone}</Text>
              </>
            )}
            {personalInfo.email && (
              <>
                <Text style={styles.contactSeparator}>|</Text>
                <Text style={styles.contactText}>{personalInfo.email}</Text>
              </>
            )}
            {personalInfo.linkedin && (
              <>
                <Text style={styles.contactSeparator}>|</Text>
                <Text style={styles.contactText}>
                  {personalInfo.linkedin
                    .replace(/^https?:\/\/(www\.)?/, "")
                    .split("/")
                    .slice(0, 2)
                    .join("/")}
                </Text>
              </>
            )}
            {personalInfo.website && (
              <>
                <Text style={styles.contactSeparator}>|</Text>
                <Text style={styles.contactText}>
                  {personalInfo.website.replace(/^https?:\/\//, "")}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Education (first for finance/consulting) */}
        {sortedEducation.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education</Text>

            {sortedEducation.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.educationInstitution}>
                    {edu.institution}
                  </Text>
                  <Text style={styles.educationDate}>
                    {formatDate(edu.startDate)} –{" "}
                    {edu.current ? "Present" : formatDate(edu.endDate || "")}
                  </Text>
                </View>
                <View style={styles.educationDegreeRow}>
                  <Text style={styles.educationDegree}>
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </Text>
                  {edu.location && (
                    <Text style={styles.educationLocation}>{edu.location}</Text>
                  )}
                </View>
                {edu.gpa && (
                  <Text style={styles.educationGPA}>GPA: {edu.gpa}</Text>
                )}
                {edu.description && edu.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.description.map(
                      (item, idx) =>
                        item.trim() && (
                          <View key={idx} style={styles.bulletItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{item}</Text>
                          </View>
                        )
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Professional Experience */}
        {sortedExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Professional Experience</Text>

            {sortedExperience.map((job) => (
              <View key={job.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.experienceCompany}>{job.company}</Text>
                  <Text style={styles.educationDate}>
                    {formatDate(job.startDate)} –{" "}
                    {job.current ? "Present" : formatDate(job.endDate || "")}
                  </Text>
                </View>
                <View style={styles.experiencePositionRow}>
                  <Text style={styles.experiencePosition}>{job.position}</Text>
                  {job.location && (
                    <Text style={styles.educationLocation}>{job.location}</Text>
                  )}
                </View>

                {job.description && job.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {job.description.map(
                      (item, idx) =>
                        item.trim() && (
                          <View key={idx} style={styles.bulletItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{item}</Text>
                          </View>
                        )
                    )}
                  </View>
                )}

                {job.achievements && job.achievements.length > 0 && (
                  <View style={styles.bulletList}>
                    {job.achievements.map(
                      (achievement, idx) =>
                        achievement.trim() && (
                          <View key={idx} style={styles.achievementItem}>
                            <Text style={styles.achievementArrow}>▸</Text>
                            <Text style={styles.achievementText}>
                              {achievement}
                            </Text>
                          </View>
                        )
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Leadership & Activities */}
        {extraCurricular && extraCurricular.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Leadership & Activities</Text>

            {extraCurricular.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityOrg}>
                    {activity.organization || activity.title}
                  </Text>
                  <Text style={styles.educationDate}>
                    {activity.startDate && formatDate(activity.startDate)} –{" "}
                    {activity.current
                      ? "Present"
                      : activity.endDate
                      ? formatDate(activity.endDate)
                      : ""}
                  </Text>
                </View>
                <Text style={styles.activityRole}>
                  {activity.role || activity.title}
                </Text>

                {activity.description && activity.description.length > 0 && (
                  <View style={styles.bulletList}>
                    {activity.description.map(
                      (item, idx) =>
                        item.trim() && (
                          <View key={idx} style={styles.bulletItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText}>{item}</Text>
                          </View>
                        )
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Additional Information */}
        {(skills.length > 0 ||
          (languages && languages.length > 0) ||
          (hobbies && hobbies.length > 0)) && (
          <View style={styles.additionalSection}>
            <Text style={styles.sectionHeader}>Additional Information</Text>

            {skills.length > 0 && (
              <View style={styles.additionalRow}>
                <Text style={styles.additionalLabel}>Technical:</Text>
                <Text style={styles.additionalText}>
                  {skills.map((s) => s.name).join(", ")}
                </Text>
              </View>
            )}

            {languages && languages.length > 0 && (
              <View style={styles.additionalRow}>
                <Text style={styles.additionalLabel}>Languages:</Text>
                <Text style={styles.additionalText}>
                  {languages.map((l) => `${l.name} (${l.level})`).join(", ")}
                </Text>
              </View>
            )}

            {hobbies && hobbies.length > 0 && (
              <View style={styles.additionalRow}>
                <Text style={styles.additionalLabel}>Interests:</Text>
                <Text style={styles.additionalText}>
                  {hobbies.map((h) => h.name).join(", ")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Certifications */}
        {courses && courses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Certifications</Text>

            {courses.map((course) => (
              <View key={course.id} style={styles.certificationItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.certificationText}>
                  <Text style={styles.certificationName}>{course.name}</Text>
                  {course.institution && (
                    <Text style={styles.certificationInstitution}>
                      , {course.institution}
                    </Text>
                  )}
                  {course.date && (
                    <Text style={styles.certificationDate}>
                      {" "}
                      (
                      {new Date(course.date + "-01").toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        }
                      )}
                      )
                    </Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
