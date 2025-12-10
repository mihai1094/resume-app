/**
 * Services barrel export
 * Import all services from this file for convenience
 */

// Note: storageService is deprecated - use firestoreService instead
// The storage.ts file is kept for reference only

export { resumeService } from "./resume";
export {
  exportResume,
  exportToPDF,
  exportToDOCX,
  exportToJSON,
  exportToTXT,
  type ExportFormat,
  type ExportOptions,
} from "./export";
export {
  importResume,
  importFromJSON,
  importFromFile,
  importFromLinkedIn,
  type ImportSource,
  type ImportOptions,
} from "./import";
export {
  logger,
  log,
  aiLogger,
  authLogger,
  storageLogger,
  firestoreLogger,
} from "./logger";

