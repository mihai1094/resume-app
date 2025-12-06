import { ResumeData, WorkExperience, Education, Skill } from "@/lib/types/resume";
import { generateId } from "@/lib/utils";

export async function parseLinkedInPDF(file: File): Promise<Partial<ResumeData>> {
    try {
        const text = await extractTextFromPDF(file);
        console.log("=== EXTRACTED PDF TEXT ===");
        console.log(text);
        console.log("=== END EXTRACTED TEXT ===");
        const result = parseLinkedInText(text);
        console.log("=== PARSED RESULT ===");
        console.log(JSON.stringify(result, null, 2));
        console.log("=== END PARSED RESULT ===");
        return result;
    } catch (error) {
        console.error("PDF Parse Error Details:", error);
        // Propagate the actual error message to the UI
        throw new Error(error instanceof Error ? error.message : "Failed to parse PDF content");
    }
}

async function extractTextFromPDF(file: File): Promise<string> {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import("pdfjs-dist");

    // Debug logging
    console.log("PDFJS Version:", pdfjsLib.version);

    // Set worker source using unpkg for better reliability with specific versions
    if (typeof window !== 'undefined' && 'Worker' in window) {
        // Use the version from the imported library to ensure exact match
        // This prevents "API version does not match Worker version" errors
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    }

    const arrayBuffer = await file.arrayBuffer();

    try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;

        let fullText = "";

        // LinkedIn PDFs are usually simple text streams.
        // We extract text page by page.
        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const textContent = await page.getTextContent();

            // Group items by Y position to preserve line breaks
            let lastY = 0;
            let pageText = "";

            textContent.items.forEach((item: any, index: number) => {
                // If Y position changes significantly, treat as new line
                if (lastY && Math.abs(item.y - lastY) > 5) {
                    pageText += "\n";
                }
                pageText += item.str;
                lastY = item.y;
            });

            fullText += pageText + "\n";
        }

        return fullText;
    } catch (e) {
        console.error("Core PDFJS extraction error:", e);
        throw new Error("Could not read PDF structure. Is it a valid PDF?");
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

    console.log("=== PARSED LINES ===");
    console.log(`Total lines: ${lines.length}`);
    lines.forEach((line, i) => console.log(`[${i}] ${line}`));
    console.log("=== END LINES ===");

    // Simple state machine
    let currentSection: "none" | "experience" | "education" | "skills" | "summary" = "none";

    // Regex for sections (English & Romanian support)
    const SECTION_HEADERS = {
        experience: /^(Experience|Experiență|Experienta|Experiență de lucru)$/i,
        education: /^(Education|Educație|Educatie|Educațional)$/i,
        skills: /^(Top Skills|Skills|Aptitudini principale|Competențe|Competente|Skill-uri)$/i,
        summary: /^(Summary|Rezumat|Descriere)$/i,
        languages: /^(Languages|Limbi|Limbile)$/i,
        certifications: /^(Certifications|Certificări|Certificari)$/i,
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Detect Name (usually first line if valid)
        if (i === 0 && !data.personalInfo?.firstName) {
            // Assume first line is Name
            const parts = line.split(" ");
            if (parts.length >= 2) {
                data.personalInfo!.firstName = parts[0];
                data.personalInfo!.lastName = parts.slice(1).join(" ");
                continue;
            }
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

            // Date regex (e.g., "Jan 2020 - Present", "ianuarie 2024 - Prezent")
            // Supports both English and Romanian month names
            const dateRangeRegex = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Ian|Iun|Iul|Noi|ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)[a-z]*\.?\s+\d{4})\s*-\s*(Present|Prezent|Current|(?:Ian|Iun|Iul|Noi|ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)[a-z]*\.?\s+\d{4})/i;

            if (dateRangeRegex.test(line)) {
                // If we found a date line, the PREVIOUS line was likely the Role/Company context
                // and the line BEFORE that might be the Company.
                // This is "reverse lookahead" logic which is tricky in a loop.

                // Simpler approach: If we see a date, close previous exp and start new? 
                // Or assume this line IS the date for the *current* extracted block.

                const match = line.match(dateRangeRegex);
                if (match && data.workExperience) {
                    // Creating a generic entry for the block found "around" this date
                    // We look back to find the Role and Company
                    let role = lines[i - 1] || "Unknown Role";
                    let company = lines[i - 2] || "Unknown Company";

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
                let degree = lines[i - 1] || "Degree";
                let school = lines[i - 2] || "University";

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
