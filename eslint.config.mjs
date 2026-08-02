import { globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const webFiles = ["apps/web/**/*.{ts,tsx}"];
const adminFiles = ["apps/admin/**/*.{ts,tsx}"];
const libFiles = [
  "apps/api/**/*.ts",
  "packages/**/*.{ts,tsx}",
];

const appFiles = [...webFiles, ...adminFiles];

export default [
  ...nextVitals.map((config) => ({ ...config, files: webFiles })),
  ...nextTs.map((config) => ({ ...config, files: webFiles })),
  ...nextVitals.map((config) => ({ ...config, files: adminFiles })),
  ...nextTs.map((config) => ({ ...config, files: adminFiles })),
  {
    files: appFiles,
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/set-state-in-render": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "off",
    },
  },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: libFiles })),
  {
    files: libFiles,
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
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
    "**/generated/**",
  ]),
];
