"use client";

import { useRef, useCallback, useEffect, useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanPastedText } from "@/lib/utils/paste-cleanup";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  id?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean;
  "aria-describedby"?: string;
}

/** Convert markdown bold/italic to HTML */
function markdownToHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

/** Convert HTML back to markdown */
function htmlToMarkdown(html: string): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    // execCommand('bold') on some browsers produces <span style="font-weight: bold/700">
    .replace(/<span[^>]*style="[^"]*font-weight\s*:\s*(?:bold|700)[^"]*"[^>]*>(.*?)<\/span>/gi, "**$1**")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    // execCommand('italic') on some browsers produces <span style="font-style: italic">
    .replace(/<span[^>]*style="[^"]*font-style\s*:\s*italic[^"]*"[^>]*>(.*?)<\/span>/gi, "*$1*")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function RichTextEditorComponent({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  className,
  minHeight = "60px",
  id,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  "aria-describedby": ariaDescribedby,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  // Track whether we're updating from outside to avoid cursor jumps
  const isInternalChange = useRef(false);

  // Sync external value → editor HTML (only when value changes externally)
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;
    const html = markdownToHtml(value);
    if (editor.innerHTML !== html) {
      editor.innerHTML = html;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    isInternalChange.current = true;
    const md = htmlToMarkdown(editor.innerHTML);
    onChange(md);
  }, [onChange]);

  const applyFormat = useCallback((tag: "bold" | "italic") => {
    document.execCommand(tag, false);
    editorRef.current?.focus();
    // Sync after formatting
    handleInput();
  }, [handleInput]);

  const applyBulletList = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    // Insert a bullet point at the cursor position via execCommand (preserves undo)
    const prefix = editor.textContent?.trim() ? "\n• " : "• ";
    document.execCommand("insertText", false, prefix);
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain");
    if (!pasted) return;
    const cleaned = cleanPastedText(pasted);
    // Insert cleaned plain text at cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(cleaned));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    handleInput();
  }, [handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "b") {
      e.preventDefault();
      applyFormat("bold");
    } else if ((e.metaKey || e.ctrlKey) && e.key === "i") {
      e.preventDefault();
      applyFormat("italic");
    } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "l") {
      e.preventDefault();
      applyBulletList();
    }
  }, [applyFormat, applyBulletList]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const isEmpty = !value;

  return (
    <div className="space-y-1">
      <div className="relative">
        <div
          ref={editorRef}
          id={id}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          aria-describedby={ariaDescribedby}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "w-full resize-y overflow-auto rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "transition-all duration-200",
            "[&_strong]:font-bold [&_em]:italic",
            className,
          )}
          style={{ minHeight }}
          suppressContentEditableWarning
        />
        {/* Placeholder overlay — more reliable than CSS :empty (which breaks when browser inserts <br>) */}
        {isEmpty && placeholder && (
          <span
            aria-hidden="true"
            className="absolute top-2 left-3 text-sm text-muted-foreground pointer-events-none select-none"
          >
            {placeholder}
          </span>
        )}
      </div>
      {isFocused && (
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("bold");
            }}
            aria-label="Bold (Ctrl+B)"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("italic");
            }}
            aria-label="Italic (Ctrl+I)"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onMouseDown={(e) => {
              e.preventDefault();
              applyBulletList();
            }}
            aria-label="Bullet list (Ctrl+Shift+L)"
            title="Bullet list (Ctrl+Shift+L)"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export const RichTextEditor = memo(RichTextEditorComponent);
