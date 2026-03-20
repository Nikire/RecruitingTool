#!/usr/bin/env node
/**
 * i18n Hardcoded Text Detector
 *
 * Scans React components for hardcoded text strings that should be using i18n.
 * Uses only Node.js built-ins — no external dependencies required.
 *
 * Usage:
 *   node scripts/check-i18n.mjs                        # Scan all src/ files
 *   node scripts/check-i18n.mjs src/pages/Foo.tsx      # Scan specific file
 *   node scripts/check-i18n.mjs src/pages              # Scan specific dir
 *   node scripts/check-i18n.mjs --format=json          # JSON output
 *   node scripts/check-i18n.mjs --format=markdown      # Markdown output
 *   node scripts/check-i18n.mjs --help                 # Show help
 *
 * Exit codes:
 *   0 — No violations found
 *   1 — Violations found (or error)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * JSX props to check for hardcoded string values.
 */
const TARGET_PROPS = new Set([
  'label',
  'placeholder',
  'title',
  'helperText',
  'tooltip',
  'alt',
  'aria-label',
  'aria-describedby',
  'description',
  'buttonText',
  'emptyText',
  'noOptionsText',
  'loadingText',
  'errorText',
  'successText',
  'warningText',
  'infoText',
  'confirmText',
  'cancelText',
  'submitText',
  'header',
  'subheader',
  'message',
  'hint',
  'caption',
]);

/**
 * CSS-only values that are not translatable strings.
 */
const CSS_VALUES = new Set([
  'flex', 'block', 'inline', 'inline-block', 'inline-flex', 'grid', 'inline-grid',
  'none', 'auto', 'hidden', 'visible', 'scroll', 'clip', 'initial', 'inherit', 'unset',
  'row', 'row-reverse', 'column', 'column-reverse',
  'center', 'left', 'right', 'start', 'end', 'stretch',
  'wrap', 'nowrap', 'wrap-reverse',
  'normal', 'bold', 'bolder', 'lighter',
  'solid', 'dashed', 'dotted', 'double',
  'relative', 'absolute', 'fixed', 'sticky', 'static',
  'contain', 'cover', 'fill', 'scale-down',
  'pointer', 'default', 'text', 'move', 'not-allowed', 'grab', 'grabbing',
  'uppercase', 'lowercase', 'capitalize', 'none',
  'ltr', 'rtl',
  'transparent', 'currentColor', 'inherit',
  'break-word', 'break-all', 'keep-all', 'normal',
  'ellipsis', 'clip',
  'top', 'bottom', 'middle', 'baseline',
  'space-between', 'space-around', 'space-evenly',
  'pre', 'pre-wrap', 'pre-line', 'break-spaces',
  'underline', 'overline', 'line-through',
  'outlined', 'contained', 'text', 'filled', 'standard',
  'small', 'medium', 'large',
  'primary', 'secondary', 'success', 'error', 'warning', 'info', 'default',
  'horizontal', 'vertical',
  'circular', 'rectangular', 'rounded', 'wave',
  'determinate', 'indeterminate', 'buffer', 'query',
  'checkbox', 'radio', 'switch',
  'asc', 'desc',
  'dense', 'normal',
  'date', 'datetime-local', 'time', 'month', 'week',
  'number', 'text', 'email', 'password', 'tel', 'url', 'search', 'color',
  'button', 'submit', 'reset',
]);

/**
 * i18n key pattern: lowercase words separated by dots, e.g. "common.cancel"
 * Also accepts camelCase segments like "hiringProcess.addNote"
 */
const I18N_KEY_RE = /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/;

/**
 * Patterns for strings that are definitely not translatable text.
 */
