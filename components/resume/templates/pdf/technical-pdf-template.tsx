import React, { useMemo } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { ResumeData } from "@/lib/types/resume";
import {
  formatDate,
  sortWorkExperienceByDate,
  sortEducationByDate,
} from "@/lib/utils";
import { PDF_FONTS, PDF_COLORS, PDFCustomization, getCustomizedColors, getCustomizedFont } from "@/lib/pdf/fonts";

interface TechnicalPDFTemplateProps {
  data: ResumeData;
  customization?: PDFCustomization;
}

type TechnicalColors = {
  bg: string;
  sidebar: string;
  hover: string;
  border: string;
  text: string;
  textMuted: string;
  keyword: string;
  function: string;
  string: string;
  variable: string;
  comment: string;
  type: string;
  number: string;
  primary: string;
  accent: string;
  muted: string;
  background: string;
};

function createStyles(colors: TechnicalColors, fontFamily: string) {
  return StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    fontFamily: "Courier",
    fontSize: 10,
    color: colors.text,
  },
  // Window Title Bar
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.sidebar,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  windowButtons: {
    flexDirection: "row",
    gap: 6,
    marginRight: 12,
  },
  windowButton: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  buttonRed: {
    backgroundColor: "#ff5f56",
  },
  buttonYellow: {
    backgroundColor: "#ffbd2e",
  },
  buttonGreen: {
    backgroundColor: "#27c93f",
  },
  fileName: {
    fontSize: 9,
    color: colors.textMuted,
  },
  // Main Layout
  mainContainer: {
    flexDirection: "row",
  },
  // Sidebar
  sidebar: {
    width: 180,
    backgroundColor: colors.sidebar,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    padding: 16,
  },
  photo: {
    width: 60,
    height: 60,
    marginBottom: 12,
    objectFit: "cover",
  },
  sidebarName: {
    fontSize: 16,
    fontFamily: "Courier-Bold",
    color: colors.function,
    marginBottom: 4,
  },
  sidebarTitle: {
    fontSize: 8,
    color: colors.type,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  // Sidebar Sections
  sidebarSection: {
    marginBottom: 18,
  },
  sidebarSectionTitle: {
    fontSize: 8,
    color: colors.comment,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  // Contact
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 5,
  },
  contactIcon: {
    fontSize: 8,
    color: colors.keyword,
  },
  contactTextString: {
    fontSize: 8,
    color: colors.string,
  },
  contactTextVar: {
    fontSize: 8,
    color: colors.variable,
  },
  // Skills
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 8,
    fontFamily: "Courier-Bold",
    color: colors.type,
    marginBottom: 5,
  },
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 7,
    color: colors.variable,
    backgroundColor: colors.hover,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 2,
  },
  // Languages (spoken)
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  languageName: {
    fontSize: 8,
    color: colors.text,
  },
  languageLevel: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Main Content
  mainContent: {
    flex: 1,
    padding: 24,
  },
  // Summary (JSDoc style)
  summaryBlock: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 9,
    color: colors.comment,
    lineHeight: 1.6,
  },
  // Section Headers
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Courier-Bold",
    color: colors.function,
    marginBottom: 14,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  sectionKeyword: {
    color: colors.keyword,
  },
  sectionBracket: {
    color: colors.type,
  },
  section: {
    marginBottom: 22,
  },
  // Experience Items
  experienceItem: {
    backgroundColor: colors.sidebar,
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 12,
    marginLeft: 12,
  },
  experienceActive: {
    borderLeftColor: colors.keyword,
  },
  experienceInactive: {
    borderLeftColor: colors.border,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  experienceTitle: {
    fontSize: 11,
    fontFamily: "Courier-Bold",
    color: colors.function,
  },
  experienceDate: {
    fontSize: 8,
    color: colors.number,
    backgroundColor: colors.hover,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
  },
  experienceMeta: {
    marginBottom: 8,
  },
  experienceCompanyAt: {
    fontSize: 9,
    color: colors.type,
  },
  experienceCompany: {
    fontSize: 9,
    color: colors.variable,
  },
  experienceLocation: {
    fontSize: 9,
    color: colors.textMuted,
  },
  // Description
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 6,
  },
  bulletArrow: {
    fontSize: 9,
    color: colors.keyword,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 9,
    color: colors.text,
    flex: 1,
    lineHeight: 1.4,
  },
  // Achievements
  achievementsBox: {
    backgroundColor: colors.hover,
    padding: 10,
    marginTop: 8,
    borderRadius: 3,
  },
  achievementsComment: {
    fontSize: 8,
    color: colors.comment,
    marginBottom: 6,
  },
  achievementItem: {
    flexDirection: "row",
    marginBottom: 3,
    gap: 5,
  },
  achievementCheck: {
    fontSize: 8,
    color: colors.comment,
    marginTop: 1,
  },
  achievementText: {
    fontSize: 9,
    color: colors.string,
    flex: 1,
    lineHeight: 1.4,
  },
  // Projects Grid
  projectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginLeft: 12,
  },
  projectCard: {
    width: "48%",
    backgroundColor: colors.sidebar,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 3,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  projectBracket: {
    fontSize: 9,
    color: colors.keyword,
  },
  projectName: {
    fontSize: 10,
    fontFamily: "Courier-Bold",
    color: colors.function,
  },
  projectDesc: {
    fontSize: 8,
    color: colors.textMuted,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  projectTechWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
  },
  projectTech: {
    fontSize: 7,
    color: colors.type,
    backgroundColor: colors.hover,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  // Education
  educationItem: {
    backgroundColor: colors.sidebar,
    borderLeftWidth: 3,
    borderLeftColor: colors.comment,
    padding: 12,
    marginBottom: 10,
    marginLeft: 12,
  },
  educationDegree: {
    fontSize: 10,
    fontFamily: "Courier-Bold",
    color: colors.function,
  },
  educationField: {
    color: colors.type,
  },
  educationFieldText: {
    fontFamily: "Courier",
    color: colors.textMuted,
  },
  educationMeta: {
    marginTop: 4,
  },
  educationInstitution: {
    fontSize: 9,
    color: colors.variable,
  },
  educationDate: {
    fontSize: 8,
    color: colors.number,
  },
  educationGPA: {
    fontSize: 8,
    color: colors.comment,
    marginTop: 4,
  },
  // Certifications
  certificationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginLeft: 12,
  },
  certCard: {
    width: "48%",
    backgroundColor: colors.sidebar,
    padding: 10,
    borderRadius: 3,
  },
  certName: {
    fontSize: 9,
    color: colors.string,
  },
  certInstitution: {
    fontSize: 8,
    color: colors.textMuted,
  },
  // Closing bracket
  closingBracket: {
    fontSize: 12,
    fontFamily: "Courier-Bold",
    color: colors.type,
    marginTop: 4,
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 30,
    fontSize: 9,
    color: colors.textMuted,
  },
  });
}

