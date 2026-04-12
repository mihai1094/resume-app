"use client";

import { createContext, useContext, ReactNode, HTMLAttributes } from "react";

/**
 * When a resume template is embedded as a thumbnail (e.g. inside the template
 * gallery cards on /templates), we don't want it to emit landmark elements or
 * duplicate `<h1>` tags — otherwise a single page would contain 22+ `<h1>`s
 * and 10+ `<main>`s, which destroys SEO and accessibility.
 *
 * Usage:
 *   <TemplatePreviewProvider>
 *     <SomeTemplate data={...} />  // renders <p> instead of <h1>, <div> instead of <main>
 *   </TemplatePreviewProvider>
 *
 * Defaults to `false` so templates rendered at full-page (e.g. /editor/new)
 * continue to use proper semantic landmarks.
 */
const TemplatePreviewContext = createContext<boolean>(false);

export function TemplatePreviewProvider({ children }: { children: ReactNode }) {
  return (
    <TemplatePreviewContext.Provider value={true}>
      {children}
    </TemplatePreviewContext.Provider>
  );
}

export function useIsTemplatePreview(): boolean {
  return useContext(TemplatePreviewContext);
}

/**
 * Landmark-aware wrapper for the outer `<main>` of a resume template.
 * Falls back to a plain `<div>` when rendered inside a preview (gallery card).
 */
export function TemplateMain({
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  const isPreview = useIsTemplatePreview();
  const Tag = isPreview ? "div" : "main";
  return <Tag {...props}>{children}</Tag>;
}

/**
 * Landmark-aware wrapper for a template's section header region.
 * Renders `<header>` by default, `<div>` inside a preview.
 */
export function TemplateHeader({
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  const isPreview = useIsTemplatePreview();
  const Tag = isPreview ? "div" : "header";
  return <Tag {...props}>{children}</Tag>;
}

/**
 * Renders the user's name as `<h1>` at full-size and as `<p>` in preview mode.
 * Typography must be controlled via className — both tags accept it.
 */
export function TemplateH1({
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  const isPreview = useIsTemplatePreview();
  const Tag = isPreview ? "p" : "h1";
  return <Tag {...props}>{children}</Tag>;
}
