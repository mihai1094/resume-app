"use client";

import Link from "next/link";
import { appConfig } from "@/config/app";
import { Github, Twitter, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Resume
                </Link>
              </li>
              <li>
                <Link
                  href={appConfig.urls.preview}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preview Templates
                </Link>
              </li>
              <li>
                <Link
                  href="/my-resumes"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Resumes
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
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-3">Connect</h3>
            <div className="flex gap-4">
              <a
                href={appConfig.urls.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href={appConfig.urls.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by {appConfig.author}
          </p>
          <p className="mt-2">
            © {currentYear} {appConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

