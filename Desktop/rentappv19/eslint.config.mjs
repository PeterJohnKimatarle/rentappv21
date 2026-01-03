import globals from "globals";
import js from "@eslint/js";
import typescriptEslintParser from "@typescript-eslint/parser";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

export default [
  {
    // Base ESLint rules
    ...js.configs.recommended,
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // Basic JS/TS rules
      "no-unused-vars": "warn",
      "no-undef": "off", // Handled by TypeScript
      
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // React rules
      "react/react-in-jsx-scope": "off", // Next.js handles this
      "react/jsx-uses-react": "off", // Next.js handles this

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js specific rules
      ...nextPlugin.configs.recommended.rules,
      // JSX-a11y rules
      ...jsxA11yPlugin.configs.recommended.rules,
    },
  },
  // Ignores
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];
