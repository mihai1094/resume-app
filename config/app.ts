/**
 * Application-wide configuration
 */
export const appConfig = {
  name: "ResumeForge",
  version: "1.0.0",
  description: "Forge Your Future - Create professional resumes in minutes",
  author: "ResumeForge Team",

  // Feature flags
  features: {
    aiSuggestions: false, // V2 feature
    pdfExport: false, // V1 feature
    cloudSync: false, // V2 feature
    multipleResumes: false, // V1 feature
  },

  // UI Configuration
  ui: {
    defaultTheme: "light" as const,
    sidebarCollapsedByDefault: false,
    previewVisibleByDefault: true,
  },

  // URLs
  urls: {
    homepage: "/",
    create: "/create",
    preview: "/preview",
    github: "https://github.com/your-repo",
    twitter: "https://twitter.com/your-account",
  },
} as const;

