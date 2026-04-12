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

    // Growth loop: public sharing + JD-tailoring turned ON for V1 to enable
    // viral distribution ("Built with ResumeZeus" footer on every shared link)
    // and the tailor-to-JD AI feature that differentiates from Zety/Resume.io.
    jdContext: true,
    tailorResume: true,
    publicSharing: true,

    // Deferred for V1 (hidden, not deleted)
    exportDocx: false,
    resumeOptimize: false,
    interviewPrep: false,
    batchEnhance: false,
    analytics: false,
    linkedinTools: false,
    jobTracker: false,

    // AI operation-level controls
    aiGenerateBullets: true,
    aiGenerateSummary: true,
    aiImproveBullet: true,
    aiGenerateCoverLetter: true, // kept with cover letter flow
    aiAnalyzeAts: true,
    atsScorePanel: true,
    aiAnalyzeText: false,
    aiGenerateImprovement: false,
    aiGhostSuggest: false,
    aiQuantifyAchievement: false,
    aiScoreResume: true,
    aiSuggestSkills: false,
  },
} as const;

export type LaunchFeatureKey = keyof typeof launchFlags.features;

export function isLaunchFeatureEnabled(feature: LaunchFeatureKey): boolean {
  return launchFlags.features[feature];
}
