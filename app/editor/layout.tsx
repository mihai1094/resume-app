import { getTemplateFontClassNames } from "@/lib/fonts/editor-fonts";

/**
 * Editor layout: applies template-specific Google Font CSS variables so resume
 * templates render correctly without loading these fonts on every other page.
 */
export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <div className={getTemplateFontClassNames()}>{children}</div>;
}
