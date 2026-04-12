import { getTemplateFontClassNames } from "@/lib/fonts/editor-fonts";

/**
 * Templates gallery layout: applies template fonts for preview rendering.
 */
export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <div className={getTemplateFontClassNames()}>{children}</div>;
}
