import { normalizeUrl } from "@/lib/utils/contact-display";
import { CSSProperties } from "react";

interface ContactLinkProps {
  href: string;
  display: string;
  isEmail?: boolean;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

/**
 * Renders a contact URL as a clickable hyperlink.
 * Works in both live preview and headless-Chrome PDF export.
 */
export function ContactLink({
  href,
  display,
  isEmail = false,
  className,
  style,
  title,
}: ContactLinkProps) {
  const linkHref = isEmail ? `mailto:${href}` : normalizeUrl(href);
  return (
    <a
      href={linkHref}
      className={className}
      style={style}
      title={title ?? href}
      target={isEmail ? undefined : "_blank"}
      rel={isEmail ? undefined : "noopener noreferrer"}
    >
      {display}
    </a>
  );
}
