# GitHub Automation & Workflows

This directory contains GitHub Actions workflows, issue templates, and PR templates that automate project management tasks.

## Workflows

### 1. Update Issues on Merge (`update-issues-on-merge.yml`)

**Trigger:** When a PR is merged to `development` or `production` branches

**Functionality:**
- Extracts issue numbers from PR title, body, and branch name
- Looks for patterns: `Closes #123`, `Fixes #456`, `Resolves #789`
- **On merge to `development`:**
  - Adds "in development" label to linked issues
  - Adds comment notifying that changes are in development
- **On merge to `production`:**
  - Closes linked issues
  - Adds comment confirming completion

**Example PR description:**
```markdown
This PR implements the candidate import feature.

Closes #45
Fixes #47
```

### 2. Auto Label PRs (`auto-label-pr.yml`)

**Trigger:** When a PR is opened, synchronized, or reopened

**Functionality:**
- Automatically adds labels based on changed file paths:
  - `backend` - Changes to `recruiting-tool-backend/`
  - `frontend` - Changes to `recruiting-tool-frontend/`
  - `database` - Changes to `schema.prisma` or migrations
  - `documentation` - Changes to `.md` files or docs
  - `infrastructure` - Changes to Docker files
  - `github-actions` - Changes to `.github/workflows/`
  - `i18n` - Changes to locale files
- Checks if PR references an issue
- If branch name contains `issue-<number>` but PR doesn't link it, adds reminder comment
- If no issue reference found, adds tip comment about linking issues

**Benefits:**
- Consistent labeling without manual effort
- Easy filtering of PRs by type
- Helps identify scope of changes at a glance

### 3. Stale Issue Management (`stale-issues.yml`)

**Trigger:** Every Sunday at 00:00 UTC (or manually via workflow_dispatch)

**Functionality:**
- **Issues:**
  - Marks as stale after 90 days of inactivity
  - Closes after 14 more days if still no activity
  - Exempts: `pinned`, `security`, `priority-high`, `in development` labels
- **Pull Requests:**
  - Marks as stale after 30 days of inactivity
  - Closes after 7 more days if still no activity
  - Exempts: `pinned`, `security`, `priority-high` labels
- Never marks issues/PRs with assignees as stale
- Adds helpful comments explaining stale status

**Benefits:**
- Keeps issue tracker clean and relevant
- Surfaces abandoned work
- Reduces noise from outdated issues

**Manual trigger:**
```bash
gh workflow run stale-issues.yml
```

## Issue Templates

### Feature Request (`feature_request.yml`)

Structured template for proposing new features:
- Feature description
- Problem statement
- Proposed solution
- Area affected (dropdown)
- Estimated complexity
- Priority level
- Acceptance criteria
- Mockups/examples

**Labels:** `feature`, `priority-medium`

### Bug Report (`bug_report.yml`)

Structured template for reporting bugs:
- Bug description
- Steps to reproduce
- Expected vs actual behavior
- Area affected (dropdown)
- Severity level
- Frequency
- Environment details
- Error logs and screenshots

**Labels:** `bug`, `priority-medium`

### Improvement (`improvement.yml`)

Structured template for suggesting enhancements to existing features:
- Current behavior
- Proposed improvement
- Benefits
- Area affected
- Impact level
- Implementation ideas

**Labels:** `improvement`, `priority-low`

## PR Template (`PULL_REQUEST_TEMPLATE.md`)

Comprehensive template ensuring all PRs include:
- Summary and related issue link
- Type of change (feature, bug fix, etc.)
- Changes made
- Testing performed
- Screenshots (if UI changes)
- Database migration checklist
- Breaking changes section
- Documentation checklist
- Code quality checklist (i18n, UID-only APIs, TypeScript types, etc.)

## Using the Automation

### Creating Issues

1. Go to: https://github.com/Nikire/RecruitingTool/issues/new/choose
2. Select the appropriate template (Feature Request, Bug Report, or Improvement)
3. Fill out all required fields
4. Submit