const IGNORE_PATTERNS = [
  /^https?:\/\//i,                          // URLs
  /^\/[a-zA-Z0-9\-_/]+$/,                  // Route paths
  /^\w+\.(png|jpg|jpeg|gif|svg|webp|pdf|csv|json|woff|woff2|ttf|eot)$/i, // File refs
  /^#[0-9a-fA-F]{3,8}$/,                   // Hex colors
  /^rgb[a]?\(/i,                            // rgb/rgba colors
  /^hsl[a]?\(/i,                            // hsl/hsla colors
  /^[0-9]+(?:\.[0-9]+)?(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|fr|deg|rad|turn|ms|s)?$/, // CSS numbers
  /^[0-9]+$/,                              // Pure numbers
  /^\$\{/,                                 // Template literal starts
  /^data-[a-z]/,                           // data attributes
  /^aria-[a-z]/,                           // aria attributes
  /^on[A-Z]/,                              // event handlers
  /^[A-Z][A-Z0-9_]+$/,                     // ALL_CAPS constants
  /^[A-Z][a-zA-Z0-9]+$/,                   // PascalCase (component names)
  /^use[A-Z]/,                             // React hooks
  /^\w+\.\w+\(/,                           // Method calls
  /^@/,                                    // Decorators / email starting with @
  /^[+\-*/%<>=!&|^~?:,;[\]{}()]+$/,       // Pure operators/symbols
  /^application\/|^text\/|^image\//i,      // MIME types
  /^[a-z]{1,2}$/,                          // Single/two-char technical values
  /^(true|false|null|undefined|NaN|Infinity)$/,  // JS keywords
  /^[_$][a-zA-Z0-9_$]*$/,                 // Private/special identifiers
  /^\d{4}-\d{2}-\d{2}/,                   // Date strings
  /^[a-f0-9]{8}-[a-f0-9]{4}-/i,          // UUIDs
];

// Files and directories to exclude from scanning
const EXCLUDE_DIRS = new Set(['node_modules', 'dist', 'build', '.vite', 'coverage', 'e2e', '__snapshots__']);
const EXCLUDE_FILES = new Set(['.d.ts', '.test.tsx', '.test.ts', '.spec.tsx', '.spec.ts', 'vite-env.d.ts']);

// ---------------------------------------------------------------------------
// File walker (no external deps)
// ---------------------------------------------------------------------------

/**
 * Recursively collect .ts and .tsx files from a directory.
 */
function collectFiles(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        collectFiles(fullPath, files);
      }
    } else if (entry.isFile()) {
      const name = entry.name;
      // Must end with .ts or .tsx
      if (!name.endsWith('.ts') && !name.endsWith('.tsx')) continue;
      // Skip excluded file suffixes
      if (EXCLUDE_FILES.has(name) || EXCLUDE_FILES.has('.' + name.split('.').slice(1).join('.'))) continue;
      // Skip .d.ts
      if (name.endsWith('.d.ts')) continue;
      // Skip test files
      if (name.includes('.test.') || name.includes('.spec.')) continue;
      files.push(fullPath);
    }
  }

  return files;
}

// ---------------------------------------------------------------------------
// String classification helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the string should be ignored (not a translatable violation).
 */
function shouldIgnore(value) {
  const trimmed = value.trim();

  // Empty or too short
  if (trimmed.length < 3) return true;

  // No letters at all
  if (!/[a-zA-Z]/.test(trimmed)) return true;

  // Single word all lowercase — likely a technical/CSS value
  if (CSS_VALUES.has(trimmed.toLowerCase())) return true;

  // Looks like an i18n key
  if (I18N_KEY_RE.test(trimmed)) return true;

  // Matches any ignore pattern
  if (IGNORE_PATTERNS.some((re) => re.test(trimmed))) return true;

  // Pure kebab-case or snake_case technical identifier (no spaces, all lowercase)
  if (/^[a-z][a-z0-9\-_]*$/.test(trimmed) && trimmed.length < 30) return true;

  // camelCase identifiers (no spaces, starts lowercase)
  if (/^[a-z][a-zA-Z0-9]+$/.test(trimmed) && !/\s/.test(trimmed) && trimmed.length < 25) return true;

  // Looks like a format string or template key only
  if (/^\{[^}]+\}$/.test(trimmed)) return true;

  return false;
}

/**
 * Returns true if the string looks like human-readable text (potential violation).
 * The string must have at least one word with 2+ letters, and either:
 *  - Contains a space (multi-word), or
 *  - Starts with an uppercase letter (sentence/label), or
 *  - Is a common English word that fits in a UI label
 */
function isHumanReadable(value) {
  const trimmed = value.trim();

  // Must have real letters
  if (!/[a-zA-Z]{2,}/.test(trimmed)) return false;

  // Multi-word strings are almost certainly human text
  if (/\s/.test(trimmed)) return true;

  // Starts with uppercase — likely a label/button/heading
  if (/^[A-Z][a-z]/.test(trimmed)) return true;

  // All uppercase short string without underscores — might be acronym label
  if (/^[A-Z]{2,}$/.test(trimmed) && trimmed.length <= 5) return true;

  return false;
}

