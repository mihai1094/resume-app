/**
 * Storage configuration for localStorage (non-critical data only)
 *
 * Note: Resume and cover letter data is stored in Firestore, not localStorage.
 * This config is only for local preferences and temporary editor state.
 */
export const storageConfig = {
  // LocalStorage keys (for local preferences only)
  keys: {
    coverLetterDraft: "cover-letter-draft", // Temporary draft before saving to Firestore
    aiPreferences: "ai-preferences", // User's AI feature preferences
  },

  // Auto-save configuration for localStorage
  autoSave: {
    debounceMs: 500, // Wait 500ms after last change before saving
  },
} as const;

