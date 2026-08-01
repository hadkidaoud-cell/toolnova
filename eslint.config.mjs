import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const webFiles = ["apps/web/**/*.{ts,tsx}"];

export default [
  ...nextVitals.map((config) => ({ ...config, files: webFiles })),
  ...nextTs.map((config) => ({ ...config, files: webFiles })),
  {
    files: webFiles,
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.turbo/**",
    "**/*.d.ts",
  ]),
];
