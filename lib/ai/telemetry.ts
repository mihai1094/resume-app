export type AiEventName =
  | "trigger"
  | "success"
  | "failure"
  | "apply"
  | "undo";

export type AiTelemetryPayload = {
  surface: string;
  action: string;
  durationMs?: number;
  error?: string;
  meta?: Record<string, unknown>;
};

/**
 * Lightweight, optional telemetry hook.
 * Falls back to console.debug when no analytics client is present.
 */
export function trackAiEvent(event: AiEventName, payload: AiTelemetryPayload) {
  const safePayload = {
    event,
    ...payload,
  };

  try {
    // Provide a single place to integrate analytics (Plausible, PostHog, etc.)
    if (typeof window !== "undefined" && (window as any).analytics?.track) {
      (window as any).analytics.track(`ai:${event}`, safePayload);
      return;
    }

    if (typeof window !== "undefined" && (window as any).plausible) {
      (window as any).plausible(`ai:${event}`, { props: safePayload });
      return;
    }
  } catch {
    // Ignore analytics errors
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[ai-telemetry]", safePayload);
  }
}

