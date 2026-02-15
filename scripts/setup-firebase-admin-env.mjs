#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

function usage() {
  console.log(
    "Usage: node scripts/setup-firebase-admin-env.mjs <service-account.json> [env-file]"
  );
}

const [, , serviceAccountPathArg, envFileArg] = process.argv;

if (!serviceAccountPathArg) {
  usage();
  process.exit(1);
}

const cwd = process.cwd();
const serviceAccountPath = path.resolve(cwd, serviceAccountPathArg);
const envFilePath = path.resolve(cwd, envFileArg || ".env.local");

if (!fs.existsSync(serviceAccountPath)) {
  console.error(`Service account file not found: ${serviceAccountPath}`);
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
} catch (error) {
  console.error("Failed to parse service account JSON:", error);
  process.exit(1);
}

const requiredFields = ["type", "project_id", "private_key", "client_email"];
for (const key of requiredFields) {
  if (!parsed[key]) {
    console.error(`Invalid service account JSON. Missing field: ${key}`);
    process.exit(1);
  }
}

if (parsed.type !== "service_account") {
  console.error(
    `Invalid service account JSON. Expected type=service_account, got: ${parsed.type}`
  );
  process.exit(1);
}

const compactJson = JSON.stringify(parsed);
const keyName = "FIREBASE_SERVICE_ACCOUNT_KEY";
const keyLine = `${keyName}=${compactJson}`;

let envContent = "";
if (fs.existsSync(envFilePath)) {
  envContent = fs.readFileSync(envFilePath, "utf8");
}

const pattern = new RegExp(`^${keyName}=.*$`, "m");
if (pattern.test(envContent)) {
  envContent = envContent.replace(pattern, keyLine);
} else {
  if (envContent.length > 0 && !envContent.endsWith("\n")) {
    envContent += "\n";
  }
  envContent += `${keyLine}\n`;
}

fs.writeFileSync(envFilePath, envContent, "utf8");

const projectId = parsed.project_id;
console.log(`Updated ${path.relative(cwd, envFilePath)} with ${keyName}.`);
console.log(`Service account project_id: ${projectId}`);
console.log("Restart your dev server after this change.");
