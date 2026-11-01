import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// The shared config names file patterns only for TypeScript, and by default
// ESLint 9 lints only .js, .mjs and .cjs files; the components are .jsx.
const eslintConfig = [{ files: ["**/*.{js,jsx}"] }, ...compat.extends("next/core-web-vitals")];

export default eslintConfig;
