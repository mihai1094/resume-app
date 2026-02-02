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
];

export default config;
