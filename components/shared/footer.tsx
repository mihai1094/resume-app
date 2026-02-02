import Link from "next/link";
import { appConfig } from "@/config/app";
import { Github, Heart } from "lucide-react";

// Server Component - no "use client" needed
// Static content that doesn't require client-side interactivity

export function Footer() {
  // Use a fixed year or build-time year for Server Component
  const currentYear = new Date().getFullYear();

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
              {appConfig.urls.github && (
                <li>
                  <a
                    href={appConfig.urls.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="order-2 md:order-1">
              © {currentYear} {appConfig.name}. All rights reserved.
            </p>
            <p className="flex items-center gap-2 order-1 md:order-2">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by{" "}
              {appConfig.author}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
