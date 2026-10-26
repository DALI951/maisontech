import next from "eslint-config-next/core-web-vitals";

/**
 * Flat ESLint config.
 *
 * Two Next.js defaults are relaxed on purpose:
 * - `react/no-unescaped-entities`: the whole UI is French, so apostrophes appear
 *   in most JSX text nodes. Escaping every one of them hurts readability and
 *   changes nothing in the rendered output.
 * - `react-hooks/set-state-in-effect`: hydration from localStorage and the
 *   fetch-on-mount patterns necessarily call setState inside an effect. They are
 *   reported as warnings so new occurrences stay visible.
 */
const config = [
  {
    ignores: [".next/**", "node_modules/**", ".data/**", "next-env.d.ts", "tsconfig.tsbuildinfo"],
  },
  ...next,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["tests/**/*.mjs", "scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        fetch: "readonly",
        URL: "readonly",
      },
    },
  },
];

export default config;
