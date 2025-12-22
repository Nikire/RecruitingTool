#!/usr/bin/env tsx
/**
 * i18n Hardcoded Text Detector
 *
 * Scans React components for hardcoded text strings that should be using i18n.
 *
 * Usage:
 *   yarn check-i18n                           # Scan all files
 *   yarn check-i18n src/pages/CandidatesPage.tsx  # Scan specific file
 *   yarn check-i18n src/components            # Scan specific directory
 *   yarn check-i18n --format=json             # Output as JSON
 *   yarn check-i18n --format=markdown         # Output as Markdown
 *
 * Options:
 *   --format=console|json|markdown    Output format (default: console)
 *   --help, -h                        Show help message
 */

import * as fs from 'fs';
import * as path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import fg from 'fast-glob';
import chalk from 'chalk';

/**
 * Detection result for a single hardcoded string
 */
interface DetectionResult {
  file: string;
  line: number;
  column: number;
  value: string;
  context: string;
  type: 'jsx-text' | 'jsx-attribute' | 'string-literal';
}

/**
 * Configuration for the detector
 */
interface DetectorConfig {
  // Props to check for hardcoded strings
  targetProps: string[];
  // Patterns to ignore (regex)
  ignorePatterns: RegExp[];
  // File patterns to exclude
  excludePatterns: string[];
  // Minimum string length to report
  minLength: number;
}

const DEFAULT_CONFIG: DetectorConfig = {
  targetProps: [
    'label',
    'placeholder',
    'title',
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'helperText',
    'error',
    'success',
    'warning',
    'info',
    'alt',
    'tooltip',
  ],
  ignorePatterns: [
    /^https?:\/\//i, // URLs
    /^\/[a-z0-9\-_/]+$/i, // Paths
    /^\w+\.(png|jpg|jpeg|gif|svg|webp|pdf|json|csv)$/i, // File names
    /^[A-Z_][A-Z0-9_]*$/i, // Constants (UPPERCASE_SNAKE_CASE)
    /^#[0-9a-f]{3,8}$/i, // Hex colors
    /^[0-9]+(?:\.[0-9]+)?(?:px|em|rem|%|vh|vw)$/i, // CSS units
    /^[\d\s\-+()]+$/i, // Phone numbers and numeric strings
    /^[a-z0-9\-_]+$/i, // CSS class names and IDs (lowercase kebab-case)
    /^\$\{.*\}$/i, // Template literal placeholders
    /^data-[a-z-]+$/i, // Data attributes
    /^aria-[a-z-]+$/i, // ARIA attributes
    /^on[A-Z][a-zA-Z]*$/i, // Event handlers
    /^[A-Z][a-zA-Z0-9]*$/i, // Component names
    /^use[A-Z][a-zA-Z0-9]*$/i, // React hooks
    /^\w+\.\w+$/i, // Property accessors
  ],
  excludePatterns: [
    '**/*.test.tsx',
    '**/*.test.ts',
    '**/*.spec.tsx',
    '**/*.spec.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/*.d.ts',
    '**/vite-env.d.ts',
    '**/e2e/**',
    '**/scripts/**',
  ],
  minLength: 2,
};

/**
 * Check if a string should be ignored
 */
function shouldIgnoreString(value: string, config: DetectorConfig): boolean {
  // Ignore empty strings and single characters
  if (value.length < config.minLength) {
    return true;
  }

  // Ignore strings that match ignore patterns
  return config.ignorePatterns.some((pattern) => pattern.test(value));
}

/**
 * Extract context around a location in source code
 */
function extractContext(source: string, line: number, column: number): string {
  const lines = source.split('\n');
  const targetLine = lines[line - 1];
  if (!targetLine) return '';

  // Get surrounding context (up to 100 chars before and after)
  const start = Math.max(0, column - 50);
  const end = Math.min(targetLine.length, column + 50);
  let context = targetLine.substring(start, end);

  // Add ellipsis if truncated
  if (start > 0) context = '...' + context;
  if (end < targetLine.length) context = context + '...';

  return context.trim();
}

/**
 * Parse a TypeScript/TSX file and detect hardcoded strings
 */
