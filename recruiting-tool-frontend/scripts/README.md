# Frontend Development Scripts

This directory contains utility scripts for development, testing, and quality assurance.

## Available Scripts

### 1. Screenshot Capture (`capture-screenshot.ts`)

Captures screenshots of pages for visual verification and documentation.

**Usage:**
```bash
yarn screenshot /hr/dashboard
yarn screenshot /hr/candidates -- --user=HR_SPECIALIST
yarn screenshot /careers -- --public
yarn screenshot --all-hr
```

**See:** `capture-screenshot.ts` header for complete documentation.

---

### 2. i18n Hardcoded Text Detector (`detect-hardcoded-strings.ts`)

Scans React components for hardcoded text strings that should be using i18n.

**Usage:**
```bash
yarn check-i18n                              # Scan all files in src/
yarn check-i18n src/pages/CandidatesPage.tsx # Scan specific file
yarn check-i18n src/components               # Scan specific directory
yarn check-i18n --format=json                # Output as JSON
yarn check-i18n --format=markdown            # Output as Markdown
yarn check-i18n --help                       # Show help
```

#### What it Detects

**JSX Text Content:**
```tsx
// ❌ Detected - hardcoded
<Button>Submit</Button>

// ✅ Correct - using i18n
<Button>{t('common.submit')}</Button>
```

**String Props:**
```tsx
// ❌ Detected - hardcoded
<TextField label="First Name" placeholder="Enter your name" />

// ✅ Correct - using i18n
<TextField
  label={t('form.firstName')}
  placeholder={t('form.enterName')}
/>
```

**Toast Messages:**
```tsx
// ❌ Detected - hardcoded
toast.success('Candidate created successfully');

// ✅ Correct - using i18n
toast.success(t('candidates.messages.created'));
```

**Common UI Props:**
- `label`
- `placeholder`
- `title`
- `aria-label`
- `helperText`
- `error`, `success`, `warning`, `info`
- `alt`
- `tooltip`

#### What it Ignores

The detector is smart enough to ignore:

- **Import statements** and type definitions
- **Console logs** and comments
- **Empty strings** and single characters
- **URLs**: `https://example.com`
- **File paths**: `/api/candidates`, `./styles.css`
- **File names**: `image.png`, `data.json`
- **CSS class names**: `MuiButton-root`, `app-container`
- **Constants**: `ADMIN_ROLE`, `MAX_LENGTH`
- **Hex colors**: `#ff0000`, `#abc`
- **CSS units**: `10px`, `1.5rem`, `100%`
- **Phone numbers**: `+1 234 567 8900`
- **Data attributes**: `data-testid`, `data-id`
- **ARIA attributes**: `aria-hidden`, `aria-expanded`
- **Event handlers**: `onClick`, `onChange`
- **Component names**: `Button`, `TextField`
- **React hooks**: `useState`, `useEffect`
- **Property accessors**: `user.name`, `item.id`
- **Test files**: `*.test.tsx`, `*.spec.ts`

#### Output Formats

**Console (default):**
- Colored output with syntax highlighting
- Grouped by file
- Shows line numbers, context, and string values
- Human-readable format

**JSON:**
```bash
yarn check-i18n --format=json
```
- Structured data for programmatic processing
- Includes summary statistics
- Suitable for CI/CD integration

**Markdown:**
```bash
yarn check-i18n --format=markdown
```
- Table format for documentation
- Easy to copy into GitHub Issues or PRs
- Includes recommendations section

#### How to Fix Detected Issues

**Step 1:** Import the useTranslation hook
```tsx
import { useTranslation } from 'react-i18next';
```

**Step 2:** Use the hook in your component
```tsx
const MyComponent = () => {
  const { t } = useTranslation();
  // ...
};
```

**Step 3:** Replace hardcoded strings with t() calls
```tsx
// Before
<Button>Submit</Button>
<TextField placeholder="Enter name" />
toast.success('Saved successfully');

// After
<Button>{t('common.submit')}</Button>
<TextField placeholder={t('form.placeholders.name')} />
toast.success(t('messages.saved'));
```

**Step 4:** Add translations to locale files

**`src/locales/en.json`:**
```json
{
  "common": {
    "submit": "Submit"
  },
  "form": {
    "placeholders": {
      "name": "Enter name"
    }
  },
  "messages": {
    "saved": "Saved successfully"
  }
}
```

