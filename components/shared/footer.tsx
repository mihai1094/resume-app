import Link from "next/link";
import Image from "next/image";
import { appConfig } from "@/config/app";

const LINK_CLASS =
  "text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block py-1 text-sm";

const HEADING_CLASS =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/50 mb-4";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-5 sm:px-6">

        {/* Main grid — brand col + 3 link cols */}
        <div className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-10">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-base flex items-center gap-2 mb-1.5">
                <Image src="/assets/icon.svg" alt="" width={18} height={18} />
                {appConfig.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                Free resume builder with AI, live ATS scoring, and PDF export.
              </p>
            </div>
            <a
              href={`mailto:${appConfig.supportEmail}`}
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors w-fit"
            >
              Get Support →
            </a>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h4 className={HEADING_CLASS}>Quick Links</h4>
            <ul className="space-y-0.5">
              <li><Link href="/about" className={LINK_CLASS}>About</Link></li>
              <li><Link href={appConfig.urls.create} className={LINK_CLASS}>Create Resume</Link></li>
              <li><Link href={appConfig.urls.templates} className={LINK_CLASS}>Templates</Link></li>
              <li><Link href="/dashboard" className={LINK_CLASS}>My Resumes</Link></li>
              <li><Link href="/cover-letter" className={LINK_CLASS}>Cover Letter</Link></li>
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h4 className={HEADING_CLASS}>Resources</h4>
            <ul className="space-y-0.5">
              <li><Link href="/pricing#compare-builders" className={LINK_CLASS}>Alternatives</Link></li>
              <li><Link href="/blog" className={LINK_CLASS}>Career Blog</Link></li>
              <li><Link href="/blog/how-to-pass-ats-screening" className={LINK_CLASS}>ATS Guide</Link></li>
              <li><Link href="/blog/ai-resume-optimization-guide" className={LINK_CLASS}>AI Resume Tips</Link></li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal">
            <h4 className={HEADING_CLASS}>Legal</h4>
            <ul className="space-y-0.5">
              <li><Link href="/privacy" className={LINK_CLASS}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={LINK_CLASS}>Terms of Service</Link></li>
              <li><Link href="/cookies" className={LINK_CLASS}>Cookie Policy</Link></li>
              <li>
                <a href={`mailto:${appConfig.supportEmail}?subject=Privacy%20Inquiry`} className={LINK_CLASS}>
                  Privacy Contact
                </a>
              </li>
              <li><Link href="/imprint" className={LINK_CLASS}>Company Info</Link></li>
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
          {/* Copyright + legal identifiers */}
          <p>
            © {year} {appConfig.company.legalName} &middot; CUI: {appConfig.company.cui} &middot;{" "}
            <Link href="/imprint" className="hover:text-foreground transition-colors underline underline-offset-2 decoration-dotted">
              {appConfig.company.regCom}
            </Link>
          </p>

          {/* ANPC badges — compact, right-aligned */}
          <div className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1.5 text-muted-foreground/80">
              <Image src="/assets/eu-flag.svg" alt="" aria-hidden width={16} height={11} className="w-4 h-auto rounded-[1px] flex-shrink-0" />
              <span className="text-[11px] font-medium">Made in EU</span>
            </span>
            <a
              href="https://anpc.ro/ce-este-sal/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ANPC — Soluționarea Alternativă a Litigiilor"
            >
              <Image
                src="/assets/anpc-sal.svg"
                alt="SAL"
                width={100}
                height={22}
                className="h-5 w-auto"
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
                alt="SOL"
                width={100}
                height={22}
                className="h-5 w-auto"
              />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
