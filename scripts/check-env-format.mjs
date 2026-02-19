#!/usr/bin/env node

import fs from "fs";
import dotenv from "dotenv";

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local", override: false });
}
if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env", override: false });
}

const REQUIRED = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_SERVICE_ACCOUNT_KEY",
  "GOOGLE_AI_API_KEY",
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_APP_URL",
];

const PUBLIC_FIREBASE = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

function fail(message) {
  console.error(`ENV CHECK FAILED: ${message}`);
  process.exit(1);
}

function requireValue(key) {
  const value = process.env[key];
  if (!value || value.trim().length === 0) {
    fail(`Missing required env var: ${key}`);
  }
  return value;
}

function isValidHttpUrl(raw) {
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

for (const key of REQUIRED) {
  requireValue(key);
}

for (const key of ["NEXT_PUBLIC_BASE_URL", "NEXT_PUBLIC_APP_URL"]) {
  const raw = requireValue(key);
  const trimmed = raw.trim();

  if (raw !== trimmed) {
    fail(`${key} has leading/trailing whitespace.`);
  }
  if (/\s/.test(trimmed) || trimmed.includes("\\n") || trimmed.includes("\\r")) {
    fail(`${key} includes whitespace/newline characters.`);
  }
  if (!isValidHttpUrl(trimmed)) {
    fail(`${key} must be a valid HTTP(S) URL.`);
  }
}

for (const key of PUBLIC_FIREBASE) {
  const raw = requireValue(key);
  const trimmed = raw.trim();
  if (raw !== trimmed) {
    fail(`${key} has leading/trailing whitespace.`);
  }
  if (/\s/.test(trimmed) || trimmed.includes("\\n") || trimmed.includes("\\r")) {
    fail(`${key} includes whitespace/newline characters.`);
  }
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(requireValue("FIREBASE_SERVICE_ACCOUNT_KEY"));
} catch {
  fail("FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON.");
}

if (
  serviceAccount?.type !== "service_account" ||
  !serviceAccount?.project_id?.trim() ||
  !serviceAccount?.client_email?.trim() ||
  !serviceAccount?.private_key?.trim()
) {
  fail("FIREBASE_SERVICE_ACCOUNT_KEY is missing required fields.");
}

const publicProjectId = requireValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID").trim();
const serviceProjectId = serviceAccount.project_id.trim();
if (publicProjectId !== serviceProjectId) {
  fail(
    `project_id mismatch: FIREBASE_SERVICE_ACCOUNT_KEY (${serviceProjectId}) vs NEXT_PUBLIC_FIREBASE_PROJECT_ID (${publicProjectId}).`
  );
}

console.log("ENV CHECK OK");
