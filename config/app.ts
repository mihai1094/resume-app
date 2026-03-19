/**
 * Application-wide configuration
 */
export const appConfig = {
  name: "ResumeZeus",
  version: "1.0.0",
  description:
    "Free resume builder with PDF export and 30 AI credits at signup. Create an account, build ATS-friendly resumes, and export polished PDFs in minutes.",
  author: "AXTECH",

  // Feature flags - reflects actual implemented features
  features: {
    aiSuggestions: false, // V2 feature - not yet implemented
    pdfExport: true, // Implemented via @react-pdf/renderer
    cloudSync: false, // V2 feature - not yet implemented
    multipleResumes: true, // Implemented - users can save multiple resumes
    jsonExport: true, // Implemented
    jsonImport: true, // Implemented
    docxExport: false, // Hidden for V1 launch (code retained)
  },

  // UI Configuration
  ui: {
    defaultTheme: "light" as const,
    sidebarCollapsedByDefault: false,
    previewVisibleByDefault: true,
  },

  // Contact
  supportEmail: "support@resumezeus.app",

  // Company legal info (Romania) - update before launch
  company: {
    legalName: "AXTECH CONSULTING S.R.L.",
    cui: "RO47850911",
    regCom: "J40/5474/21.03.2023",
    address: "București Sectorul 4, Strada Cap. Marin Grigore nr. 18, Parter, Bloc 4, Scara 1, Ap. 7",
    email: "axtech.feedback@gmail.com",
  },

  // URLs
  urls: {
    homepage: "/",
    create: "/editor/new",
    preview: "/preview",
    myResumes: "/dashboard",
    github: "",
    twitter: "",
  },
} as const;
