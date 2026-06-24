import nextConfig from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: ["node_modules/", ".next/", "src/prisma/generated/"],
  },
];

export default eslintConfig;
