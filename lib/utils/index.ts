/**
 * Utilities barrel export
 * Import all utilities from this file for convenience
 */

// Core utilities
export { cn } from "./cn";

// Resume utilities
export {
  generateId,
  formatDate,
  calculateDuration,
  sortWorkExperienceByDate,
  sortEducationByDate,
  validateResumeData,
  getResumeWarnings,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "./resume";

// Download utilities
export { downloadBlob, downloadJSON, downloadString } from "./download";

// Error utilities
export {
  isFirebaseError,
  toFirebaseError,
  getErrorMessage,
  getErrorCode,
  createErrorResult,
  type FirebaseError,
  type ErrorResult,
  type SuccessResult,
  type ServiceResult,
} from "./error";




