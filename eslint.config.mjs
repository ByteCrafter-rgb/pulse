import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/storybook-static/**", "**/.turbo/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    // The UI library must stay presentational: data and callbacks come in through props.
    files: ["packages/ui/src/**/*.{ts,tsx}"],
    ignores: ["packages/ui/src/**/*.stories.tsx", "packages/ui/src/**/*.test.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@pulse/*", "!@pulse/shared"],
              message: "packages/ui may only depend on @pulse/shared types.",
            },
            { group: ["next", "next/*"], message: "No routers in packages/ui." },
            {
              group: ["@tanstack/*", "zustand", "zustand/*"],
              message: "No data or state libraries in packages/ui.",
            },
            {
              group: ["graphql*", "urql", "@apollo/*", "axios"],
              message: "No API clients in packages/ui.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "Components receive data via props; fetching belongs to the app.",
        },
        { name: "localStorage", message: "Persistence belongs to the app." },
      ],
    },
  },
);
