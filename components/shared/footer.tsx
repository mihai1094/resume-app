import Link from "next/link";
import Image from "next/image";
import { appConfig } from "@/config/app";

// Server Component - no "use client" needed
// Static content that doesn't require client-side interactivity

const LINK_CLASS =
  "text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block py-1.5 sm:py-0.5";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-5 sm:px-6">
        {/* Main footer content */}
        <div className="py-10 sm:py-12">
          {/* Brand row — always visible, compact on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 sm:gap-8 mb-8 sm:mb-10">
            <div className="max-w-xs">
              <h3 className="font-semibold text-base flex items-center gap-2 mb-2">
                <Image src="/assets/icon.svg" alt="" width={20} height={20} />
                {appConfig.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {appConfig.description}
              </p>
            </div>

            {/* Support link — visible on sm+ next to brand */}
            <div className="hidden sm:block shrink-0">
              <a
                href={`mailto:${appConfig.supportEmail}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-dashed border-muted-foreground/40 hover:border-foreground/40 pb-0.5"
              >
                Get Support
              </a>
            </div>
          </div>

          {/* Links — 2 cols on mobile, 3 cols on sm, 3 cols on lg */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-8 text-sm">
            {/* Quick Links */}
            <nav aria-label="Quick links">
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-3">
                Quick Links
              </h4>
              <ul className="space-y-1.5 sm:space-y-1">
                <li>
                  <Link href="/about" className={LINK_CLASS}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href={appConfig.urls.create} className={LINK_CLASS}>
                    Create Resume
                  </Link>
                </li>
                <li>
                  <Link href={appConfig.urls.templates} className={LINK_CLASS}>
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className={LINK_CLASS}>
                    My Resumes
                  </Link>
                </li>
                <li>
                  <Link href="/cover-letter" className={LINK_CLASS}>
                    Cover Letter
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Resources */}
            <nav aria-label="Resources">
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-3">
                Resources
              </h4>
              <ul className="space-y-1.5 sm:space-y-1">
                <li>
                  <Link
                    href="/pricing#compare-builders"
                    className={LINK_CLASS}
                  >
                    Alternatives
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={LINK_CLASS}>
                    Career Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog/how-to-pass-ats-screening"
                    className={LINK_CLASS}
                  >
                    ATS Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog/ai-resume-optimization-guide"
                    className={LINK_CLASS}
                  >
                    AI Resume Tips
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Legal */}
            <nav aria-label="Legal" className="col-span-2 sm:col-span-1">
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/70 mb-3">
                Legal
              </h4>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-1.5 sm:gap-y-1">
                <li>
                  <Link href="/privacy" className={LINK_CLASS}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={LINK_CLASS}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className={LINK_CLASS}>
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <a
                    href={`mailto:${appConfig.supportEmail}?subject=Privacy%20Inquiry`}
                    className={LINK_CLASS}
                  >
                    Privacy Contact
                  </a>
                </li>
                <li>
                  <a
                    href="https://anpc.ro/ce-este-sal/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                  >
                    ADR (SAL)
                  </a>
                </li>
                <li>
                  <a
                    href="https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                  >
                    EU ADR Bodies
                  </a>
                </li>
                <li>
                  <Link href="/imprint" className={LINK_CLASS}>
                    Company Info
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Mobile support link */}
          <div className="sm:hidden mt-6">
            <a
              href={`mailto:${appConfig.supportEmail}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Need help? Get Support &rarr;
            </a>
          </div>
        </div>

        {/* Bottom bar — badges + company identifiers */}
        <div className="border-t py-6 space-y-4">
          {/* ANPC / SOL badges — local assets */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ANPC — Soluționarea Alternativă a Litigiilor"
            >
              <Image
                src="/assets/anpc-sal.svg"
                alt="SAL — Alternative Dispute Resolution"
                width={150}
                height={32}
                className="h-8 sm:h-9 w-auto"
              />
            </a>
            <a
              href="https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="EU Online Dispute Resolution"
            >
              <Image
                src="/assets/anpc-sol.svg"
                alt="SOL — EU Online Dispute Resolution"
                width={150}
                height={32}
                className="h-8 sm:h-9 w-auto"
              />
            </a>
          </div>

          {/* Compact legal identifiers */}
          <div className="text-center text-xs text-muted-foreground/70 leading-relaxed">
            <p>
              {appConfig.company.legalName} &middot; CUI: {appConfig.company.cui} &middot; {appConfig.company.regCom}
            </p>
            <p className="mt-1">
              <Link
                href="/imprint"
                className="hover:text-foreground transition-colors underline underline-offset-2 decoration-dotted"
              >
                Full company details & consumer rights
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