export function TechnicalPDFTemplate({ data, customization }: TechnicalPDFTemplateProps) {
  const baseColors = getCustomizedColors(PDF_COLORS.technical, customization) as typeof PDF_COLORS.technical;
  const colors: TechnicalColors = {
    ...baseColors,
    bg: baseColors.background,
    sidebar: (baseColors as typeof PDF_COLORS.technical).sidebar || "#252526",
    hover: "#2a2d2e",
    border: "#3c3c3c",
    textMuted: baseColors.muted,
    keyword: (baseColors as typeof PDF_COLORS.technical).keyword || "#569cd6",
    function: "#dcdcaa",
    string: (baseColors as typeof PDF_COLORS.technical).string || "#ce9178",
    variable: "#9cdcfe",
    comment: (baseColors as typeof PDF_COLORS.technical).comment || "#6a9955",
    type: "#4ec9b0",
    number: "#b5cea8",
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
    projects,
  } = data;
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

  const documentTitle = fullName ? `${fullName} - Resume` : "Resume";

  return (
    <Document
      title={documentTitle}
      author={fullName || "ResumeForge User"}
      subject="Professional Resume"
      keywords="resume, cv, professional, career, technical, developer"
      creator="ResumeForge"
      producer="ResumeForge - react-pdf"
    >
      <Page size="A4" style={styles.page}>
        {/* Window Title Bar */}
        <View style={styles.titleBar}>
          <View style={styles.windowButtons}>
            <View style={[styles.windowButton, styles.buttonRed]} />
            <View style={[styles.windowButton, styles.buttonYellow]} />
            <View style={[styles.windowButton, styles.buttonGreen]} />
          </View>
          <Text style={styles.fileName}>
            ⌘ {fullName.toLowerCase().replace(/\s+/g, "_")}_resume.md
          </Text>
        </View>

        <View style={styles.mainContainer}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {personalInfo.photo && (
              <Image src={personalInfo.photo} style={styles.photo} />
            )}
            <Text style={styles.sidebarName}>{fullName || "Your Name"}</Text>
            <Text style={styles.sidebarTitle}>
              {personalInfo.summary?.split(".")[0]?.slice(0, 40) ||
                "Software Developer"}
            </Text>

            {/* Contact */}
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarSectionTitle}>// Contact</Text>
              {personalInfo.email && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>✉</Text>
                  <Text style={styles.contactTextString}>
                    "{personalInfo.email}"
                  </Text>
                </View>
              )}
              {personalInfo.location && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>◉</Text>
                  <Text style={styles.contactTextString}>
                    "{personalInfo.location}"
                  </Text>
                </View>
              )}
              {personalInfo.linkedin && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>in</Text>
                  <Text style={styles.contactTextVar}>
                    {personalInfo.linkedin
                      .replace(/^https?:\/\/(www\.)?/, "")
                      .split("/")
                      .slice(0, 2)
                      .join("/")}
                  </Text>
                </View>
              )}
              {personalInfo.github && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>⌂</Text>
                  <Text style={styles.contactTextVar}>
                    {personalInfo.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </Text>
                </View>
              )}
              {personalInfo.website && (
                <View style={styles.contactItem}>
                  <Text style={styles.contactIcon}>◎</Text>
                  <Text style={styles.contactTextVar}>
                    {personalInfo.website.replace(/^https?:\/\//, "")}
                  </Text>
                </View>
              )}
            </View>

            {/* Tech Stack */}
            {skills.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>// Tech Stack</Text>
                {Object.entries(skillsByCategory).map(
                  ([category, categorySkills]) => (
                    <View key={category} style={styles.skillCategory}>
                      <Text style={styles.skillCategoryTitle}>{category}</Text>
                      <View style={styles.skillsWrap}>
                        {categorySkills.map((skill) => (
                          <Text key={skill.id} style={styles.skillTag}>
                            {skill.name}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )
                )}
              </View>
            )}

            {/* Languages (spoken) */}
            {languages && languages.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>// Languages</Text>
                {languages.map((lang) => (
                  <View key={lang.id} style={styles.languageItem}>
                    <Text style={styles.languageName}>{lang.name}</Text>
                    <Text style={styles.languageLevel}>
                      {lang.level === "native" && "●●●●"}
                      {lang.level === "fluent" && "●●●○"}
                      {lang.level === "conversational" && "●●○○"}
                      {lang.level === "basic" && "●○○○"}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Summary */}
            {personalInfo.summary && (
              <View style={styles.summaryBlock}>
                <Text style={styles.summaryText}>
                  /**{"\n"} * {personalInfo.summary}
                  {"\n"} */
                </Text>
              </View>
            )}

            {/* Experience */}
            {sortedExperience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>
                  <Text style={styles.sectionKeyword}>const </Text>
                  experience
                  <Text style={styles.sectionKeyword}> = </Text>
                  <Text style={styles.sectionBracket}>[</Text>
                </Text>

                {sortedExperience.map((exp, index) => (
                  <View
                    key={exp.id}
                    wrap={false}
                    style={[
                      styles.experienceItem,
                      index === 0
                        ? styles.experienceActive
                        : styles.experienceInactive,
                    ]}
                  >
                    <View style={styles.experienceHeader}>
                      <View>
                        <Text style={styles.experienceTitle}>
                          {exp.position}
                        </Text>
                        <View style={styles.experienceMeta}>
                          <Text style={styles.experienceCompanyAt}>@</Text>
                          <Text style={styles.experienceCompany}>
                            {exp.company}
                          </Text>
                          {exp.location && (
                            <Text style={styles.experienceLocation}>
                              {" "}
                              • {exp.location}
                            </Text>
                          )}
                        </View>
                      </View>
                      <Text style={styles.experienceDate}>
                        {formatDate(exp.startDate)} →{" "}
                        {exp.current ? "now" : formatDate(exp.endDate || "")}
                      </Text>
                    </View>

                    {exp.description.length > 0 && (
                      <View style={styles.bulletList}>
                        {exp.description.map(
                          (item, idx) =>
                            item.trim() && (
                              <View key={idx} style={styles.bulletItem}>
                                <Text style={styles.bulletArrow}>→</Text>
                                <Text style={styles.bulletText}>{item}</Text>
                              </View>
                            )
                        )}
                      </View>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <View style={styles.achievementsBox}>
                        <Text style={styles.achievementsComment}>
                          // Key achievements
                        </Text>
                        {exp.achievements.map(
                          (achievement, idx) =>
                            achievement.trim() && (
                              <View key={idx} style={styles.achievementItem}>
                                <Text style={styles.achievementCheck}>✓</Text>
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
                <Text style={styles.closingBracket}>];</Text>
              </View>
            )}

            {/* Projects */}
            {projects && projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>
                  <Text style={styles.sectionKeyword}>const </Text>
                  projects
                  <Text style={styles.sectionKeyword}> = </Text>
                  <Text style={styles.sectionBracket}>[</Text>
                </Text>

                <View style={styles.projectsGrid}>
                  {projects.map((project) => (
                    <View key={project.id} wrap={false} style={styles.projectCard}>
                      <View style={styles.projectHeader}>
                        <Text style={styles.projectBracket}>{"{"}</Text>
                        <Text style={styles.projectName}>{project.name}</Text>
                        <Text style={styles.projectBracket}>{"}"}</Text>
                      </View>
                      <Text style={styles.projectDesc}>
                        {project.description}
                      </Text>
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <View style={styles.projectTechWrap}>
                            {project.technologies.map((tech, i) => (
                              <Text key={i} style={styles.projectTech}>
                                {tech}
                              </Text>
                            ))}
                          </View>
                        )}
                    </View>
                  ))}
                </View>
                <Text style={styles.closingBracket}>];</Text>
              </View>
            )}

            {/* Education */}
            {sortedEducation.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>
                  <Text style={styles.sectionKeyword}>const </Text>
                  education
                  <Text style={styles.sectionKeyword}> = </Text>
                  <Text style={styles.sectionBracket}>[</Text>
                </Text>

                {sortedEducation.map((edu) => (
                  <View key={edu.id} wrap={false} style={styles.educationItem}>
                    <Text style={styles.educationDegree}>
                      {edu.degree}
                      {edu.field && (
                        <>
                          <Text style={styles.educationFieldText}> in </Text>
                          <Text style={styles.educationField}>{edu.field}</Text>
                        </>
                      )}
                    </Text>
                    <View style={styles.educationMeta}>
                      <Text style={styles.educationInstitution}>
                        {edu.institution}
                      </Text>
                      <Text style={styles.educationDate}>
                        {" "}
                        • {formatDate(edu.startDate)} →{" "}
                        {edu.current ? "now" : formatDate(edu.endDate || "")}
                      </Text>
                    </View>
                    {edu.gpa && (
                      <Text style={styles.educationGPA}>GPA: {edu.gpa}</Text>
                    )}
                  </View>
                ))}
                <Text style={styles.closingBracket}>];</Text>
              </View>
            )}

            {/* Certifications */}
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
                <View style={styles.section}>
                  <Text style={styles.sectionHeader}>
                    <Text style={styles.sectionKeyword}>// </Text>
                    Certifications
                  </Text>

                  <View style={styles.certificationsGrid}>
                    {allItems.map((item) => (
                      <View key={item.id} style={styles.certCard}>
                        <Text style={styles.certName}>{item.name}</Text>
                        {item.institution && (
                          <Text style={styles.certInstitution}>
                            @ {item.institution}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}
          </View>
        </View>

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
