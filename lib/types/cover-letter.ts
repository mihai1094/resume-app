// Cover Letter data types

export interface CoverLetterRecipient {
  name?: string;
  title?: string;
  company: string;
  department?: string;
  address?: string;
}

export interface CoverLetterData {
  id: string;
  // Metadata
  jobTitle: string;
  jobReference?: string;
  date: string;

  // Recipient information
  recipient: CoverLetterRecipient;

  // Sender information (pulled from PersonalInfo but can override)
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderLocation: string;
  senderLinkedin?: string;
  senderWebsite?: string;

  // Letter content
  salutation: string; // "Dear Hiring Manager," or "Dear Mr. Smith,"
  openingParagraph: string; // Hook + why you're applying
  bodyParagraphs: string[]; // Your qualifications, experience highlights
  closingParagraph: string; // Call to action, enthusiasm
  signOff: string; // "Sincerely," "Best regards," etc.

  // Customization
  templateId: CoverLetterTemplateId;
  tone?: "professional" | "enthusiastic" | "creative" | "formal";

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export type CoverLetterTemplateId = "modern" | "classic" | "minimalist" | "executive";

export interface CoverLetterTemplate {
  id: CoverLetterTemplateId;
  name: string;
  description: string;
  preview: string;
}

export interface SavedCoverLetter {
  id: string;
  name: string;
  jobTitle?: string;
  companyName?: string;
  data: CoverLetterData;
  createdAt: string;
  updatedAt: string;
}

// Default values
export const DEFAULT_COVER_LETTER: Omit<CoverLetterData, "id" | "createdAt" | "updatedAt"> = {
  jobTitle: "",
  jobReference: "",
  date: new Date().toISOString().split("T")[0],
  recipient: {
    name: "",
    title: "",
    company: "",
    department: "",
    address: "",
  },
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  senderLocation: "",
  senderLinkedin: "",
  senderWebsite: "",
  salutation: "Dear Hiring Manager,",
  openingParagraph: "",
  bodyParagraphs: ["", ""],
  closingParagraph: "",
  signOff: "Sincerely,",
  templateId: "modern",
  tone: "professional",
};

export const SALUTATION_OPTIONS = [
  "Dear Hiring Manager,",
  "Dear Recruiting Team,",
  "To Whom It May Concern,",
  "Hello,",
  "Dear Sir/Madam,",
];

export const SIGN_OFF_OPTIONS = [
  "Sincerely,",
  "Best regards,",
  "Kind regards,",
  "Warm regards,",
  "Respectfully,",
  "Thank you,",
  "With appreciation,",
];

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean, contemporary design with subtle accents",
    preview: "/images/templates/cover-letter-modern.png",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional business letter format",
    preview: "/images/templates/cover-letter-classic.png",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple and elegant with generous whitespace",
    preview: "/images/templates/cover-letter-minimalist.png",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Refined design for senior positions",
    preview: "/images/templates/cover-letter-executive.png",
  },
];