function detectHardcodedStrings(
  filePath: string,
  config: DetectorConfig,
): DetectionResult[] {
  const results: DetectionResult[] = [];

  try {
    const source = fs.readFileSync(filePath, 'utf-8');

    // Parse the file into an AST
    const ast = parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    // Traverse the AST
    traverse(ast, {
      // JSX Text (e.g., <Button>Submit</Button>)
      JSXText(path) {
        const value = path.node.value.trim();
        if (value && !shouldIgnoreString(value, config)) {
          const { line, column } = path.node.loc?.start || { line: 0, column: 0 };
          results.push({
            file: filePath,
            line,
            column,
            value,
            context: extractContext(source, line, column),
            type: 'jsx-text',
          });
        }
      },

      // JSX Attributes (e.g., placeholder="Enter name")
      JSXAttribute(path) {
        const attributeName = path.node.name.name as string;

        // Check if this is a prop we care about
        if (!config.targetProps.includes(attributeName)) {
          return;
        }

        // Check if the value is a string literal
        if (path.node.value?.type === 'StringLiteral') {
          const value = path.node.value.value;
          if (!shouldIgnoreString(value, config)) {
            const { line, column } = path.node.value.loc?.start || { line: 0, column: 0 };
            results.push({
              file: filePath,
              line,
              column,
              value,
              context: extractContext(source, line, column),
              type: 'jsx-attribute',
            });
          }
        }
      },

      // String literals in object properties (e.g., toast.success('Saved'))
      CallExpression(path) {
        // Check for toast.success/error/info/warning calls
        if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.object.type === 'Identifier' &&
          path.node.callee.object.name === 'toast' &&
          path.node.callee.property.type === 'Identifier' &&
          ['success', 'error', 'info', 'warning'].includes(path.node.callee.property.name)
        ) {
          const firstArg = path.node.arguments[0];
          if (firstArg?.type === 'StringLiteral') {
            const value = firstArg.value;
            if (!shouldIgnoreString(value, config)) {
              const { line, column } = firstArg.loc?.start || { line: 0, column: 0 };
              results.push({
                file: filePath,
                line,
                column,
                value,
                context: extractContext(source, line, column),
                type: 'string-literal',
              });
            }
          }
        }
      },
    });
  } catch (error) {
    console.error(chalk.red(`Failed to parse ${filePath}:`), error);
  }

  return results;
}

/**
 * Get files to scan
 */
async function getFilesToScan(
  targetPath?: string,
  config: DetectorConfig = DEFAULT_CONFIG,
): Promise<string[]> {
  const cwd = process.cwd();

  let pattern: string;

  if (targetPath) {
    const resolvedPath = path.resolve(cwd, targetPath);
    const stats = fs.existsSync(resolvedPath) ? fs.statSync(resolvedPath) : null;

    if (stats?.isDirectory()) {
      pattern = path.join(targetPath, '**/*.{ts,tsx}');
    } else if (stats?.isFile()) {
      return [resolvedPath];
    } else {
      // Treat as glob pattern
      pattern = targetPath;
    }
  } else {
    // Default: scan all src files
    pattern = 'src/**/*.{ts,tsx}';
  }

  const files = await fg(pattern, {
    cwd,
    ignore: config.excludePatterns,
    absolute: true,
  });

  return files;
}

/**
 * Format results as console output (colored)
 */
function formatConsole(results: DetectionResult[]): void {
  if (results.length === 0) {
    console.log(chalk.green('\n✅ No hardcoded strings found!\n'));
    return;
  }

  console.log(chalk.yellow(`\n⚠️  Found ${results.length} hardcoded string(s):\n`));

  // Group by file
  const byFile = results.reduce((acc, result) => {
    if (!acc[result.file]) acc[result.file] = [];
    acc[result.file].push(result);
    return acc;
  }, {} as Record<string, DetectionResult[]>);

  for (const [file, fileResults] of Object.entries(byFile)) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(chalk.cyan(`\n📄 ${relativePath}`));
    console.log(chalk.gray('─'.repeat(80)));

    for (const result of fileResults) {
      console.log(
        chalk.gray(`  Line ${result.line}:${result.column} `) +
        chalk.white(`[${result.type}]`),
      );
      console.log(chalk.yellow(`    "${result.value}"`));
      console.log(chalk.gray(`    ${result.context}`));
      console.log();
    }
  }

  console.log(chalk.yellow(`\n⚠️  Total: ${results.length} hardcoded string(s) found\n`));
  console.log(chalk.blue('💡 Tip: Use the useTranslation() hook and t() function for i18n\n'));
}

/**
 * Format results as JSON
 */
function formatJSON(results: DetectionResult[]): void {
  const output = {
    summary: {
      total: results.length,
      files: [...new Set(results.map((r) => r.file))].length,
    },
    results: results.map((r) => ({
      ...r,
      file: path.relative(process.cwd(), r.file),
    })),
  };

  console.log(JSON.stringify(output, null, 2));
}

/**
 * Format results as Markdown
 */
