import { createElement, Fragment, type ReactNode } from "react";

/**
 * Parses simple markdown-style bold (**text**) and italic (*text*) markers
 * into React elements with <strong> and <em> tags.
 *
 * Supports nesting: ***bold italic*** or **bold *italic* inside**
 */
/**
 * Renders summary/paragraph text as flowing prose.
 * Single newlines become spaces; double newlines become paragraph breaks.
 * Preserves bold/italic markdown formatting.
 */
export function renderSummaryText(text: string): ReactNode {
  if (!text) return text;

  // Collapse single newlines to spaces, preserve double newlines as paragraph breaks
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n\n")       // normalize 3+ newlines to double
    .replace(/(?<!\n)\n(?!\n)/g, " "); // single \n → space

  return renderFormattedText(normalized);
}

export function renderFormattedText(text: string): ReactNode {
  if (!text) return text;

  const hasFormatting = text.includes("*");
  const hasNewlines = text.includes("\n");

  if (!hasFormatting && !hasNewlines) return text;

  // Handle newlines — split into lines and process each
  if (hasNewlines) {
    const lines = text.split("\n");
    const parts: ReactNode[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (i > 0) parts.push(createElement("br", { key: `br-${i}` }));
      const line = lines[i];
      if (line) {
        parts.push(createElement(Fragment, { key: `l-${i}` }, renderFormattedLine(line)));
      } else if (i > 0 && i < lines.length - 1) {
        // Empty line: render a spacer to preserve the blank line gap
        parts.push(createElement("span", { key: `sp-${i}`, className: "block h-2" }));
      }
    }
    return createElement(Fragment, null, ...parts);
  }

  return renderFormattedLine(text);
}

/** Parses bold/italic markers within a single line */
function renderFormattedLine(text: string): ReactNode {
  if (!text.includes("*")) return text;

  const parts: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < text.length) {
    // Bold: **...**
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        parts.push(
          createElement("strong", { key: key++ }, renderFormattedLine(inner))
        );
        i = end + 2;
        continue;
      }
    }

    // Italic: *...*
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = findClosingItalic(text, i + 1);
      if (end !== -1) {
        const inner = text.slice(i + 1, end);
        parts.push(
          createElement("em", { key: key++ }, renderFormattedLine(inner))
        );
        i = end + 1;
        continue;
      }
    }

    // Regular text — collect until next *
    const nextStar = text.indexOf("*", i + 1);
    const chunk = nextStar === -1 ? text.slice(i) : text.slice(i, nextStar);
    parts.push(chunk);
    i += chunk.length;
  }

  return parts.length === 1 ? parts[0] : createElement(Fragment, null, ...parts);
}

/** Find closing single * that isn't part of ** */
function findClosingItalic(text: string, start: number): number {
  for (let i = start; i < text.length; i++) {
    if (text[i] === "*" && text[i + 1] !== "*" && (i === 0 || text[i - 1] !== "*")) {
      return i;
    }
  }
  return -1;
}
