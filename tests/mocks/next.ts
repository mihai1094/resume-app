/**
 * Next.js test utilities for API route testing.
 *
 * Usage:
 *   import { makeRequest, makeAuthRequest } from "@/tests/mocks/next";
 *   const req = makeRequest("/api/ai/generate-bullets", { position: "Engineer" });
 */

import { NextRequest } from "next/server";

/** Create a POST NextRequest with JSON body */
export function makeRequest(
  path: string,
  body: unknown,
  options: {
    method?: string;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = "POST", headers = {} } = options;

  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

/** Create an authenticated request with Authorization header */
export function makeAuthRequest(
  path: string,
  body: unknown,
  token = "mock-firebase-token",
  extraHeaders: Record<string, string> = {}
): NextRequest {
  return makeRequest(path, body, {
    headers: {
      authorization: `Bearer ${token}`,
      ...extraHeaders,
    },
  });
}

/** Create a GET request */
export function makeGetRequest(
  path: string,
  headers: Record<string, string> = {}
): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method: "GET",
    headers,
  });
}

/** Parse a Response as JSON */
export async function parseResponse<T = unknown>(
  response: Response
): Promise<{ status: number; data: T }> {
  const data = (await response.json()) as T;
  return { status: response.status, data };
}