// ---------------------------------------------------------------------------
// Per-file detection using regex heuristics
// ---------------------------------------------------------------------------

/**
 * Detection result for a single violation.
 * @typedef {{ file: string, line: number, col: number, value: string, type: string }} Violation
 */

/**
 * Check if a line is inside a comment block.
 * We track block comment state across lines.
 */

/**
 * Scan a file's source and return violations.
 * @param {string} filePath
 * @returns {Array<{file: string, line: number, col: number, value: string, type: string}>}
 */
function scanFile(filePath) {
  let source;
  try {
    source = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }

  const violations = [];
  const lines = source.split('\n');

  let inBlockComment = false;
  let inTemplateLiteral = false;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    let line = lines[i];

    // Track block comments
    if (inBlockComment) {
      if (line.includes('*/')) {
        inBlockComment = false;
        line = line.slice(line.indexOf('*/') + 2);
      } else {
        continue;
      }
    }

    // Check for block comment start
    if (line.includes('/*')) {
      const before = line.slice(0, line.indexOf('/*'));
      if (!line.includes('*/') || line.indexOf('*/') < line.indexOf('/*')) {
        inBlockComment = true;
        line = before;
      }
    }

    // Skip pure single-line comments
    const trimmedLine = line.trimStart();
    if (trimmedLine.startsWith('//')) continue;

    // Strip inline single-line comments (outside strings — approximation)
    // We do this simply: remove everything after // that's not inside a string
    // This is a heuristic; perfect would need a real parser
    const lineWithoutComment = stripInlineComment(line);

    // --- 1. JSX text nodes ---
    // Look for text content between JSX tags that is not a {expression}
    // Pattern: >(text content)<  or starts with >text on a line
    // We look for lines where significant human-readable text appears outside {}
    checkJSXText(filePath, lineWithoutComment, lineNum, violations);

    // --- 2. JSX attribute string values ---
    // Pattern: propName="value" or propName='value'
    checkJSXAttributes(filePath, lineWithoutComment, lineNum, violations);

    // --- 3. toast() calls with string literals ---
    checkToastCalls(filePath, lineWithoutComment, lineNum, violations);
  }

  return violations;
}

/**
 * Strip inline // comment from a line (naive — doesn't handle strings perfectly,
 * but good enough for our heuristic scanning).
 */
function stripInlineComment(line) {
  // Find // that is not inside a string
  let inStr = false;
  let strChar = '';
  for (let i = 0; i < line.length - 1; i++) {
    const ch = line[i];
    if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
      inStr = true;
      strChar = ch;
    } else if (inStr && ch === strChar && line[i - 1] !== '\\') {
      inStr = false;
    } else if (!inStr && ch === '/' && line[i + 1] === '/') {
      return line.slice(0, i);
    }
  }
  return line;
}

/**
 * Extract string literals from a line using a simple state machine.
 * Returns [{value, col}] for each string found.
 * Handles single-quote, double-quote strings (not template literals).
 */
function extractStringLiterals(line) {
  const results = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let value = '';
      let col = i;
      i++;
      while (i < line.length) {
        const c = line[i];
        if (c === '\\') {
          i += 2; // skip escape
          continue;
        }
        if (c === quote) {
          i++;
          break;
        }
        value += c;
        i++;
      }
      results.push({ value, col: col + 1 }); // col is 1-based offset in the string
    } else {
      i++;
    }
  }
  return results;
}

/**
 * Check for JSX text nodes in a line.
 * We look for text content between JSX tags that is not a {expression}.
 *
 * Key heuristic to avoid TypeScript generics false positives:
 *  - The `>` that closes a JSX tag is NOT preceded by a letter/digit/_ (those are generic closes)
 *  - The `<` that opens a JSX tag is followed by / or an uppercase letter (closing/opening tag)
 */
function checkJSXText(filePath, line, lineNum, violations) {
  // We want to match >TEXT< where:
  //  - The > is a JSX closing-tag angle (preceded by " ' ) space or nothing — NOT by \w or [])
  //  - TEXT contains human-readable content
  //  - The < starts a JSX closing or opening tag (followed by / or A-Z)
  const jsxTextRe = />([^<{}\n]+)(?=<[/A-Za-z])/g;
  let match;
  while ((match = jsxTextRe.exec(line)) !== null) {
    const raw = match[1];
    const value = raw.trim();
    if (!value) continue;

    // The character immediately before the > — if it's a word char or ] it's a TS generic
    const charBefore = match.index > 0 ? line[match.index - 1] : '';
    if (/[a-zA-Z0-9_\[\]]/.test(charBefore)) continue;

    if (shouldIgnore(value)) continue;
    if (!isHumanReadable(value)) continue;

    // Skip values that contain TypeScript/JS operators — they're not UI text
    if (/[|&=()[\]{}]/.test(value)) continue;

    const col = match.index + 2; // position after the >
    violations.push({
      file: filePath,
      line: lineNum,
      col,
      value,
      type: 'JSX text',
    });
  }
}

