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

        {/* Bottom bar — badges, company info, copyright */}
        <div className="border-t py-6 space-y-5">
          {/* ANPC / SOL badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              title="Alternative Dispute Resolution (Romania)"
              aria-label="ANPC - Alternative Dispute Resolution"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://etamade-com.github.io/anpc-sal-sol-logo/anpc-sal.svg"
                alt="SAL - Alternative Dispute Resolution"
                width={250}
                height={50}
                className="h-8 sm:h-10 w-auto"
                loading="lazy"
              />
            </a>
            <a
              href="https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en"
              target="_blank"
              rel="noopener noreferrer"
              title="EU Dispute Resolution Bodies"
              aria-label="EU list of consumer dispute resolution bodies"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://etamade-com.github.io/anpc-sal-sol-logo/anpc-sol.svg"
                alt="EU Dispute Resolution Bodies"
                width={250}
                height={50}
                className="h-8 sm:h-10 w-auto"
                loading="lazy"
              />
            </a>
          </div>

          {/* Company legal info — stacked tighter on mobile */}
          <div className="text-center text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed space-y-0.5">
            <p>
              {appConfig.company.legalName} &middot; CUI: {appConfig.company.cui} &middot; {appConfig.company.regCom}
            </p>
            <p className="hidden sm:block">
              {appConfig.company.address} &middot;{" "}
              <a
                href={`mailto:${appConfig.company.email}`}
                className="hover:text-foreground transition-colors"
              >
                {appConfig.company.email}
              </a>
            </p>
            <p className="sm:hidden">
              <a
                href={`mailto:${appConfig.company.email}`}
                className="hover:text-foreground transition-colors"
              >
                {appConfig.company.email}
              </a>
            </p>
            <p className="pt-1">
              <a
                href="https://www.dataprotection.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                ANSPDCP
              </a>
              {" "}&middot;{" "}
              <a
                href="https://anpc.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                ANPC
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
