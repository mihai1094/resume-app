const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    lockDistDir: false,
  },

  // Exclude build artefacts and build-time-only packages from serverless
  // function bundles to stay under Vercel's 250 MB unzipped limit.
  outputFileTracingExcludes: {
    "**": [
      // Webpack build cache (can be 500 MB+) — never needed at runtime
      ".next/cache/**",
      // Turbopack dev artefacts
      ".next/dev/**",
      // Next.js SWC compiler native binaries (build-time only)
      "**/@next/swc-*/**",
      // Sentry CLI binaries (build-time only — source-map upload)
      "**/@sentry/cli*/**",
      "**/sentry-cli-*/**",
      // Sharp native image-processing (Vercel handles image optimisation externally)
      "**/@img/sharp-*/**",
      "**/sharp/build/**",
      // Dev / test tooling
      "**/typescript/lib/**",
      "**/playwright-core/**",
      "**/@playwright/**",
      "**/webpack/lib/**",
      "**/@esbuild/**",
      "**/esbuild/bin/**",
    ],
  },
  outputFileTracingIncludes: {
    "/api/user/export-pdf": [
      "./public/pdf-styles.css",
      "./public/fonts/pdf/**/*",
    ],
    "/api/public/[username]/[slug]/download": [
      "./public/pdf-styles.css",
      "./public/fonts/pdf/**/*",
    ],
  },

  // Configure Turbopack to handle pako module resolution
  turbopack: {
    root: __dirname,
    resolveExtensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".mjs"],
  },

  transpilePackages: [],

  // Mark server-only packages as externals to prevent client bundle leakage
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium-min",
    "firebase-admin",
  ],

  // Security Headers
  // Note: Content-Security-Policy is set dynamically per-request in middleware.ts
  // using a nonce to eliminate 'unsafe-inline' from script-src in production.
  async headers() {
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
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
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
const configWithSentry = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

module.exports = withBundleAnalyzer(configWithSentry);
