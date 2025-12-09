/**
 * Storage configuration
 */
export const storageConfig = {
  // LocalStorage keys
  keys: {
    resumeData: "resume-data",
    coverLetterData: "cover-letter-data",
    userPreferences: "user-preferences",
    recentTemplates: "recent-templates",
    savedCoverLetters: "saved-cover-letters",
    aiPreferences: "ai-preferences",
  },

  // Auto-save configuration
  autoSave: {
    enabled: true,
    debounceMs: 500, // Wait 500ms after last change before saving
  },

  // Data versioning for migrations
  version: 1,

  // TTL (Time To Live) in days
  ttl: {
    resumeData: 365, // 1 year
    coverLetterData: 365, // 1 year
    recentTemplates: 30, // 30 days
    savedCoverLetters: 365, // 1 year
  },
} as const;

