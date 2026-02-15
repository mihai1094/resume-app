import Link from "next/link";
import { appConfig } from "@/config/app";

// Server Component - no "use client" needed
// Static content that doesn't require client-side interactivity

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">{appConfig.name}</h3>
            <p className="text-sm text-muted-foreground">
              {appConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={appConfig.urls.create}
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Create Resume
                </Link>
              </li>
              <li>
                <Link
                  href={appConfig.urls.preview}
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Preview Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  My Resumes
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Career Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/how-to-pass-ats-screening"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  ATS Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/blog/ai-resume-optimization-guide"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  AI Resume Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <a
                  href="https://anpc.ro/ce-este-sal/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  ADR (SAL) - Romania
                </a>
              </li>
              <li>
                <a
                  href="https://consumer-redress.ec.europa.eu/dispute-resolution-bodies_en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  EU ADR Bodies
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${appConfig.supportEmail}`}
                  className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-block"
                >
                  Get Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ANPC / SOL badges */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
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
                className="h-10 w-auto"
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
                className="h-10 w-auto"
                loading="lazy"
              />
            </a>
          </div>

          {/* Company legal info */}
          <div className="text-center text-xs text-muted-foreground space-y-1 mb-6">
            <p>
              {appConfig.company.legalName} &middot; Tax ID (CUI): {appConfig.company.cui} &middot; Trade Register No.: {appConfig.company.regCom}
            </p>
            <p>
              {appConfig.company.address} &middot;{" "}
              <a href={`mailto:${appConfig.company.email}`} className="hover:text-foreground">
                {appConfig.company.email}
              </a>
            </p>
            <p>
              GDPR supervisory authority:{" "}
              <a
                href="https://www.dataprotection.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                ANSPDCP
              </a>
              {" "}&middot;{" "}
              <a
                href="https://anpc.ro"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
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
