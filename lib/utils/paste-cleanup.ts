/**
 * Cleans up text pasted from old CVs, PDFs, and other documents.
 * Strips bullet markers, normalizes whitespace, removes PDF artifacts.
 */
export function cleanPastedText(text: string): string {
  return (
    text
      // Remove zero-width and invisible unicode characters
      .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, "")
      // Replace non-breaking spaces with regular spaces
      .replace(/\u00A0/g, " ")
      // Normalize curly/smart quotes to straight quotes
      .replace(/[\u2018\u2019\u201A]/g, "'")
      .replace(/[\u201C\u201D\u201E]/g, '"')
      // Normalize dashes (em dash, en dash) to regular dash
      .replace(/[\u2013\u2014]/g, "-")
      // Normalize ellipsis
      .replace(/\u2026/g, "...")
      // Strip leading bullet markers per line (•, ●, ○, ◦, ▪, ▸, ►, ‣, ■, ◆)
      .replace(/^[\s]*[•●○◦▪▸►‣■◆⬥⁃]\s*/gm, "")
      // Strip leading dashes/asterisks used as bullets (but not markdown bold **)
      .replace(/^[\s]*[-–—*]\s+/gm, "")
      // Strip leading numbers used as bullets (e.g., "1. ", "1) ")
      .replace(/^[\s]*\d+[.)]\s+/gm, "")
      // Replace tabs with spaces
      .replace(/\t/g, " ")
      // Collapse multiple spaces into one
      .replace(/ {2,}/g, " ")
      // Trim each line
      .replace(/^[ ]+|[ ]+$/gm, "")
      // Collapse 3+ consecutive newlines into 2
      .replace(/\n{3,}/g, "\n\n")
      // Final trim
      .trim()
  );
}

/**
 * For single-line inputs: additionally collapses all newlines into spaces.
 */
export function cleanPastedTextSingleLine(text: string): string {
  return cleanPastedText(text).replace(/\n+/g, " ").trim();
}

/**
 * onPaste handler for raw <Textarea> elements.
 * Call with a setter: onPaste={createTextareaPasteHandler(setValue)}
 */
export function createTextareaPasteHandler(
  setValue: (value: string) => void
): React.ClipboardEventHandler<HTMLTextAreaElement> {
  return (e) => {
    const pasted = e.clipboardData.getData("text/plain");
    if (!pasted) return;
    e.preventDefault();
    const cleaned = cleanPastedText(pasted);
    const ta = e.currentTarget;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const current = ta.value;
    setValue(current.slice(0, start) + cleaned + current.slice(end));
  };
}
