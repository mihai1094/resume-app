/**
 * Admin Configuration
 *
 * Admin users can:
 * - Toggle between Free/Premium plans for testing
 * - Reset AI credits
 * - See dev tools in settings
 *
 * Set ADMIN_EMAILS env var as a comma-separated list of emails.
 */

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw || !raw.trim()) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

/**
 * Check if an email belongs to an admin user
 */
export function isAdminUser(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Check if dev tools should be shown
 * Shows in development mode OR for admin users
 */
export function shouldShowDevTools(email: string | undefined | null): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return isAdminUser(email);
}
