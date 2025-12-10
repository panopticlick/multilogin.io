import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Relax rules for content-heavy pages (blog posts, marketing copy)
  {
    files: [
      "src/app/(marketing)/blog/**/*.tsx",
      "src/app/(marketing)/docs/**/*.tsx",
      "src/app/(marketing)/features/**/*.tsx",
      "src/app/(marketing)/pricing/**/*.tsx",
      "src/app/(marketing)/changelog/**/*.tsx",
      "src/app/(marketing)/contact/**/*.tsx",
    ],
    rules: {
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  // Allow standard <a> tags for external links and anchor links in content
  {
    files: ["src/app/(marketing)/**/*.tsx"],
    rules: {
      "@next/next/no-html-link-for-pages": "warn",
    },
  },
]);

export default eslintConfig;
