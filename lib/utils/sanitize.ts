/**
 * Input sanitization utilities
 * Prevents XSS and other injection attacks
 */

/**
 * Sanitize user input by removing potentially harmful characters and HTML
 * @param input - Raw user input string
 * @returns Sanitized string safe for storage and display
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  return (
    input
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove script tags and content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove event handlers
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      // Remove javascript: protocol
      .replace(/javascript:/gi, "")
      // Remove data: protocol (can be used for XSS)
      .replace(/data:text\/html/gi, "")
      // Trim whitespace
      .trim()
  );
}

/**
 * Sanitize email addresses
 * @param email - Email string
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email);
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : "";
}

/**
 * Sanitize phone numbers
 * @param phone - Phone string
 * @returns Sanitized phone with only digits, spaces, and common separators
 */
export function sanitizePhone(phone: string): string {
  return sanitizeInput(phone).replace(/[^\d\s\-\(\)\+]/g, "");
}

/**
 * Sanitize URL
 * @param url - URL string
 * @returns Sanitized URL or empty string if invalid/dangerous
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeInput(url);

  // Only allow http(s) protocols
  try {
    const parsed = new URL(sanitized);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return sanitized;
    }
  } catch {
    // Invalid URL
  }

  return "";
}

/**
 * Sanitize text for safe HTML display
 * Escapes HTML entities
 * @param text - Raw text
 * @returns HTML-escaped text
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitize filename
 * Removes path traversal attempts and dangerous characters
 * @param filename - Original filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._\-]/g, "_") // Only allow safe characters
    .replace(/\.{2,}/g, ".") // Prevent directory traversal
    .replace(/^\.+/, "") // Remove leading dots
    .substring(0, 255); // Limit length
}

/**
 * Sanitize object with multiple fields
 * @param obj - Object with string values
 * @param fields - Fields to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...obj };

  for (const field of fields) {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeInput(sanitized[field] as string) as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize resume data fields
 * @param data - Resume field data
 * @returns Sanitized data
 */
export function sanitizeResumeField(data: string): string {
  // More lenient for resume content - preserve formatting but remove dangerous content
  return (
    data
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove event handlers
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
      // Remove javascript: protocol
      .replace(/javascript:/gi, "")
      // Trim
      .trim()
  );
}
