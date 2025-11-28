import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";

interface ModernPDFTemplateProps {
  data: ResumeData;
}

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  contactInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  contactItem: {
    fontSize: 10,
    color: "#666666",
    marginRight: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
    textTransform: "uppercase",
    borderBottom: "1px solid #000000",
    paddingBottom: 4,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#333333",
    marginBottom: 4,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
  },
  experienceCompany: {
    fontSize: 11,
    color: "#333333",
    marginBottom: 2,
  },
  experienceDate: {
    fontSize: 10,
    color: "#666666",
  },
  experienceLocation: {
    fontSize: 10,
    color: "#666666",
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333333",
    marginTop: 4,
  },
  bulletPoint: {
    fontSize: 10,
    lineHeight: 1.4,
    color: "#333333",
    marginLeft: 10,
    marginBottom: 2,
  },
  educationItem: {
    marginBottom: 10,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  educationDegree: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
  },
  educationInstitution: {
    fontSize: 11,
    color: "#333333",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillTag: {
    fontSize: 10,
    color: "#333333",
    marginRight: 6,
    marginBottom: 4,
  },
  skillCategory: {
    marginBottom: 8,
  },
  skillCategoryTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000000",
  },
});

export function ModernPDFTemplate({ data }: ModernPDFTemplateProps) {
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

          {/* Contact Info */}
          <View style={styles.contactInfo}>
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
              <Text style={styles.contactItem}>{personalInfo.website}</Text>
            )}
            {personalInfo.linkedin && (
              <Text style={styles.contactItem}>
                LinkedIn: {personalInfo.linkedin}
              </Text>
            )}
            {personalInfo.github && (
              <Text style={styles.contactItem}>
                GitHub: {personalInfo.github}
              </Text>
            )}
          </View>
        </View>

        {/* Summary */}
        {personalInfo.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {sortedExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {sortedExperience.map((exp) => (
              <View key={exp.id} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.experienceTitle}>
                      {exp.position || "Position Title"}
                    </Text>
                    <Text style={styles.experienceCompany}>
                      {exp.company || "Company Name"}
                    </Text>
                  </View>
                  <Text style={styles.experienceDate}>
                    {exp.startDate ? formatDate(exp.startDate) : ""} -{" "}
                    {exp.current
                      ? "Present"
                      : exp.endDate
                      ? formatDate(exp.endDate)
                      : ""}
                  </Text>
                </View>
                {exp.location && (
                  <Text style={styles.experienceLocation}>{exp.location}</Text>
                )}
                {exp.description && exp.description.length > 0 && (
                  <View style={styles.experienceDescription}>
                    {exp.description.map((bullet, idx) => (
                      <Text key={idx} style={styles.bulletPoint}>
                        • {bullet}
                      </Text>
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
            <Text style={styles.sectionTitle}>Education</Text>
            {sortedEducation.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <View>
                    <Text style={styles.educationDegree}>
                      {edu.degree || "Degree"}
                      {edu.field && ` in ${edu.field}`}
                    </Text>
                    <Text style={styles.educationInstitution}>
                      {edu.institution || "Institution"}
                    </Text>
                  </View>
                  <Text style={styles.experienceDate}>
                    {edu.startDate ? formatDate(edu.startDate) : ""} -{" "}
                    {edu.current
                      ? "Present"
                      : edu.endDate
                      ? formatDate(edu.endDate)
                      : ""}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={styles.contactItem}>GPA: {edu.gpa}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {Object.keys(skillsByCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {Object.entries(skillsByCategory).map(
              ([category, categorySkills]) => (
                <View key={category} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>{category}</Text>
                  <View style={styles.skillsContainer}>
                    {categorySkills.map((skill) => (
                      <Text key={skill.id} style={styles.skillTag}>
                        {skill.name}
                        {skill.level && ` (${skill.level})`}
                      </Text>
                    ))}
                  </View>
                </View>
              )
            )}
          </View>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.skillsContainer}>
              {data.languages.map((lang) => (
                <Text key={lang.id} style={styles.skillTag}>
                  {lang.name}
                  {lang.level && ` - ${lang.level}`}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Courses */}
        {data.courses && data.courses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Courses & Certifications</Text>
            {data.courses.map((course) => (
              <View key={course.id} style={styles.experienceItem}>
                <Text style={styles.experienceTitle}>{course.name}</Text>
                {course.institution && (
                  <Text style={styles.experienceCompany}>{course.institution}</Text>
                )}
                {course.date && (
                  <Text style={styles.experienceDate}>
                    {formatDate(course.date)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Hobbies */}
        {data.hobbies && data.hobbies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hobbies & Interests</Text>
            <View style={styles.skillsContainer}>
              {data.hobbies.map((hobby) => (
                <Text key={hobby.id} style={styles.skillTag}>
                  {hobby.name}
                  {hobby.description && ` - ${hobby.description}`}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
