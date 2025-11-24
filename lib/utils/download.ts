/**
 * Utility functions for file downloads
 * Provides a React-friendly abstraction over browser download APIs
 */

export interface DownloadOptions {
  /** The filename for the downloaded file */
  fileName: string;
  /** MIME type of the content */
  mimeType: string;
}

/**
 * Download a Blob as a file
 * Handles URL lifecycle management properly
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  try {
    triggerDownload(url, fileName);
  } finally {
    // Revoke after a short delay to ensure download starts
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}

/**
 * Download string content as a file
 */
export function downloadString(
  content: string,
  options: DownloadOptions
): void {
  const blob = new Blob([content], { type: options.mimeType });
  downloadBlob(blob, options.fileName);
}

/**
 * Download JSON data as a file
 */
export function downloadJSON(
  data: unknown,
  fileName: string,
  pretty: boolean = true
): void {
  const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  downloadString(content, {
    fileName,
    mimeType: "application/json",
  });
}

/**
 * Trigger a download using a hidden anchor element
 * This is the core download mechanism
 */
function triggerDownload(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
