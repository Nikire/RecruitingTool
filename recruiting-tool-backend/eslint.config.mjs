// @ts-check
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * ESLint 9 flat config. Replaces the EOL `.eslintrc.js` (ESLint 8) and puts the
 * backend on the same ESLint major as the frontend.
 *
 * Deliberately a like-for-like port of the old `.eslintrc.js`: the same two
 * presets (`@typescript-eslint/recommended` + `prettier/recommended`) and the
 * same three rule overrides. Widening the ruleset is a separate decision from
 * migrating the config format, and mixing the two would make it impossible to
 * tell a real new finding from a migration artifact.
 */
export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**', 'coverage/**', 'prisma/migrations/**', 'scripts/**', 'check-users.js'],
  },
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Carried over verbatim from the old .eslintrc.js.
      // (`@typescript-eslint/interface-name-prefix` was also disabled there; it
      // was removed from typescript-eslint in v5 and referencing it under
      // ESLint 9 is a hard config error, so it is dropped rather than ported.)
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      // --- typescript-eslint v7 -> v8 default drift, pinned back to v7 ------
      // Both of the following fire ONLY because the plugin changed its own
      // defaults, not because any source file changed. Pinning them keeps this
      // commit a pure config-format migration; loosening or tightening the
      // ruleset is a separate, deliberate change.

      // v8 flipped `caughtErrors` from 'none' to 'all', which turns every
      // `catch (error) { /* error unused */ }` into an error. That is 7 real
      // sites today, all of them `catch` params that the handler genuinely does
      // not read:
      //   modules/ai-quota/ai-quota.service.ts:78
      //   modules/company/company.service.ts:50
      //   modules/feature-flags/feature-flags.service.ts:23
      //   modules/shared/modules/auth/auth.service.ts:208
      //   modules/shared/modules/auth/guards/auth.guard.ts:39
      //   modules/shared/modules/auth/guards/flexible-auth.guard.ts:30
      //   modules/shared/modules/database/database.service.ts:68
      // Unused *variables* are still errors; only unused catch bindings are
      // exempt. Drop this option once those seven are renamed or removed.
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none' }],

      // v8 replaced `no-var-requires` with `no-require-imports`. Two lazy
      // requires already carry an explicit
      // `// eslint-disable-next-line @typescript-eslint/no-var-requires`, so
      // the intent is on record - the rename simply orphaned those comments.
      // Allow exactly those two module paths instead of disabling the rule, so
      // any NEW require() still errors.
      //   modules/ai/scoring.service.ts:511      -> mammoth
      //   modules/export/export.service.ts:347   -> pdfmake/build/vfs_fonts
      '@typescript-eslint/no-require-imports': ['error', { allow: ['^mammoth$', 'pdfmake/build/vfs_fonts$'] }],
    },
  },
  {
    // Third and last piece of v7 -> v8 drift, and the only one that needs a
    // file-scoped escape hatch. v8's `no-unused-vars` started reporting values
    // that are "only used as a type", which false-positives on the standard
    // `as const` + `(typeof X)[number]` idiom: the runtime array MUST exist for
    // the type to be derivable, so it is not dead code.
    // Narrowed to the single identifier rather than the file or the rule.
    // Remove once typescript-eslint stops flagging this idiom, or once the
    // union is written out by hand.
    files: ['src/modules/feature-flags/feature-flags.service.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { caughtErrors: 'none', varsIgnorePattern: '^FEATURE_KEYS$' }],
    },
  },
);
