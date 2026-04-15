import { ReactNode, HTMLAttributes } from "react";

/**
 * Semantic wrapper components for resume templates.
 *
 * These always render proper HTML landmark elements (`<header>`, `<h1>`,
 * `<main>`) so they work in both client preview AND server-side PDF
 * serialization (renderToString).
 *
 * For gallery thumbnails that embed many templates on one page, the
 * preview container should use `aria-hidden="true"` and `inert` to
 * keep the duplicate landmarks out of the accessibility tree.
 */

/**
 * Wraps template thumbnails to hide duplicate landmarks from assistive
 * technology and search engines. Use this around gallery/carousel previews.
 */
export function TemplatePreviewProvider({ children }: { children: ReactNode }) {
  return (
    <div aria-hidden="true" inert={true}>
      {children}
    </div>
  );
}

/** Renders `<main>` for the template's primary content area. */
export function TemplateMain({
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <main {...props}>{children}</main>;
}

/** Renders `<header>` for the template's header region. */
export function TemplateHeader({
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return <header {...props}>{children}</header>;
}

/** Renders the user's name as `<h1>`. */
export function TemplateH1({
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h1 {...props}>{children}</h1>;
}
