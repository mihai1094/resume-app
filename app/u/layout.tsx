import { getTemplateFontClassNames } from "@/lib/fonts/editor-fonts";

/**
 * Public resume view layout: applies template fonts for the public /u/[username]/[slug] pages.
 */
export default function PublicResumeLayout({ children }: { children: React.ReactNode }) {
  return <div className={getTemplateFontClassNames()}>{children}</div>;
}
