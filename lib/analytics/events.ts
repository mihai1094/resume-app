"use client";

import posthog from "posthog-js";

/**
 * Typed product analytics event catalog.
 *
 * Every event fires through `capture(eventName, props)` which is a safe no-op
 * if PostHog hasn't been initialized (no consent, no key, SSR, etc). This keeps
 * call sites dead simple — just call `capture("template_picked", { ... })` anywhere.
 *
 * Adding a new event: add a new entry to ProductEvent and the matching props type.
 */

export type ProductEvent =
  | "signup_completed"
  | "login_completed"
  | "template_picked"
  | "editor_opened"
  | "bullet_generated"
  | "summary_generated"
  | "resume_saved"
  | "pdf_exported"
  | "public_share_created"
  | "upgrade_cta_clicked";

type EventPropsMap = {
  signup_completed: { method: "email" | "google" };
  login_completed: { method: "email" | "google" };
  template_picked: {
    templateId: string;
    colorId: string;
    source: "gallery" | "quick_start" | "onboarding";
  };
  editor_opened: {
    templateId?: string;
    isResume: boolean;
    continueDraft: boolean;
  };
  bullet_generated: { source: string; creditCost: number };
  summary_generated: { source: string; creditCost: number };
  resume_saved: {
    resumeId: string;
    sectionsCount: number;
    hasPhoto: boolean;
  };
  pdf_exported: { templateId?: string; pagesCount?: number };
  public_share_created: {
    resumeId: string;
    username: string;
    slug: string;
  };
  upgrade_cta_clicked: { tier: string };
};

const isBrowser = () => typeof window !== "undefined";

/**
 * Safe event capture. Does nothing on the server or when PostHog hasn't been
 * initialized (no consent granted, no env key). Never throws.
 */
export function capture<E extends ProductEvent>(
  event: E,
  props: EventPropsMap[E]
): void {
  if (!isBrowser()) return;
  try {
    // posthog.capture is a no-op if not initialized — no need to guard on
    // `posthog.__loaded` or similar. Wrapped in try/catch defensively.
    posthog.capture(event, props as Record<string, unknown>);
  } catch {
    // Swallow — analytics should never break the UX.
  }
}

/**
 * Identify a user after auth. Email is hashed (SHA-256 truncated) so PostHog
 * never sees raw PII. Plan and createdAt are safe to send.
 */
export async function identifyUser(
  userId: string,
  props: { plan?: string; createdAt?: string; email?: string } = {}
): Promise<void> {
  if (!isBrowser()) return;
  try {
    const { email, ...rest } = props;
    const payload: Record<string, unknown> = { ...rest };

    if (email && typeof crypto?.subtle?.digest === "function") {
      const encoder = new TextEncoder();
      const digest = await crypto.subtle.digest(
        "SHA-256",
        encoder.encode(email.toLowerCase())
      );
      payload.email_hash = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 16);
    }

    posthog.identify(userId, payload);
  } catch {
    // noop
  }
}

/**
 * Reset the PostHog distinct_id on logout so subsequent events are anonymous.
 */
export function resetIdentity(): void {
  if (!isBrowser()) return;
  try {
    posthog.reset();
  } catch {
    // noop
  }
}
