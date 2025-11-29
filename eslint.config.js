// eslint.config.mjs
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Optional: ignore build output, etc.
  {
    ignores: ["dist/**"],
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      // replaces env: { browser: true }
      globals: {
        window: "readonly",
        document: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // eslint:recommended
      ...js.configs.recommended.rules,

      // plugin:@typescript-eslint/recommended
      ...tsPlugin.configs.recommended.rules,

      // plugin:react-hooks/recommended
      ...reactHooks.configs.recommended.rules,

      // your custom rules
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "react-refresh/only-export-components": "warn",
    },
  },
];