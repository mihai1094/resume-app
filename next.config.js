const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use Turbopack for faster builds
  turbopack: {
    root: __dirname,
  },

  // Security Headers
  async headers() {
    // Content Security Policy
    // Note: 'unsafe-inline' and 'unsafe-eval' needed for Next.js in development
    // In production, you may want to use nonces or hashes for stricter CSP
    const cspHeader = [
      "default-src 'self'",
      // Scripts: Allow self, inline (for Next.js), and eval in dev
      process.env.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com"
        : "script-src 'self' 'unsafe-inline' https://apis.google.com",
      // Styles: Allow self and inline styles (for styled-components/tailwind)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Images: Allow self, data URIs, and blob URLs (for PDF preview)
      "img-src 'self' data: blob: https:",
      // Fonts: Allow self and Google Fonts
      "font-src 'self' https://fonts.gstatic.com",
      // Connections: Allow API calls
      "connect-src 'self' https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://generativelanguage.googleapis.com https://*.sentry.io wss://*.firebaseio.com",
      // Frames: Allow Firebase auth iframe
      "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
      // Object: Disable plugins
      "object-src 'none'",
      // Base URI: Restrict to self
      "base-uri 'self'",
      // Form actions: Restrict to self
      "form-action 'self'",
      // Frame ancestors: Prevent clickjacking
      "frame-ancestors 'self'",
      // Block mixed content
      "block-all-mixed-content",
      // Upgrade insecure requests
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically annotate React components to show their full name in breadcrumbs and session replay
  reactComponentAnnotation: {
    enabled: true,
  },

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
};

// Only wrap with Sentry if DSN is configured
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