/**
 * Check for string-literal values on JSX target props.
 * Matches: propName="value"  or  propName='value'
 */
function checkJSXAttributes(filePath, line, lineNum, violations) {
  // Build a regex that matches any target prop followed by = and a quoted string
  // We iterate through extracted string literals and check what prop precedes them
  const propRe = new RegExp(
    `\\b(${[...TARGET_PROPS].join('|')})\\s*=\\s*(?:"([^"]*?)"|'([^']*?)')`,
    'g'
  );

  let match;
  while ((match = propRe.exec(line)) !== null) {
    const propName = match[1];
    const value = (match[2] ?? match[3] ?? '').trim();
    if (!value) continue;
    if (shouldIgnore(value)) continue;
    if (!isHumanReadable(value)) continue;

    const col = match.index + 1;
    violations.push({
      file: filePath,
      line: lineNum,
      col,
      value,
      type: `prop: ${propName}`,
    });
  }
}

/**
 * Check for toast calls with hardcoded string arguments.
 * Patterns: toast.success("msg"), toast.error('msg'), toast("msg")
 */
function checkToastCalls(filePath, line, lineNum, violations) {
  const toastRe = /\btoast\s*(?:\.\s*(?:success|error|info|warning|loading))?\s*\(\s*(?:"([^"]+)"|'([^']+)')/g;
  let match;
  while ((match = toastRe.exec(line)) !== null) {
    const value = (match[1] ?? match[2] ?? '').trim();
    if (!value) continue;
    if (shouldIgnore(value)) continue;
    if (!isHumanReadable(value)) continue;

    const col = match.index + 1;
    violations.push({
      file: filePath,
      line: lineNum,
      col,
      value,
      type: 'toast()',
    });
  }
}

// ---------------------------------------------------------------------------
// Output formatters
// ---------------------------------------------------------------------------

function formatConsole(violations, totalFiles) {
  if (violations.length === 0) {
    console.log('\n\x1b[32m✓ No hardcoded strings found. i18n compliance verified.\x1b[0m\n');
    return;
  }

  console.log(`\nFound hardcoded strings:\n`);

  // Group by file
  const byFile = new Map();
  for (const v of violations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }

  const cwd = process.cwd();
  for (const [file, fileViolations] of byFile) {
    const rel = path.relative(cwd, file).replace(/\\/g, '/');
    console.log(`\x1b[36m${rel}\x1b[0m`);
    for (const v of fileViolations) {
      const loc = `${String(v.line).padEnd(4)} col ${String(v.col).padEnd(4)}`;
      const typeTag = `[\x1b[33m${v.type}\x1b[0m]`;
      console.log(`  \x1b[90m${loc}\x1b[0m  ${typeTag}  "\x1b[33m${v.value}\x1b[0m"`);
    }
    console.log('');
  }

  console.log(`\x1b[33mTotal: ${violations.length} violation(s) in ${byFile.size} file(s)\x1b[0m`);
  console.log(`\x1b[90mScanned ${totalFiles} file(s)\x1b[0m`);
  console.log(`\n\x1b[34mTip: Use the useTranslation() hook and t() function for i18n.\x1b[0m\n`);
}

function formatJSON(violations, totalFiles) {
  const cwd = process.cwd();
  const output = {
    summary: {
      total: violations.length,
      files: new Set(violations.map((v) => v.file)).size,
      scanned: totalFiles,
    },
    violations: violations.map((v) => ({
      file: path.relative(cwd, v.file).replace(/\\/g, '/'),
      line: v.line,
      col: v.col,
      value: v.value,
      type: v.type,
    })),
  };
  console.log(JSON.stringify(output, null, 2));
}

