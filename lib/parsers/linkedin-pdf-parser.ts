import { ResumeData } from "@/lib/types/resume";
import { generateId } from "@/lib/utils";
import { extractText } from "unpdf";

export async function parseLinkedInPDF(file: File): Promise<Partial<ResumeData>> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const extracted = await extractText(uint8Array);

        // Handle different return types from unpdf
        let text = '';
        if (typeof extracted === 'string') {
            text = extracted;
        } else if (extracted && typeof extracted === 'object') {
            // unpdf returns { totalPages, text: string[] }
            if (Array.isArray(extracted.text)) {
                text = extracted.text.join('\n');
            } else if (typeof extracted.text === 'string') {
                text = extracted.text;
            } else {
                // Try other possible property names
                text = (extracted as any).content || (extracted as any).data || '';
                if (typeof text !== 'string') {
                    text = JSON.stringify(extracted);
                }
            }
        } else {
            text = String(extracted || '');
        }

        // Ensure text is always a string before calling split()
        if (typeof text !== 'string') {
            text = String(text);
        }

        const result = parseLinkedInText(text);
        return result;
    } catch (error) {
        console.error("PDF Parse Error Details:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to parse PDF content");
    }
}

function parseLinkedInText(text: string): Partial<ResumeData> {
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
    };

    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);

    // Remove "Page X of Y" lines
    const cleanLines = lines.filter(l => !l.match(/^Page \d+ of \d+$/i));

    // Simple state machine
    let currentSection: "none" | "experience" | "education" | "skills" | "summary" = "none";

    // Regex for sections (English & Romanian support)
    const SECTION_HEADERS = {
        experience: /^(Experience|Experiență|Experienta|Experiență de lucru|Experiență)$/i,
        education: /^(Education|Educație|Educatie|Educațional|Studii)$/i,
        skills: /^(Top Skills|Skills|Aptitudini principale|Competențe|Competente|Skill-uri)$/i,
        summary: /^(Summary|Rezumat|Descriere)$/i,
        languages: /^(Languages|Limbi|Limbile)$/i,
        certifications: /^(Certifications|Certificări|Certificari)$/i,
    };

    // LinkedIn PDFs have a complex layout. The name appears before the job title line
    // Look for a capitalized proper name that appears before any title line (with | chars)
    for (let i = 0; i < cleanLines.length; i++) {
        const line = cleanLines[i];

        // Stop searching after finding the first job title line
        if (line.includes("|") && line.length > 20 && line.length < 200) {
            break;
        }

        // Look for name pattern: Capitalized words, 2+ words, not skills keywords
        if (!data.personalInfo?.firstName &&
            line.match(/^[A-Z][a-z]+(\s+[A-Z][a-z-]+)+$/) &&
            !line.includes("|") &&
            !line.includes("Quality") &&
            !line.includes("English") &&
            !line.includes("Romanian")) {
            const parts = line.split(" ");
            data.personalInfo!.firstName = parts[0];
            data.personalInfo!.lastName = parts.slice(1).join(" ");
            break;
        }
    }

    for (let i = 0; i < cleanLines.length; i++) {
        const line = cleanLines[i];

        // Detect Job Title (line that contains | separators with tech keywords)
        if (!data.personalInfo?.jobTitle && line.includes("|") && (line.length > 20 && line.length < 200)) {
            // Looks like a job title line
            data.personalInfo!.jobTitle = line.trim();
        }

        // Detect Email & LinkedIn
        if (line.includes("@") && !data.personalInfo?.email) {
            // Extract email with improved regex to handle various formats
            const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch) {
                data.personalInfo!.email = emailMatch[0];
            }
        }
        if (line.includes("linkedin.com/in") && !data.personalInfo?.linkedin) {
            // Extract full LinkedIn URL properly
            const linkedinMatch = line.match(/(linkedin\.com\/in\/[\w-]+)/);
            if (linkedinMatch) {
                data.personalInfo!.linkedin = linkedinMatch[0];
            }
        }

        // Detect Sections
        if (SECTION_HEADERS.experience.test(line)) { currentSection = "experience"; continue; }
        if (SECTION_HEADERS.education.test(line)) { currentSection = "education"; continue; }
        if (SECTION_HEADERS.skills.test(line)) { currentSection = "skills"; continue; }
        if (SECTION_HEADERS.summary.test(line)) { currentSection = "summary"; continue; }

        // reset if hitting other known sections we don't parse yet to avoid noise
        if (SECTION_HEADERS.languages.test(line) || SECTION_HEADERS.certifications.test(line)) {
            currentSection = "none";
            continue;
        }

        // Parse Content based on section
        if (currentSection === "summary") {
            data.personalInfo!.summary = (data.personalInfo!.summary || "") + (data.personalInfo!.summary ? " " : "") + line;
        }

        else if (currentSection === "skills") {
            // LinkedIn lists skills often on separate lines or bulleted
            // Check if line looks like a skill (not a page number or nonsense)
            if (line.length > 2 && !line.includes("Page") && !line.includes("Pagina")) {
                // Provide safe default for level
                data.skills?.push({
                    id: generateId(),
                    name: line.replace(/^[•\-\*]\s*/, ""), // remove bullets
                    level: "advanced", // default valid type
                    category: "General"
                });
            }
        }

        else if (currentSection === "experience") {
            // Heuristic: Company name often follows start of section or previous entry
            // This is hard to perfect without visual layout coordinates.
            // We'll create a new entry for lines that look like Companies or Roles options.
            // For MVP, we might simple act like a "blob" collector or try to detect dates.

            // Date regex (e.g., "Jan 2020 - Present", "octombrie 2024 - Present (1 an 3 luni)")
            // Supports both English and Romanian month names
            // Also handles optional duration text in parentheses
            const dateRangeRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ian|Iun|Iul|Noi|ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)[a-z]*\.?\s+\d{4})\s*[-–]\s*(Present|Prezent|Current|(?:Ian|Iun|Iul|Noi|ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)[a-z]*\.?\s+\d{4})(?:\s*\([^)]*\))?/i;

            if (dateRangeRegex.test(line)) {
                // If we found a date line, the PREVIOUS line was likely the Role/Company context
                // and the line BEFORE that might be the Company.
                const match = line.match(dateRangeRegex);
                if (match && data.workExperience) {
                    // Look back to find the Role and Company
                    // Skip empty lines
                    let roleIndex = i - 1;
                    while (roleIndex >= 0 && !cleanLines[roleIndex]) {
                        roleIndex--;
                    }

                    let companyIndex = roleIndex - 1;
                    while (companyIndex >= 0 && !cleanLines[companyIndex]) {
                        companyIndex--;
                    }

                    let role = roleIndex >= 0 ? cleanLines[roleIndex] : "Unknown Role";
                    let company = companyIndex >= 0 ? cleanLines[companyIndex] : "Unknown Company";

                    // Clean up if they are just random text or headers
                    if (SECTION_HEADERS.experience.test(company) || !company) {
                        company = role;
                        role = "Role";
                    }

                    data.workExperience.push({
                        id: generateId(),
                        company: company,
                        position: role,
                        location: "", // hard to parse reliably
                        startDate: match[1],
                        endDate: match[2],
                        current: match[2].toLowerCase().includes("present") || match[2].toLowerCase().includes("prezent"),
                        description: [],
                    });
                }
            } else if (data.workExperience && data.workExperience.length > 0) {
                // Append description to last experience
                const lastExp = data.workExperience[data.workExperience.length - 1];
                // Filter noise
                if (!line.includes("Page") && !line.includes("Pagina") && line.length > 3) {
                    lastExp.description.push(line);
                }
            }
        }

        else if (currentSection === "education") {
            // Match various date formats: "2020 - 2024", "2020 – 2024", or similar
            const dateRegex = /\d{4}\s*[-–]\s*\d{4}/;
            if (dateRegex.test(line) && data.education) {
                // Found a date line, assume previous lines were School/Degree
                let degree = cleanLines[i - 1] || "Degree";
                let school = cleanLines[i - 2] || "University";

                if (SECTION_HEADERS.education.test(school) || !school) {
                    school = degree;
                    degree = "Degree";
                }

                const dates = line.match(/(\d{4})\s*[-–]\s*(\d{4})/);
                data.education.push({
                    id: generateId(),
                    institution: school,
                    degree: degree,
                    field: "Field of Study",
                    location: "",
                    startDate: dates ? dates[1] : "",
                    endDate: dates ? dates[2] : "",
                    current: false
                });
            }
        }
    }

    return data;
}
