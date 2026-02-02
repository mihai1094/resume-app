/**
 * Safe ID generation utilities
 * Provides collision-resistant IDs across all environments
 */

/**
 * Generate a UUID using crypto.randomUUID when available,
 * with a fallback for environments where it's not supported.
 *
 * @returns A UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export function createUUID(): string {
  // Try crypto.randomUUID first (available in modern browsers and Node 19+)
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Fallback: Generate a UUID v4-like string
  // Uses crypto.getRandomValues if available for better randomness
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version (4) and variant (RFC 4122)
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
      12,
      16
    )}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // Last resort: timestamp + Math.random (less secure but functional)
  const timestamp = Date.now().toString(16);
  const randomPart = () => Math.random().toString(16).slice(2, 6);
  return `${timestamp.slice(-8)}-${randomPart()}-4${randomPart().slice(
    1
  )}-${randomPart()}-${randomPart()}${randomPart()}${randomPart()}`.slice(
    0,
    36
  );
}

/**
 * Generate a prefixed ID for specific entity types
 *
 * @param prefix - The entity type prefix (e.g., "resume", "cover-letter")
 * @returns A prefixed UUID string (e.g., "resume-550e8400-e29b-41d4-a716-446655440000")
 */
export function createPrefixedId(prefix: string): string {
  return `${prefix}-${createUUID()}`;
}

/**
 * Generate a simple ID for resume items (work experience, education, etc.)
 * Uses timestamp + random string for quick, lightweight IDs
 *
 * @returns A simple ID string (e.g., "1706745600000-abc123def")
 */
export function createSimpleId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
