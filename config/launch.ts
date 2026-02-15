/**
 * V1 launch controls.
 * Keep deferred features in code, but hide/disable them in production UI flows.
 */
export const launchFlags = {
  features: {
    // Core V1
    resumeEditor: true,
    saveSync: true,
    aiBasic: true,
    exportPdf: true,
    exportJson: true,

    // Explicitly kept for now per product decision
    coverLetter: true,
    allTemplates: true,

    // Deferred for V1 (hidden, not deleted)
    exportDocx: false,
    resumeOptimize: false,
    interviewPrep: false,
    batchEnhance: false,
    tailorResume: false,
    publicSharing: false,
    analytics: false,
    linkedinTools: false,
    jobTracker: false,

    // AI operation-level controls
    aiGenerateBullets: true,
    aiGenerateSummary: true,
    aiImproveBullet: true,
    aiGenerateCoverLetter: true, // kept with cover letter flow
    aiAnalyzeAts: false,
    aiAnalyzeText: false,
    aiGenerateImprovement: false,
    aiGhostSuggest: false,
    aiQuantifyAchievement: false,
    aiScoreResume: false,
    aiSuggestSkills: false,
  },
} as const;

export type LaunchFeatureKey = keyof typeof launchFlags.features;

export function isLaunchFeatureEnabled(feature: LaunchFeatureKey): boolean {
  return launchFlags.features[feature];
}