### Creating PRs

1. Create a feature branch:
   ```bash
   git checkout -b feature/issue-123-candidate-import
   ```

2. Make your changes and commit

3. Push branch:
   ```bash
   git push -u origin feature/issue-123-candidate-import
   ```

4. Create PR via GitHub UI or `gh`:
   ```bash
   gh pr create --title "Add candidate bulk import feature" --body "..."
   ```

5. The PR template will automatically populate - fill it out completely

6. Auto-labeling will run and add appropriate labels

7. Link the issue in the description:
   ```markdown
   Closes #123
   ```

### Branch Naming Convention

For automatic issue detection to work, use one of these formats:

- `feature/issue-123-description` - Links to issue #123
- `fix/issue-456-bug-description` - Links to issue #456
- `improvement/issue-789-enhancement` - Links to issue #789

### Merging Workflow

1. **Merge to `development` first:**
   - Issue gets "in development" label
   - Issue remains open
   - Allows testing in dev environment

2. **When ready, merge to `production`:**
   - Issue is automatically closed
   - Completion comment is added
   - Feature is live

## Label System

### Type Labels
- `feature` - New functionality
- `bug` - Something isn't working
- `improvement` - Enhancement to existing feature
- `documentation` - Documentation updates
- `infrastructure` - Docker, CI/CD, config changes
- `github-actions` - Workflow changes

### Area Labels (Auto-applied)
- `backend` - Backend changes
- `frontend` - Frontend changes
- `database` - Database schema/migration changes
- `i18n` - Internationalization changes

### Priority Labels
- `priority-high` - Urgent, blocks functionality
- `priority-medium` - Important, affects workflow
- `priority-low` - Nice to have

### Complexity Labels
- `complexity-simple` - Few hours of work
- `complexity-moderate` - 1-3 days of work
- `complexity-complex` - 1+ weeks of work

### Status Labels
- `in development` - Merged to development branch (auto-applied)
- `stale` - No activity for extended period (auto-applied)
- `pinned` - Never mark as stale

### Special Labels
- `security` - Security-related issues (never stale)
- `ai-powered` - AI/ML features

## Best Practices

### For Issues
1. Always use templates when creating issues
2. Add appropriate labels and milestone
3. Reference related issues
4. Keep descriptions clear and actionable

### For PRs
1. Always link to related issues using `Closes #123`
2. Fill out the entire PR template
3. Include screenshots for UI changes
4. Update CHANGELOG.md for user-facing changes
5. Ensure all checklist items are completed

### For Commits
1. Use conventional commit format: `feat:`, `fix:`, `docs:`, etc.
2. Reference issue numbers in commit messages
3. Keep commits focused and atomic
4. Never include AI attribution (no `Co-Authored-By: Claude`)

## Troubleshooting

### Labels Not Being Applied
- Check that label names match exactly in `.github/workflows/auto-label-pr.yml`
- Create missing labels in repository settings
- Verify workflow has `pull-requests: write` permission

### Issues Not Being Closed
- Ensure PR description uses correct keywords: `Closes`, `Fixes`, or `Resolves`
- Verify issue number format: `#123` (with hash symbol)
- Check workflow run logs in GitHub Actions tab

### Stale Issues Being Marked Incorrectly
- Add exempt labels: `pinned`, `priority-high`, `security`, `in development`
- Assign the issue to someone
- Adjust timing in `stale-issues.yml` if needed

## Manual Workflow Triggers

View all workflows:
```bash
gh workflow list
```

Trigger stale issue management manually:
```bash
gh workflow run stale-issues.yml
```

View workflow runs:
```bash
gh run list
```

## Resources

- [GitHub Issues](https://github.com/Nikire/RecruitingTool/issues)
- [GitHub Milestones](https://github.com/Nikire/RecruitingTool/milestones)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Project Documentation](../.claude/docs/)
