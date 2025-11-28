/**
 * Application-wide configuration
 */
export const appConfig = {
  name: "ResumeForge",
  version: "1.0.0",
  description: "Forge Your Future - Create professional resumes in minutes",
  author: "ResumeForge Team",

  // Feature flags - reflects actual implemented features
  features: {
    aiSuggestions: false, // V2 feature - not yet implemented
    pdfExport: true, // Implemented via @react-pdf/renderer
    cloudSync: false, // V2 feature - not yet implemented
    multipleResumes: true, // Implemented - users can save multiple resumes
    jsonExport: true, // Implemented
    jsonImport: true, // Implemented
    linkedInImport: false, // V2 feature - not yet implemented
    docxExport: false, // Not yet implemented
  },

  // UI Configuration
  ui: {
    defaultTheme: "light" as const,
    sidebarCollapsedByDefault: false,
    previewVisibleByDefault: true,
  },

  // Contact
  supportEmail: "support@resumeforge.app",

  // URLs
  urls: {
    homepage: "/",
    create: "/editor/new",
    preview: "/preview",
    myResumes: "/dashboard",
    github: "https://github.com/your-repo",
    twitter: "https://twitter.com/your-account",
  },
} as const;
