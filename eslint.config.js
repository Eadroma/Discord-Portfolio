import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

// `npm run lint` runs with --max-warnings 0: a warning fails CI like an error.
export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      eqeqeq: ['error', 'smart'],
      'no-console': ['error', { allow: ['error', 'warn'] }],
      // Numbers in template strings are fine; objects and undefined are not.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // `onClick={() => setOpen(false)}` is idiomatic React.
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },
  {
    files: ['src/**/*.tsx'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
    ],
    settings: { react: { version: 'detect' } },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      'react/prop-types': 'off', // TypeScript checks props
      'react/button-has-type': 'error',
      'react/jsx-no-target-blank': 'error',
      'no-restricted-syntax': [
        'error',
        // The site is bilingual: visible or spoken text must come from t() and the locale files.
        {
          selector: 'JSXText[value=/[A-Za-z]{2}/]',
          message: 'Hardcoded UI text: use t() and add the key to both locale files.',
        },
        {
          selector:
            'JSXAttribute[name.name=/^(alt|title|placeholder|aria-label)$/] > Literal[value=/[A-Za-z]/]',
          message: 'Hardcoded UI text in an attribute: use t() (or alt="" for a decorative image).',
        },
        {
          selector: "CallExpression[callee.object.name='toast'] > Literal",
          message: 'Hardcoded toast text: use t().',
        },
        // One theme: colors come from the tokens in src/index.css, so light and dark stay in sync.
        {
          selector:
            'JSXAttribute[name.name="className"] :matches(Literal[value=/#[0-9a-fA-F]{3,8}\\b/], TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/])',
          message:
            'Hex color in className: use a theme token (bg-card, text-muted-foreground…) from src/index.css.',
        },
        {
          selector:
            'JSXAttribute[name.name="className"] :matches(Literal[value=/\\b(gray|slate|zinc|neutral|stone)-\\d/], TemplateElement[value.raw=/\\b(gray|slate|zinc|neutral|stone)-\\d/])',
          message: 'Tailwind gray scale in className: use a theme token from src/index.css.',
        },
      ],
    },
  },
  {
    // Server function, build config and the lint config itself run in Node.
    files: ['api/**/*.ts', 'vite.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      // Tests read loosely typed mock data (fetch mock calls, parsed JSON).
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
  { files: ['eslint.config.js'], extends: [tseslint.configs.disableTypeChecked] },
);
