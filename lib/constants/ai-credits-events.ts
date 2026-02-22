export const AI_CREDITS_UPDATED_EVENT = "ai-credits-updated";

export const AI_CREDITS_HEADERS = {
  updated: "x-ai-credits-updated",
  used: "x-ai-credits-used",
  remaining: "x-ai-credits-remaining",
  resetDate: "x-ai-credits-reset-date",
  isPremium: "x-ai-credits-is-premium",
} as const;

export interface AICreditsUpdateDetail {
  creditsUsed?: number;
  creditsRemaining?: number;
  resetDate?: string;
  isPremium?: boolean;
}
