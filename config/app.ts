/**
 * Application-wide configuration
 */
export const appConfig = {
  name: "ResumeForge",
  version: "1.0.0",
  description: "Forge Your Future - Create professional resumes in minutes",
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
  supportEmail: "support@resumeforge.app",

  // Company legal info (Romania) - update before launch
  company: {
    legalName: "AXTECH SRL", // TODO: complete legal name
    cui: "ROXXXXXXXX", // TODO: CUI fiscal
    regCom: "JXX/XXXX/XXXX", // TODO: Nr. Registrul Comerțului
    address: "Str. Exemplu nr. 1, Oraș, Județ, România", // TODO: sediu social
    email: "contact@resumeforge.app", // TODO: email oficial
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