**`src/locales/es.json`:**
```json
{
  "common": {
    "submit": "Enviar"
  },
  "form": {
    "placeholders": {
      "name": "Ingrese nombre"
    }
  },
  "messages": {
    "saved": "Guardado exitosamente"
  }
}
```

#### Integration with Development Workflow

**Pre-commit hook (optional):**
Add to `.husky/pre-commit`:
```bash
#!/bin/sh
yarn check-i18n || exit 1
```

**CI/CD integration:**
Add to your CI workflow:
```yaml
- name: Check for hardcoded strings
  run: yarn check-i18n --format=json
```

**VS Code task:**
Add to `.vscode/tasks.json`:
```json
{
  "label": "Check i18n",
  "type": "shell",
  "command": "yarn check-i18n",
  "problemMatcher": [],
  "presentation": {
    "reveal": "always",
    "panel": "new"
  }
}
```

#### Example Output

**Console format:**
```
🔍 Scanning for hardcoded strings...

Found 3 file(s) to scan

📄 src/pages/CandidatesPage.tsx
────────────────────────────────────────────
  Line 45:12 [jsx-text]
    "Submit"
    <Button variant="contained">Submit</Button>

  Line 78:23 [jsx-attribute]
    "Enter candidate name"
    <TextField placeholder="Enter candidate name" />

⚠️  Total: 2 hardcoded string(s) found

💡 Tip: Use the useTranslation() hook and t() function for i18n
```

**JSON format:**
```json
{
  "summary": {
    "total": 2,
    "files": 1
  },
  "results": [
    {
      "file": "src/pages/CandidatesPage.tsx",
      "line": 45,
      "column": 12,
      "value": "Submit",
      "context": "<Button variant=\"contained\">Submit</Button>",
      "type": "jsx-text"
    }
  ]
}
```

**Markdown format:**
```markdown
# i18n Hardcoded Strings Report

**Total:** 2 hardcoded string(s) found

## src/pages/CandidatesPage.tsx

Found 2 hardcoded string(s):

| Line | Type | Value | Context |
|------|------|-------|---------|
| 45:12 | jsx-text | `Submit` | `<Button variant="contained">Submit</Button>` |
| 78:23 | jsx-attribute | `Enter candidate name` | `<TextField placeholder="Enter candidate name" />` |

## Recommendations

1. Use the `useTranslation()` hook from `react-i18next`
2. Replace hardcoded strings with `t('key')`
3. Add translation keys to `src/locales/en.json` and `src/locales/es.json`
4. For toast messages, use `t()` inside the toast call: `toast.success(t('key'))`
```

#### Exit Codes

- `0` - No hardcoded strings found (success)
- `1` - Hardcoded strings detected or error occurred

This makes it suitable for use in CI/CD pipelines where you want the build to fail if hardcoded strings are found.

---

## Technical Details

### Dependencies

All scripts use:
- **tsx**: TypeScript execution runtime (no compilation needed)
- **@babel/parser**: AST parsing for TypeScript/TSX
- **@babel/traverse**: AST traversal
- **fast-glob**: Fast file matching
- **chalk**: Colored terminal output

### AST Parsing

The i18n detector uses Abstract Syntax Tree (AST) parsing to:
1. Parse TypeScript/TSX files into structured data
2. Traverse the tree to find specific node types
3. Extract string literals from JSX and function calls
4. Analyze context to determine if strings should be ignored

This approach is more accurate than regex-based detection and catches edge cases that simple pattern matching would miss.

### Performance

- Scans ~100 files per second on average
- Uses fast-glob for efficient file matching
- Caches AST parsing results per file
- Ignores node_modules, test files, and build artifacts

---

## Contributing

When adding new scripts:

1. **Use TypeScript** with proper type definitions
2. **Add executable permissions**: `chmod +x scripts/your-script.ts`
3. **Include shebang**: `#!/usr/bin/env tsx`
4. **Add help flag**: Support `--help` or `-h`
5. **Document in this README**: Add usage examples and explanations
6. **Add npm script**: Update `package.json` scripts section
7. **Follow existing patterns**: Use chalk for colors, support multiple output formats

---

## Related Documentation

- **Project workflows**: `.claude/docs/WORKFLOWS.md`
- **Coding standards**: `.claude/docs/CODING_STANDARDS.md`
- **Hardcoded strings audit**: `.claude/docs/HARDCODED_STRINGS_AUDIT.md`
- **i18n implementation**: `.claude/docs/LANGUAGE_SELECTOR_IMPLEMENTATION.md`
