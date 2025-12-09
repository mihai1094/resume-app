import nextConfig from "eslint-config-next";

const config = [
  {
    ignores: ["node_modules/**", ".next/**", ".turbo/**"],
  },
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
    },
  },
  {
    files: ["scripts/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
];

export default config;
