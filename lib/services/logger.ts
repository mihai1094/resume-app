/* eslint-disable no-console */
/**
 * Logging service for consistent application-wide logging
 * Wraps console methods with optional context and environment-aware behavior
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  module?: string;
  action?: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const EMAIL_RE = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_RE = /\b(?:\+?\d[\d\s().-]{7,}\d)\b/g;
const TOKEN_RE = /\b(?:Bearer\s+)?[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g;
const URL_RE = /https?:\/\/[^\s]+/gi;

function redactString(value: string): string {
  return value
    .replace(EMAIL_RE, "[REDACTED_EMAIL]")
    .replace(PHONE_RE, "[REDACTED_PHONE]")
    .replace(TOKEN_RE, "[REDACTED_TOKEN]")
    .replace(URL_RE, "[REDACTED_URL]");
}

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(obj)) {
      const lower = key.toLowerCase();
      if (
        lower.includes("email") ||
        lower.includes("phone") ||
        lower.includes("token") ||
        lower.includes("authorization") ||
        lower.includes("password")
      ) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactValue(entry);
      }
    }
    return result;
  }
  return value;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.minLevel = this.isDevelopment ? "debug" : "warn";
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = context?.module ? `[${context.module}]` : "";
    const action = context?.action ? `(${context.action})` : "";
    return `${timestamp} ${level.toUpperCase()} ${prefix}${action} ${message}`;
  }

  private formatContext(context?: LogContext): Record<string, unknown> | undefined {
    if (!context) return undefined;
    const { module, action, ...rest } = context;
    return Object.keys(rest).length > 0
      ? (redactValue(rest) as Record<string, unknown>)
      : undefined;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;
    const formatted = this.formatMessage("debug", message, context);
    const extra = this.formatContext(context);
    if (extra) {
      console.log(formatted, extra);
    } else {
      console.log(formatted);
    }
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog("info")) return;
    const formatted = this.formatMessage("info", message, context);
    const extra = this.formatContext(context);
    if (extra) {
      console.info(formatted, extra);
    } else {
      console.info(formatted);
    }
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog("warn")) return;
    const formatted = this.formatMessage("warn", message, context);
    const extra = this.formatContext(context);
    if (extra) {
      console.warn(formatted, extra);
    } else {
      console.warn(formatted);
    }
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    if (!this.shouldLog("error")) return;
    const formatted = this.formatMessage("error", message, context);
    const extra = this.formatContext(context);

    if (error instanceof Error) {
      console.error(formatted, {
        ...extra,
        errorName: error.name,
        errorMessage: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      });
    } else if (extra) {
      console.error(formatted, { ...extra, error });
    } else {
      console.error(formatted, error);
    }
  }

  /**
   * Create a child logger with preset context
   * Useful for module-specific logging
   */
  child(defaultContext: LogContext): ChildLogger {
    return new ChildLogger(this, defaultContext);
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context };
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context));
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    this.parent.error(message, error, this.mergeContext(context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for quick logging
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    logger.error(message, error, context),
};

// Pre-configured loggers for common modules
export const aiLogger = logger.child({ module: "AI" });
export const authLogger = logger.child({ module: "Auth" });
export const storageLogger = logger.child({ module: "Storage" });
export const firestoreLogger = logger.child({ module: "Firestore" });
