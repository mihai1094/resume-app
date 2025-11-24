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
  exportResumeToJSON,
  importResumeFromJSON,
  validateResumeData,
  isValidEmail,
  isValidPhone,
  isValidUrl,
} from "./resume";

// Download utilities
export { downloadBlob, downloadJSON, downloadString } from "./download";



