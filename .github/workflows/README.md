# GitHub Actions Workflows

This directory contains automated workflows for the BorderLess project.

## Workflows

### Code Quality (`code-quality.yml`)

**Triggers:**
- Pull requests to `development` or `production` branches
- Pushes to `development` branch

**Checks:**

**Backend:**
- ESLint (`yarn lint:check`) - Linting without auto-fix
- TypeScript type checking (`yarn typecheck`)
- Prettier formatting (`yarn format:check`)

**Frontend:**
- ESLint (`yarn lint:check`) - Linting with zero warnings
- TypeScript type checking (`yarn typecheck`)
- Prettier formatting (`yarn format:check`)

**Purpose:**
Ensures all code changes meet quality standards before merging. Runs automatically on every PR and push to development.

---

### Issue Management

**Close Issues on Push (`close-issues-on-push.yml`)**
- Automatically closes issues referenced in commit messages when pushed to `development`
- Supports keywords: `Closes`, `Fixes`, `Resolves` (case-insensitive)

**Update Issues on PR Merge (`update-issues-on-merge.yml`)**
- Adds "in development" label to issues when PR is merged to `development`

**Auto Label PRs (`auto-label-pr.yml`)**
- Automatically adds labels to PRs based on file changes

**Stale Issues (`stale-issues.yml`)**
- Marks inactive issues as stale after 60 days

---

## NPM Scripts

### Backend Scripts

**Quality Checks:**
- `yarn lint` - ESLint with auto-fix
- `yarn lint:check` - ESLint without auto-fix (CI use)
- `yarn typecheck` - TypeScript type checking
- `yarn format` - Prettier with auto-fix
- `yarn format:check` - Prettier without auto-fix (CI use)
- `yarn checks` - Run typecheck + lint
- `yarn checks:fix` - Run format + lint

### Frontend Scripts

**Quality Checks:**
- `yarn lint` - ESLint
- `yarn lint:check` - ESLint with zero warnings (CI use)
- `yarn typecheck` - TypeScript type checking
- `yarn format` - Prettier with auto-fix
- `yarn format:check` - Prettier without auto-fix (CI use)
- `yarn checks` - Run typecheck + lint
- `yarn checks:fix` - Run format + lint

---

## Local Development

**Before committing:**
```bash
# Backend
cd recruiting-tool-backend
yarn checks:fix

# Frontend
cd recruiting-tool-frontend
yarn checks:fix
```

**Check without modifying:**
```bash
# Backend
cd recruiting-tool-backend
yarn lint:check
yarn typecheck
yarn format:check

# Frontend
cd recruiting-tool-frontend
yarn lint:check
yarn typecheck
yarn format:check
```

---

## CI/CD Pipeline

```
Developer pushes code
         ↓
   Code Quality checks run
   (ESLint, TypeScript, Prettier)
         ↓
   ✅ Pass → Ready for review
   ❌ Fail → Fix issues and push again
         ↓
   PR approved + merged
         ↓
   Issues auto-closed
```

---

## Related Documentation

- **GitHub Workflow Guide:** `../.claude/docs/GITHUB_WORKFLOW.md`
- **NPM Scripts Reference:** `../.claude/docs/NPM_SCRIPTS.md`
- **Coding Standards:** `../.claude/docs/CODING_STANDARDS.md`