function formatMarkdown(violations, totalFiles) {
  const cwd = process.cwd();
  console.log('# i18n Hardcoded Strings Report\n');
  console.log(`**Scanned:** ${totalFiles} file(s)`);
  console.log(`**Violations:** ${violations.length}\n`);

  if (violations.length === 0) {
    console.log('✓ No hardcoded strings found!\n');
    return;
  }

  const byFile = new Map();
  for (const v of violations) {
    if (!byFile.has(v.file)) byFile.set(v.file, []);
    byFile.get(v.file).push(v);
  }

  for (const [file, fileViolations] of byFile) {
    const rel = path.relative(cwd, file).replace(/\\/g, '/');
    console.log(`## ${rel}\n`);
    console.log('| Line | Col | Type | Value |');
    console.log('|------|-----|------|-------|');
    for (const v of fileViolations) {
      const escaped = v.value.replace(/\|/g, '\\|').replace(/`/g, '\\`');
      console.log(`| ${v.line} | ${v.col} | ${v.type} | \`${escaped}\` |`);
    }
    console.log('');
  }

  console.log('## How to Fix\n');
  console.log('1. Import the hook: `import { useTranslation } from "react-i18next";`');
  console.log('2. Use in component: `const { t } = useTranslation();`');
  console.log('3. Replace string: `t("common.myKey")`');
  console.log('4. Add key to `src/locales/en.json` and `src/locales/es.json`\n');
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let targetPath;
  let format = 'console';
  let showHelp = false;

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg.startsWith('--format=')) {
      format = arg.slice('--format='.length);
      if (!['console', 'json', 'markdown'].includes(format)) {
        console.error(`Invalid format: "${format}". Use: console, json, markdown`);
        process.exit(1);
      }
    } else if (!arg.startsWith('--')) {
      targetPath = arg;
    }
  }

  return { targetPath, format, showHelp };
}

function printHelp() {
  console.log(`
i18n Hardcoded Text Detector

Scans React components for hardcoded text strings that should be using i18n.
Uses only Node.js built-ins — no external dependencies needed.

Usage:
  node scripts/check-i18n.mjs [path] [options]
  yarn check:i18n [path] [options]

Options:
  --format=console|json|markdown    Output format (default: console)
  --help, -h                        Show this help

Examples:
  yarn check:i18n                           # Scan all src/ files
  yarn check:i18n src/pages/Foo.tsx         # Scan specific file
  yarn check:i18n src/components            # Scan directory
  yarn check:i18n --format=json             # JSON output for CI

What it detects:
  - JSX text nodes:      <Button>Submit</Button>
  - String JSX props:    label="Email address"
  - Toast messages:      toast.success("Saved!")
  - Props checked:       label, placeholder, title, helperText, tooltip, alt, aria-label, ...

What it ignores:
  - Import/export statements
  - CSS values (flex, center, row, ...)
  - i18n key patterns (common.cancel, admin.title)
  - URLs, file paths, hex colors
  - Technical identifiers (camelCase, PascalCase, ALL_CAPS)
  - Test files, type definition files

Exit codes:
  0  No violations
  1  Violations found (or error)
`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { targetPath, format, showHelp } = parseArgs();

  if (showHelp) {
    printHelp();
    process.exit(0);
  }

  // Resolve the scan root
  const cwd = process.cwd();
  let files = [];

  if (targetPath) {
    const resolved = path.resolve(cwd, targetPath);
    if (!fs.existsSync(resolved)) {
      console.error(`Path not found: ${resolved}`);
      process.exit(1);
    }
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      files = collectFiles(resolved);
    } else {
      files = [resolved];
    }
  } else {
    // Default: src/
    const srcDir = path.join(cwd, 'src');
    if (!fs.existsSync(srcDir)) {
      console.error(`No src/ directory found at ${srcDir}`);
      process.exit(1);
    }
    files = collectFiles(srcDir);
    // Also skip the scripts dir itself
    files = files.filter((f) => !f.includes('/scripts/') && !f.includes('\\scripts\\'));
  }

  if (format === 'console') {
    process.stderr.write(`\nScanning ${files.length} file(s) for hardcoded strings...\n\n`);
  }

  const allViolations = [];
  for (const file of files) {
    const violations = scanFile(file);
    allViolations.push(...violations);
  }

  switch (format) {
    case 'json':
      formatJSON(allViolations, files.length);
      break;
    case 'markdown':
      formatMarkdown(allViolations, files.length);
      break;
    default:
      formatConsole(allViolations, files.length);
      break;
  }

  process.exit(allViolations.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
