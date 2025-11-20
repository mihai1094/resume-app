import mammoth from "mammoth";
import { ResumeData } from "@/lib/types/resume";

// Lazy load pdfjs-dist to avoid SSR issues
let pdfjsLib: any = null;

async function getPdfJs() {
  if (!pdfjsLib && typeof window !== "undefined") {
    pdfjsLib = await import("pdfjs-dist");
    // Use worker from public directory
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  return pdfjsLib;
}

export interface ParsedCV {
  text: string;
  data: Partial<ResumeData>;
  confidence: number; // 0-100
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await getPdfJs();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}

/**
 * Extract text from DOCX file
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract text from uploaded CV file
 */
export async function extractTextFromCV(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return extractTextFromPDF(file);
  } else if (
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  ) {
    return extractTextFromDOCX(file);
  } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
    return file.text();
  } else {
    throw new Error("Unsupported file format. Please upload PDF, DOCX, or TXT file.");
  }
}

/**
 * Parse CV text and extract structured data
 */
export function parseCV(text: string): ParsedCV {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  const data: Partial<ResumeData> = {
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
    },
    workExperience: [],
    education: [],
    skills: [],
    languages: [],
  };

  let confidence = 0;
  let detectedSections = 0;

  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails && emails[0]) {
    data.personalInfo!.email = emails[0];
    confidence += 15;
    detectedSections++;
  }

  // Extract phone (including international formats)
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{3,4}/g;
  const phones = text.match(phoneRegex);
  if (phones && phones[0]) {
    data.personalInfo!.phone = phones[0].replace(/\s+/g, ' ').trim();
    confidence += 10;
  }

  // Extract location (common format: "City, Country")
  const locationRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/;
  const locationMatches = text.match(locationRegex);
  if (locationMatches && !data.personalInfo!.location) {
    // Use the first reasonable location found (avoid matching dates or other text)
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const match = lines[i].match(locationRegex);
      if (match && !match[0].includes('@') && match[0].length < 50) {
        data.personalInfo!.location = match[0];
        break;
      }
    }
  }

  // Extract LinkedIn
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) {
    data.personalInfo!.linkedin = `linkedin.com/in/${linkedinMatch[1]}`;
    confidence += 5;
  }

  // Extract GitHub
  const githubRegex = /github\.com\/([a-zA-Z0-9-]+)/i;
  const githubMatch = text.match(githubRegex);
  if (githubMatch) {
    data.personalInfo!.github = `github.com/${githubMatch[1]}`;
    confidence += 5;
  }

  // Extract name (usually in first few lines)
  const nameRegex = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();

    // Check for typical name format (First Last or First Middle Last)
    if (line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/) && line.length < 50) {
      const nameParts = line.split(/\s+/);
      data.personalInfo!.firstName = nameParts[0];
      data.personalInfo!.lastName = nameParts.slice(1).join(" ");
      confidence += 20;
      detectedSections++;

      // Check next line for title/position
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.length > 10 && nextLine.length < 150 && !nextLine.includes('@')) {
          data.personalInfo!.summary = nextLine;
        }
      }
      break;
    }
  }

  // Extract summary section
  const summaryRegex = /^summary$/i;
  const summaryIndex = lines.findIndex((line) => summaryRegex.test(line.trim()));
  if (summaryIndex !== -1 && summaryIndex + 1 < lines.length) {
    const summaryText = [];
    for (let i = summaryIndex + 1; i < Math.min(summaryIndex + 5, lines.length); i++) {
      const line = lines[i].trim();
      if (!line || line.match(/^(experience|education|skills)/i)) break;
      summaryText.push(line);
    }
    if (summaryText.length > 0 && !data.personalInfo!.summary) {
      data.personalInfo!.summary = summaryText.join(" ");
    }
  }

  // Try to extract skills
  const skillSectionRegex = /^(top\s+)?skills?$|^technical skills?$|^competencies$|^expertise$/i;
  const skillSectionIndex = lines.findIndex((line) => skillSectionRegex.test(line.trim()));

  if (skillSectionIndex !== -1) {
    // Extract skills from the next lines until we hit another section
    const skillLines = [];
    for (let i = skillSectionIndex + 1; i < Math.min(skillSectionIndex + 20, lines.length); i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.match(/^(experience|education|summary|contact)/i)) break;

      // This line is likely a skill
      if (line.length < 50 && !line.includes('@') && !line.match(/\d{4}/)) {
        skillLines.push(line);
      }
    }

    // Also look for common technical skills in the entire text
    const skillKeywords = [
      "JavaScript", "TypeScript", "Python", "Java", "C\\+\\+", "C#", "PHP", "Ruby", "Go", "Swift", "Kotlin",
      "React", "Angular", "Vue", "Node\\.js", "Express", "Django", "Flask", "Spring", "Next\\.js",
      "HTML", "CSS", "Tailwind", "Bootstrap", "Sass", "SCSS",
      "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Oracle",
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins",
      "Git", "CI/CD", "Agile", "Scrum", "REST", "GraphQL", "API",
      "Integration", "Middleware", "SOAP", "IBM", "SAP",
    ];

    const skillsText = lines.slice(skillSectionIndex, skillSectionIndex + 20).join(" ");
    const foundSkills = new Set<string>();

    // Add skills from dedicated skill lines
    skillLines.forEach((skill) => {
      foundSkills.add(skill);
    });

    // Add technical keywords found in text
    skillKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(skillsText)) {
        const cleanKeyword = keyword.replace(/\\\+\\/g, "+").replace(/\\\\./g, ".");
        foundSkills.add(cleanKeyword);
      }
    });

    if (foundSkills.size > 0) {
      data.skills = Array.from(foundSkills).map((skill, index) => ({
        id: `skill-${index + 1}`,
        name: skill,
        category: "Technical",
        level: "intermediate" as const,
      }));
      confidence += 15;
      detectedSections++;
    }
  }

  // Find section boundaries
  const experienceSectionRegex = /^(work\s+)?experience|employment|professional\s+experience|work\s+history$/i;
  const educationSectionRegex = /^education|academic\s+background|qualifications$/i;

  const experienceIndex = lines.findIndex((line) => experienceSectionRegex.test(line.trim()));
  const educationIndex = lines.findIndex((line) => educationSectionRegex.test(line.trim()));

  // Determine section boundaries
  let experienceEndIndex = educationIndex !== -1 ? educationIndex : lines.length;
  let educationEndIndex = lines.length;

  // If education comes before experience (unusual but possible)
  if (educationIndex !== -1 && experienceIndex !== -1 && educationIndex < experienceIndex) {
    educationEndIndex = experienceIndex;
    experienceEndIndex = lines.length;
  }

  // Try to extract work experience
  if (experienceIndex !== -1) {
    const experienceLines = lines.slice(experienceIndex + 1, experienceEndIndex);

    // LinkedIn format: "Month Year - Month Year (duration)" or "Month Year - Present"
    const linkedinDateRegex = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\s*[-–—]\s*(january|february|march|april|may|june|july|august|september|october|november|december)?\s*(\d{4}|present|current)/i;
    const dateRangeRegex = /\b(20\d{2}|19\d{2})\s*[-–—]\s*(20\d{2}|19\d{2}|present|current)/i;
    const singleDateRegex = /\b(20\d{2}|19\d{2})\b/;

    let currentExperience: any = null;
    let linesSinceLastEntry = 0;
    let lastWasDate = false;

    experienceLines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      linesSinceLastEntry++;

      // Check if this line contains a date range
      const hasDate = linkedinDateRegex.test(trimmedLine) || dateRangeRegex.test(trimmedLine) ||
                     (singleDateRegex.test(trimmedLine) && trimmedLine.length < 100);

      if (hasDate) {
        // Save previous experience
        if (currentExperience && (currentExperience.company || currentExperience.position)) {
          data.workExperience!.push(currentExperience);
        }

        currentExperience = {
          id: `work-${data.workExperience!.length + 1}`,
          company: "",
          position: "",
          location: "",
          startDate: "",
          current: trimmedLine.toLowerCase().includes("present") || trimmedLine.toLowerCase().includes("current"),
          description: [],
        };

        // Extract location if present (usually after date in parentheses or on same line)
        const locationMatch = trimmedLine.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z][a-z]+)\s*$/);
        if (locationMatch) {
          currentExperience.location = locationMatch[1];
        }

        // Look back for position (1 line back) and company (2 lines back)
        if (index > 0) {
          const prevLine = experienceLines[index - 1]?.trim();
          if (prevLine && prevLine.length > 0 && prevLine.length < 150 && !prevLine.includes('@')) {
            currentExperience.position = prevLine;
          }
        }
        if (index > 1) {
          const prevPrevLine = experienceLines[index - 2]?.trim();
          if (prevPrevLine && prevPrevLine.length > 0 && prevPrevLine.length < 100 && !prevPrevLine.includes('@')) {
            currentExperience.company = prevPrevLine;
          }
        }

        linesSinceLastEntry = 0;
        lastWasDate = true;
      } else if (lastWasDate && trimmedLine.match(/^[A-Z][a-z]+,?\s+[A-Z][a-z]+/)) {
        // This might be location (e.g., "Bucharest, Romania")
        if (currentExperience && !currentExperience.location) {
          currentExperience.location = trimmedLine;
        }
        lastWasDate = false;
      } else if (currentExperience) {
        lastWasDate = false;

        // Check if it's a bullet point or description
        if (trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
          currentExperience.description.push(trimmedLine.replace(/^[•\-*]\s*/, "").trim());
        } else if (trimmedLine.length > 20 && !trimmedLine.match(/^\d+\s+(year|month)/i)) {
          // Long line that's not a duration - likely a description paragraph
          currentExperience.description.push(trimmedLine);
        } else if (!currentExperience.company && trimmedLine.length < 100 && linesSinceLastEntry < 4) {
          // Might be company name
          currentExperience.company = trimmedLine;
        }
      }
    });

    // Add the last experience
    if (currentExperience && (currentExperience.company || currentExperience.position)) {
      data.workExperience!.push(currentExperience);
    }

    if (data.workExperience!.length > 0) {
      confidence += 20;
      detectedSections++;
    }
  }

  // Try to extract education
  if (educationIndex !== -1) {
    const educationLines = lines.slice(educationIndex + 1, educationEndIndex);

    const dateRegex = /\b(20\d{2}|19\d{2})\b/;
    const degreeRegex = /\b(bachelor|master|phd|doctorate|associate|diploma|degree|B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|BSc|MSc|BA|MA|PhD)/i;

    let currentEducation: any = null;

    educationLines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines and bullet points
      if (!trimmedLine || trimmedLine.startsWith("•") || trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
        return;
      }

      // Check if line contains degree or date
      if (degreeRegex.test(trimmedLine) || dateRegex.test(trimmedLine)) {
        // Save previous education
        if (currentEducation && currentEducation.institution) {
          data.education!.push(currentEducation);
        }

        currentEducation = {
          id: `edu-${data.education!.length + 1}`,
          institution: "",
          degree: "",
          field: "",
          location: "",
          startDate: "",
          current: false,
        };

        // If line has degree keywords
        if (degreeRegex.test(trimmedLine)) {
          currentEducation.degree = trimmedLine;

          // Look for institution in next few lines
          if (index + 1 < educationLines.length) {
            const nextLine = educationLines[index + 1].trim();
            if (nextLine && !dateRegex.test(nextLine) && !degreeRegex.test(nextLine)) {
              currentEducation.institution = nextLine;
            }
          }
        }

        // If line has date
        if (dateRegex.test(trimmedLine) && trimmedLine.length < 50) {
          // Look back for institution and degree
          if (index > 0) {
            const prevLine = educationLines[index - 1].trim();
            if (prevLine) {
              currentEducation.institution = prevLine;
            }
          }
          if (index > 1) {
            const prevPrevLine = educationLines[index - 2].trim();
            if (prevPrevLine && degreeRegex.test(prevPrevLine)) {
              currentEducation.degree = prevPrevLine;
            }
          }
        }
      }
    });

    // Add the last education
    if (currentEducation && currentEducation.institution) {
      data.education!.push(currentEducation);
    }

    if (data.education!.length > 0) {
      confidence += 15;
      detectedSections++;
    }
  }

  return {
    text,
    data,
    confidence: Math.min(100, confidence),
  };
}

/**
 * Import CV from file and parse it
 */
export async function importCV(file: File): Promise<ParsedCV> {
  try {
    const text = await extractTextFromCV(file);
    const parsed = parseCV(text);
    return parsed;
  } catch (error) {
    console.error("Failed to import CV:", error);
    throw error;
  }
}
