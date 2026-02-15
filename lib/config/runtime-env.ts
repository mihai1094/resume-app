import "server-only";

type RequiredEnvKey =
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID"
  | "FIREBASE_SERVICE_ACCOUNT_KEY"
  | "GOOGLE_AI_API_KEY"
  | "NEXT_PUBLIC_BASE_URL"
  | "NEXT_PUBLIC_APP_URL";

const REQUIRED_IN_PRODUCTION: RequiredEnvKey[] = [
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

const FIREBASE_PUBLIC_ENV_KEYS: RequiredEnvKey[] = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

let validated = false;

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateRuntimeEnv(): void {
  if (validated) return;
  validated = true;

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => {
    const value = process.env[key];
    return !value || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  if (!isValidUrl(baseUrl) || !isValidUrl(appUrl)) {
    throw new Error(
      "NEXT_PUBLIC_BASE_URL and NEXT_PUBLIC_APP_URL must be valid HTTP(S) URLs in production."
    );
  }

  for (const key of FIREBASE_PUBLIC_ENV_KEYS) {
    const raw = process.env[key]!;
    const trimmed = raw.trim();
    if (raw !== trimmed) {
      throw new Error(
        `${key} contains leading or trailing whitespace. Remove extra spaces/new lines in environment variables.`
      );
    }
    if (/\s/.test(trimmed)) {
      throw new Error(
        `${key} contains whitespace characters. Check for accidental line breaks in environment variables.`
      );
    }
  }

  const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY!;
  let serviceAccount: {
    project_id?: string;
    client_email?: string;
    private_key?: string;
    type?: string;
  };
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY must be valid JSON in production."
    );
  }

  if (
    serviceAccount.type !== "service_account" ||
    !serviceAccount.project_id?.trim() ||
    !serviceAccount.client_email?.trim() ||
    !serviceAccount.private_key?.trim()
  ) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY is missing required service account fields."
    );
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!.trim();
  const serviceAccountProjectId = serviceAccount.project_id.trim();
  if (serviceAccountProjectId !== projectId) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_KEY project_id (${serviceAccountProjectId}) does not match NEXT_PUBLIC_FIREBASE_PROJECT_ID (${projectId}).`
    );
  }
}
