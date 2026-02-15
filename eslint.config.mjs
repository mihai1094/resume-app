import nextConfig from "eslint-config-next";

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".turbo/**",
      "public/**",
      "list-models.js",
      "test-*.js",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      // Prevent console.log in production code
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["scripts/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      // Allow console in scripts
      "no-console": "off",
    },
  },
  {
    // @react-pdf/renderer's <Image> component doesn't support the alt prop
    files: ["components/resume/templates/pdf/**"],
    rules: {
      "jsx-a11y/alt-text": "off",
    },
  },
];

export default config;
