/**
 * Tiny markdown ↔ HTML converters for the RichTextEditor (TipTap).
 *
 * Storage format is an intentionally-restricted markdown subset:
 *   - `**bold**`       → `<strong>…</strong>`
 *   - `*italic*`       → `<em>…</em>`
 *   - `\n`             → soft line break within a paragraph  (`<br>`)
 *   - `\n\n` (or more) → paragraph boundary                  (`</p><p>`)
 *   - Literal `• `     → plain text bullet marker (not a list node)
 *
 * This is deliberately NOT a full markdown parser. Anything outside of the
 * above is passed through verbatim so users can type `*` or `_` in prose
 * without it vanishing.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Parse bold/italic markers within a single paragraph's text. */
function parseInline(raw: string): string {
  let out = "";
  let i = 0;
  while (i < raw.length) {
    // **bold**
    if (raw[i] === "*" && raw[i + 1] === "*") {
      const end = raw.indexOf("**", i + 2);
      if (end !== -1) {
        const inner = raw.slice(i + 2, end);
        out += `<strong>${parseInline(inner)}</strong>`;
        i = end + 2;
        continue;
      }
    }
    // *italic* — require the opening * not to be adjacent to another *
    if (
      raw[i] === "*" &&
      raw[i + 1] !== "*" &&
      (i === 0 || raw[i - 1] !== "*")
    ) {
      // Find closing single *
      let end = -1;
      for (let j = i + 1; j < raw.length; j++) {
        if (
          raw[j] === "*" &&
          raw[j + 1] !== "*" &&
          raw[j - 1] !== "*"
        ) {
          end = j;
          break;
        }
      }
      if (end !== -1) {
        const inner = raw.slice(i + 1, end);
        out += `<em>${parseInline(inner)}</em>`;
        i = end + 1;
        continue;
      }
    }
    out += raw[i];
    i += 1;
  }
  return out;
}

export function markdownToHtml(md: string): string {
  if (!md) return "";
  // Normalize line endings first.
  const normalized = md.replace(/\r\n/g, "\n");
  // Split into paragraphs on blank lines (2+ \n).
  const paragraphs = normalized.split(/\n{2,}/);
  return paragraphs
    .map((p) => {
      const escaped = escapeHtml(p);
      const withMarks = parseInline(escaped);
      // Single newlines inside a paragraph become hard breaks.
      const withBreaks = withMarks.replace(/\n/g, "<br>");
      // Empty paragraphs need a <br> so TipTap keeps them as empty lines.
      return `<p>${withBreaks || "<br>"}</p>`;
    })
    .join("");
}

function serializeInline(node: Node): string {
  if (node.nodeType === 3 /* Node.TEXT_NODE */) {
    return node.textContent || "";
  }
  if (!(node instanceof Element)) return "";
  const children = Array.from(node.childNodes).map(serializeInline).join("");
  const name = node.nodeName;
  if (name === "STRONG" || name === "B") return `**${children}**`;
  if (name === "EM" || name === "I") return `*${children}*`;
  if (name === "BR") return "\n";
  return children;
}

/**
 * Convert TipTap's HTML output back to our markdown storage format.
 * Expected shape: `<p>…</p><p>…</p>` with inline `<strong>`, `<em>`, `<br>`.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") return "";

  const root = document.createElement("div");
  root.innerHTML = html;

  const paragraphs: string[] = [];
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeName === "P") {
      paragraphs.push(serializeInline(child));
    } else {
      // Fallback — some content may not be wrapped in <p>.
      paragraphs.push(serializeInline(child));
    }
  }
  return paragraphs.join("\n\n");
}