function formatMarkdown(results: DetectionResult[]): void {
  console.log('# i18n Hardcoded Strings Report\n');
  console.log(`**Total:** ${results.length} hardcoded string(s) found\n`);

  if (results.length === 0) {
    console.log('✅ No hardcoded strings found!\n');
    return;
  }

  // Group by file
  const byFile = results.reduce((acc, result) => {
    if (!acc[result.file]) acc[result.file] = [];
    acc[result.file].push(result);
    return acc;
  }, {} as Record<string, DetectionResult[]>);

  for (const [file, fileResults] of Object.entries(byFile)) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`## ${relativePath}\n`);
    console.log(`Found ${fileResults.length} hardcoded string(s):\n`);
    console.log('| Line | Type | Value | Context |');
    console.log('|------|------|-------|---------|');

    for (const result of fileResults) {
      const escapedValue = result.value.replace(/\|/g, '\\|');
      const escapedContext = result.context.replace(/\|/g, '\\|');
      console.log(
        `| ${result.line}:${result.column} | ${result.type} | \`${escapedValue}\` | \`${escapedContext}\` |`,
      );
    }

    console.log();
  }

  console.log('## Recommendations\n');
  console.log('1. Use the `useTranslation()` hook from `react-i18next`');
  console.log('2. Replace hardcoded strings with `t(\'key\')`');
  console.log('3. Add translation keys to `src/locales/en.json` and `src/locales/es.json`');
  console.log('4. For toast messages, use `t()` inside the toast call: `toast.success(t(\'key\'))`\n');
}

/**
 * Parse command line arguments
 */
function parseArgs(): {
  targetPath?: string;
  format: 'console' | 'json' | 'markdown';
  showHelp: boolean;
} {
  const args = process.argv.slice(2);

  const result = {
    targetPath: undefined as string | undefined,
    format: 'console' as 'console' | 'json' | 'markdown',
    showHelp: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      result.showHelp = true;
    } else if (arg.startsWith('--format=')) {
      const format = arg.split('=')[1];
      if (format === 'console' || format === 'json' || format === 'markdown') {
        result.format = format;
      } else {
        console.error(chalk.red(`Invalid format: ${format}`));
        process.exit(1);
      }
    } else if (!arg.startsWith('--')) {
      result.targetPath = arg;
    }
  }

  return result;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
${chalk.bold('i18n Hardcoded Text Detector')}

Scans React components for hardcoded text strings that should be using i18n.

${chalk.bold('Usage:')}
  yarn check-i18n [path] [options]

${chalk.bold('Examples:')}
  yarn check-i18n                              # Scan all files in src/
  yarn check-i18n src/pages/CandidatesPage.tsx # Scan specific file
  yarn check-i18n src/components               # Scan specific directory
  yarn check-i18n --format=json                # Output as JSON
  yarn check-i18n --format=markdown            # Output as Markdown

${chalk.bold('Options:')}
  --format=console|json|markdown    Output format (default: console)
  --help, -h                        Show this help message

${chalk.bold('What it detects:')}
  - JSX text content: ${chalk.yellow('<Button>Submit</Button>')}
  - String props: ${chalk.yellow('placeholder="Enter name"')}
  - Toast messages: ${chalk.yellow('toast.success("Saved!")')}
  - Common UI props: label, title, aria-label, helperText, etc.

${chalk.bold('What it ignores:')}
  - Import statements and type definitions
  - Console logs and comments
  - URLs, file paths, and CSS class names
  - Empty strings and single characters
  - Constants (UPPERCASE_SNAKE_CASE)
  - Test files

${chalk.bold('How to fix:')}
  1. Import useTranslation hook:
     ${chalk.cyan('import { useTranslation } from \'react-i18next\';')}

  2. Use the hook in your component:
     ${chalk.cyan('const { t } = useTranslation();')}

  3. Replace hardcoded strings:
     ${chalk.red('<Button>Submit</Button>')}
     ${chalk.green('<Button>{t(\'common.submit\')}</Button>')}

  4. Add translations to locale files:
     ${chalk.cyan('src/locales/en.json')} and ${chalk.cyan('src/locales/es.json')}
`);
}

/**
 * Main execution
 */
async function main() {
  const { targetPath, format, showHelp } = parseArgs();

  if (showHelp) {
    printHelp();
    process.exit(0);
  }

  try {
    console.log(chalk.blue('\n🔍 Scanning for hardcoded strings...\n'));

    const files = await getFilesToScan(targetPath, DEFAULT_CONFIG);

    if (files.length === 0) {
      console.log(chalk.yellow('⚠️  No files found to scan'));
      process.exit(0);
    }

    console.log(chalk.gray(`Found ${files.length} file(s) to scan\n`));

    const allResults: DetectionResult[] = [];

    for (const file of files) {
      const results = detectHardcodedStrings(file, DEFAULT_CONFIG);
      allResults.push(...results);
    }

    // Format output
    switch (format) {
      case 'json':
        formatJSON(allResults);
        break;
      case 'markdown':
        formatMarkdown(allResults);
        break;
      case 'console':
      default:
        formatConsole(allResults);
        break;
    }

    // Exit with error code if hardcoded strings found
    process.exit(allResults.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    process.exit(1);
  }
}

// Execute
main();
