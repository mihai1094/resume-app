/**
 * Authenticated Fetch Utility
 * Wraps fetch to automatically include Firebase Auth token
 */

import { getFirebaseAuth } from "@/lib/firebase/config";
import { getOrCreateClientDeviceId } from "@/lib/client/device-id";

/**
 * Get the current user's ID token for API authentication
 * Returns null if user is not authenticated
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    // getIdToken() automatically refreshes the token if expired
    return await user.getIdToken();
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
}

/**
 * Create headers with authentication
 * Includes Content-Type and Authorization headers
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (typeof window !== "undefined") {
    headers["X-Client-Device-Id"] = getOrCreateClientDeviceId();
  }

  return headers;
}

/**
 * Authenticated fetch wrapper
 * Automatically adds auth token to requests
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (typeof window !== "undefined") {
    headers.set("X-Client-Device-Id", getOrCreateClientDeviceId());
  }

  // Propagate AI privacy preference to API routes.
  if (typeof window !== "undefined") {
    try {
      const mode = window.localStorage.getItem("ai_privacy_mode");
      headers.set(
        "X-AI-Privacy-Mode",
        mode === "standard" ? "standard" : "strict"
      );
    } catch {
      headers.set("X-AI-Privacy-Mode", "strict");
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * POST with authentication
 * Convenience wrapper for authenticated POST requests
 */
export async function authPost<T = unknown>(
  url: string,
  body: T
): Promise<Response> {
  return authFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
