import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: App | undefined;
let adminAuth: Auth | undefined;

/**
 * Initialize Firebase Admin SDK for server-side operations
 * Uses environment variables for configuration
 */
function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Check for service account credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set. Please add it to your .env.local file."
    );
  }

  // If service account JSON is provided, use it
  if (serviceAccount) {
    try {
      const credentials = JSON.parse(serviceAccount);
      adminApp = initializeApp({
        credential: cert(credentials),
        projectId,
      });
    } catch (error) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
      throw new Error(
        "Invalid FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it's valid JSON."
      );
    }
  } else {
    // Use Application Default Credentials (for Google Cloud environments)
    // or require service account for local development
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT_KEY not set. Using application default credentials."
    );
    adminApp = initializeApp({
      projectId,
    });
  }

  return adminApp;
}

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth(): Auth {
  if (!adminAuth) {
    const app = initializeFirebaseAdmin();
    adminAuth = getAuth(app);
  }
  return adminAuth;
}

/**
 * Verify a Firebase ID token from the client
 * @param idToken - The ID token to verify
 * @returns The decoded token if valid, null if invalid
 */
export async function verifyIdToken(idToken: string) {
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}

/**
 * Extract and verify the Bearer token from an Authorization header
 * @param authHeader - The Authorization header value
 * @returns The decoded token if valid, null if invalid or missing
 */
export async function verifyAuthHeader(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    return null;
  }

  return verifyIdToken(token);
}
