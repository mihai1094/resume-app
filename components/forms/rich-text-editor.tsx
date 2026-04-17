"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanPastedText } from "@/lib/utils/paste-cleanup";
import { markdownToHtml, htmlToMarkdown } from "@/lib/utils/markdown-html";

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

/**
 * TipTap-backed rich text editor.
 *
 * Storage format is plain markdown — `**bold**`, `*italic*`, `\n` for newlines,
 * `\n\n` for paragraph breaks, literal `• ` for bullets. The same format is
 * rendered by `renderFormattedText` in every resume template so editor and
 * preview match 1:1.
 *
 * Why TipTap (not contentEditable or textarea):
 * - Textarea can't show actual bold/italic styling inline.
 * - Raw contentEditable had nasty browser divergences on Enter and paste
 *   that broke newline round-tripping (Chrome <div>, Firefox <br>, Safari <p>).
 * - TipTap/ProseMirror normalize all of that into a predictable doc model
 *   we serialize to/from markdown.
 */
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
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Bullets are stored as plain `• ` text markers (to match existing
        // renderFormattedText), not as <ul><li> nodes.
        bulletList: false,
        orderedList: false,
        listItem: false,
        // Resume bullet descriptions don't need these block types.
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: placeholder || "",
      }),
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        role: "textbox",
        "aria-multiline": "true",
        class: cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "transition-all duration-200",
          // Preserve runs of spaces and explicit hard breaks verbatim —
          // same rule used by renderFormattedText in the template preview.
          "whitespace-pre-wrap break-words",
          // TipTap wraps each paragraph in a <p>; give them a reasonable
          // default margin so blank lines (two paragraphs) show as a gap.
          "[&>p]:min-h-[1.5em]",
          className,
        ),
        "aria-invalid": ariaInvalid == null ? "false" : String(ariaInvalid),
        "aria-required": ariaRequired == null ? "false" : String(ariaRequired),
        ...(ariaDescribedby ? { "aria-describedby": ariaDescribedby } : {}),
        style: `min-height: ${minHeight}; line-height: 1.5;`,
      },
      handlePaste(_, event) {
        const pasted = event.clipboardData?.getData("text/plain");
        if (!pasted) return false;
        event.preventDefault();
        const cleaned = cleanPastedText(pasted);
        const html = markdownToHtml(cleaned);
        editor?.commands.insertContent(html);
        return true;
      },
    },
    onUpdate({ editor }) {
      const md = htmlToMarkdown(editor.getHTML());
      onChange(md);
    },
    onFocus() {
      setIsFocused(true);
      onFocus?.();
    },
    onBlur() {
      setIsFocused(false);
      onBlur?.();
    },
    // Avoid SSR hydration mismatches in Next.js app router.
    immediatelyRender: false,
  });

  // Sync external value changes (e.g., AI-applied improvements) without
  // losing cursor on local edits: only setContent when the incoming value
  // differs from what the editor already holds in markdown form.
  useEffect(() => {
    if (!editor) return;
    const currentMd = htmlToMarkdown(editor.getHTML());
    if (currentMd !== value) {
      editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
    }
  }, [value, editor]);

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run();
  }, [editor]);

  const insertBullet = useCallback(() => {
    editor?.chain().focus().insertContent("• ").run();
  }, [editor]);

  return (
    <div className="space-y-1">
      <EditorContent editor={editor} />
      {isFocused && (
        <div className="flex gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBold();
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
              toggleItalic();
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
              insertBullet();
            }}
            aria-label="Bullet list"
            title="Bullet"
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export const RichTextEditor = memo(RichTextEditorComponent);
