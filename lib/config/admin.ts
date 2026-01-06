/**
 * Admin Configuration
 *
 * Admin users can:
 * - Toggle between Free/Premium plans for testing
 * - Reset AI credits
 * - See dev tools in settings
 */

export const ADMIN_EMAILS = [
  "catalin.ionescu1094@gmail.com",
] as const;

/**
 * Check if an email belongs to an admin user
 */
export function isAdminUser(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as typeof ADMIN_EMAILS[number]);
}

/**
 * Check if dev tools should be shown
 * Shows in development mode OR for admin users
 */
export function shouldShowDevTools(email: string | undefined | null): boolean {
  if (process.env.NODE_ENV === "development") return true;
  return isAdminUser(email);
}
