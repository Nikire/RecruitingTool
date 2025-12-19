---
tags: [agents, automation, development, workflow]
created: 2025-11-24
category: Agents
status: current
---

# Agent System Overview

The BorderLess project uses specialized AI agents to automate and streamline development tasks. Each agent is configured for specific responsibilities and has global permissions to act autonomously.

## Agent Philosophy

### Global Permissions Model

**ALL specialized agents have GLOBAL PERMISSIONS** - they act immediately without asking for approval.

**Benefits**:
- ✅ Faster development workflow
- ✅ Reduced back-and-forth interactions
- ✅ Agents complete full workflows autonomously
- ✅ User maintains control (can interrupt when needed)

**What This Means**:
- Agents execute file changes immediately
- No permission prompts for commands or operations
- Agents are proactive and complete multi-step tasks
- User can stop agents at any time if needed

### Agent Selection Workflow

**CRITICAL**: Before starting any task, ALWAYS check available specialized agents first.

1. **Check Available Agents**: Review the list below
2. **Match Task to Agent**: Determine best-suited agent
3. **Use Specialized Agent**: Launch agent for the task
4. **Use Default Chat**: Only if no agent matches

## Core Development Agents

### fullstack-feature

**Purpose**: End-to-end feature development (database → backend → frontend)

**Use For**:
- Complete vertical slice features
- Features requiring database, backend API, and frontend UI
- Full-stack implementations

**Handles**:
- Prisma schema modifications
- Database migrations
- NestJS services and controllers
- React components and pages
- API integration
- Type definitions across stack

**Special Behavior**:
- **Enforces i18n**: All UI text must use react-i18next
- **Global permissions**: Acts immediately without asking
- **Complete workflow**: Handles entire feature pipeline

**Example Tasks**:
- "Add candidate export feature"
- "Implement email notification system"
- "Create analytics dashboard"

**Agent Config**: `.claude/agents/fullstack-feature.md`

---

### ui-component-specialist

**Purpose**: React UI/UX specialist for complex frontend work

**Use For**:
- Complex UI components and layouts
- Material-UI customization
- Design system tasks
- Component library work
- Dialog and form improvements

**Handles**:
- Material-UI components
- Responsive design
- Styled components
- Form implementations
- Consistent design patterns

**Special Behavior**:
- **Enforces i18n**: All text must use useTranslation() hook
- **Global permissions**: Acts immediately
- **Design consistency**: Maintains MUI theme and patterns

**Example Tasks**:
- "Redesign the candidates table"
- "Make the application dialog wider"
- "Create a new data visualization component"

**Agent Config**: `.claude/agents/ui-component-specialist.md`

---

### database-specialist

**Purpose**: Prisma and PostgreSQL specialist

**Use For**:
- Database schema changes
- Complex migrations
- Data modeling
- Indexes and performance
- Data integrity issues

**Handles**:
- Schema.prisma modifications
- Migration generation and execution
- Dummy data updates
- Database relationships
- Query optimization

**Special Behavior**:
- **Global permissions**: Runs migrations immediately
- **Data safety**: Updates dummy data automatically
- **Validation**: Ensures schema consistency

**Example Tasks**:
- "Add phone number field to candidates"
- "Create indexes for performance"
- "Add new Interview model"

**Agent Config**: `.claude/agents/database-specialist.md`

---

### state-optimizer

**Purpose**: React Query and state management specialist

**Use For**:
- Data fetching issues
- Caching strategies
- Optimistic updates
- Stale data problems
- Performance optimization

**Handles**:
- React Query hooks
- Cache invalidation
- Query keys
- Optimistic UI updates
- Complex data flow

**Special Behavior**:
- **Global permissions**: Acts immediately
- **Performance focused**: Optimizes queries and caching

**Example Tasks**:
- "Data isn't refreshing after mutations"
- "Optimize candidate list performance"
- "Implement optimistic UI updates"

**Agent Config**: `.claude/agents/state-optimizer.md`

---

### api-integration-architect

**Purpose**: API design and third-party integration specialist

**Use For**:
- REST API design
- OAuth flows
- Webhooks
- External service integrations
- API architecture decisions

**Handles**:
- Google Calendar integration
- SendGrid email service
- Stripe payment integration
- API endpoint design
- Authentication flows

**Special Behavior**:
- **Global permissions**: Sets up integrations immediately
- **Security focused**: Implements auth properly

**Example Tasks**:
- "Integrate SendGrid for emails"
- "Add Google Calendar sync"
- "Setup OAuth authentication"

**Agent Config**: `.claude/agents/api-integration-architect.md`

---

## Infrastructure & DevOps Agents

### devops-specialist

**Purpose**: Docker and infrastructure specialist

**Use For**:
- Container configuration
- Deployment automation
- CI/CD pipelines
- Environment setup
- Development workflow optimization

**Handles**:
- Docker and docker-compose
- Environment variables
- Build optimization
- Deployment scripts
- Infrastructure as code

**Example Tasks**:
- "Setup Docker for local development"
- "Optimize Docker build times"
- "Create production deployment config"

**Agent Config**: `.claude/agents/devops-specialist.md`

---

## Analysis & Planning Agents

### Explore

**Purpose**: Fast codebase exploration and searching

**Use For**:
- Finding files by patterns
- Searching code for keywords
- Understanding architecture
- Quick investigations

**Thoroughness Levels**:
- `quick`: Fast overview
- `medium`: Balanced depth
- `very thorough`: Deep analysis

**Example Tasks**:
- "Find all API endpoints"
- "How do forms work in this project?"
- "Search for authentication logic"

---

### Plan

**Purpose**: Planning implementation steps before coding

**Use For**:
- Breaking down complex tasks
- Designing architecture
- Planning workflows
- Technical specifications

**Thoroughness Levels**:
- `quick`: High-level plan
- `medium`: Detailed steps
- `very thorough`: Comprehensive analysis

**Example Tasks**:
- "Plan implementation of notification system"
- "Design multi-file upload architecture"
- "Break down AI resume screening feature"

---

### codebase-analyzer

**Purpose**: Deep architectural analysis and agent recommendations

**Use For**:
- Understanding how features work
- App structure analysis
- Creating new specialized agents
- Architecture documentation

**Example Tasks**:
- "How does authentication work?"
- "Analyze my app structure"
- "What agents should I create for this project?"

**Agent Config**: `.claude/agents/codebase-analyzer.md`

---

## Project Management Agents

### task-orchestrator

**Purpose**: Task prioritization and GitHub Issues management

**Use For**:
- Guidance on what to work on next
- Creating GitHub Issues
- Task prioritization
- Progress tracking

**Handles**:
- GitHub Issues analysis
- Milestone tracking
- Task recommendations
- Priority assignment

**Special Behavior**:
- **Global permissions**: Creates issues immediately
- **Uses gh CLI**: Direct GitHub integration
- **Proactive**: Analyzes and recommends

**Example Tasks**:
- "What should I work on next?"
- "Create a GitHub issue for this bug"
- "Prioritize feature requests"

**Agent Config**: `.claude/agents/task-orchestrator.md`

---

### git-workflow-manager

**Purpose**: Git operations and GitHub workflow automation

**Use For**:
- Commits and pushes
- Branch management
- Pull request creation
- GitHub Issues linking
- Changelog updates

**Handles**:
- Complete Git workflow
- Staging and committing
- Branch creation
- PR creation with templates
- Issue linking in commits
- Changelog maintenance

**Special Behavior**:
- **Global permissions**: Executes Git operations immediately
- **Activity logging**: Tracks all operations
- **Automated linking**: Connects commits to issues

**Example Tasks**:
- "Commit these changes"
- "Create a PR for this feature"
- "Push to development branch"

**Trigger Phrases**:
- "commit this"
- "create a PR"
- "push changes"

**Agent Config**: `.claude/agents/git-workflow-manager.md`

---

### agent-orchestrator

**Purpose**: Master coordinator for complex multi-agent workflows

**Use For**:
- Complex features requiring multiple agents
- Multi-step workflows
- Agent coordination
- Task breakdown across agents

**Handles**:
- Determines which agents are needed
- Breaks down complex tasks
- Manages agent workflows
- Coordinates agent execution

**Example Tasks**:
- "Build complete onboarding system" (requires multiple agents)
- "Implement and deploy new feature" (fullstack + devops + git)

**Agent Config**: `.claude/agents/agent-orchestrator.md`

---

## Product & Strategy Agents

### product-brainstorming

**Purpose**: Product strategy and SaaS business consultant

**Use For**:
- New feature ideas
- Product improvements
- Strategic direction
- Monetization strategies
- Competitive analysis

**Provides**:
- Feature ideas with business justification
- Pricing tier recommendations
- Competitive analysis
- ROI projections
- Market positioning

**Example Tasks**:
- "How can we make this more sellable as SaaS?"
- "What features would attract enterprise clients?"
- "Analyze our competitive position"

**Agent Config**: `.claude/agents/product-brainstorming.md`

---

## Documentation & Help Agents

### claude-code-guide

**Purpose**: Claude Code and Agent SDK documentation expert

**Use For**:
- Questions about Claude Code features
- Hook usage
- Slash commands
- MCP servers
- Agent SDK capabilities

**Example Questions**:
- "Can Claude Code do X?"
- "How do I use slash commands?"
- "Does Claude Code have file watching?"

---

## Agent Selection Examples

### Example 1: "Add a new candidate import feature"
→ Use **fullstack-feature**
- Requires database schema changes
- Needs backend API endpoints
- Requires frontend UI components
- Complete vertical slice feature

### Example 2: "The application dialog is too narrow"
→ Use **ui-component-specialist**
- UI/UX improvement
- Material-UI Dialog modification
- Design consistency needed

### Example 3: "Data isn't refreshing after mutations"
→ Use **state-optimizer**
- React Query caching issue
- Cache invalidation problem
- State management concern

### Example 4: "Where is authentication handled?"
→ Use **Explore** with `medium` thoroughness
- Searching for code patterns
- Understanding existing implementation
- Quick investigation

### Example 5: "What should I work on next?"
→ Use **task-orchestrator**
- Task prioritization
- GitHub Issues analysis
- Progress tracking

### Example 6: "How can we make this more sellable?"
→ Use **product-brainstorming**
- Business strategy
- Feature prioritization
- Market positioning

### Example 7: "Setup Docker for development"
→ Use **devops-specialist**
- Infrastructure work
- Docker configuration
- Environment setup

### Example 8: "Commit and create a PR"
→ Use **git-workflow-manager**
- Git operations
- GitHub workflow
- Automated PR creation

---

## Agent Behavior Policies

### Internationalization (i18n) Policy

**CRITICAL for Frontend Work**: All UI text MUST use i18n.

**Rules**:
- ✅ Use `useTranslation()` hook from react-i18next
- ✅ All strings use `t('key')` format
- ✅ Add translations to locale files (en.json, es.json)
- ❌ NEVER hardcode user-facing text
- ❌ No inline strings like "Cancel", "Submit", "Delete"

**Example**:
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return (
    <Button>{t('common.cancel')}</Button>  // ✅ Correct
    // <Button>Cancel</Button>  ❌ Wrong
  );
};
```

**Enforced By**:
- fullstack-feature agent
- ui-component-specialist agent

### Activity Logging

All agents log significant actions to `.claude/logs/agent-activity.log`.

**Log Format**:
```
[YYYY-MM-DD HH:MM:SS] [agent-name] <ACTION>
Status: SUCCESS | FAILURE
Details: <description>
---
```

**What Gets Logged**:
- File creations/modifications
- Database migrations
- Git operations
- GitHub operations
- Docker rebuilds
- Package installations
- Errors and recovery

**View Logs**:
```bash
# Recent activity
tail -n 50 .claude/logs/agent-activity.log

# Find failures
grep "Status: FAILURE" .claude/logs/agent-activity.log

# Specific agent
grep "[fullstack-feature]" .claude/logs/agent-activity.log
```

**See**: `.claude/logs/README.md` for complete logging documentation

---

## Agent Configuration Files

All agent configurations are stored in `.claude/agents/`:

```
.claude/agents/
├── fullstack-feature.md
├── ui-component-specialist.md
├── database-specialist.md
├── state-optimizer.md
├── api-integration-architect.md
├── devops-specialist.md
├── git-workflow-manager.md
├── task-orchestrator.md
├── product-brainstorming.md
├── codebase-analyzer.md
└── agent-orchestrator.md
```

Each agent file contains:
- Agent purpose and responsibilities
- Permissions and behavior
- Example use cases
- Specific instructions
- Constraints and requirements

---

## Best Practices for Using Agents

### When to Use Agents

✅ **DO Use Agents For**:
- Any development task matching an agent's specialty
- Complex multi-step workflows
- Tasks requiring domain expertise
- Automated workflows (Git, GitHub, Docker)

❌ **DON'T Use Agents For**:
- Simple questions or clarifications
- Reading documentation
- Discussions or brainstorming (unless using product-brainstorming)

### Agent Selection Tips

1. **Match expertise**: Choose agent based on primary domain (backend, frontend, database)
2. **Consider workflow**: Some tasks span multiple agents (use agent-orchestrator)
3. **Start specific**: Use specialized agents over general agents
4. **Trust automation**: Agents have global permissions for efficiency

### Working with Agent Output

1. **Review changes**: Agents act fast, review what was done
2. **Check logs**: Use activity logs to track agent actions
3. **Test thoroughly**: Agents rebuild Docker automatically
4. **Provide feedback**: Let agents know if something needs adjustment

---

## Troubleshooting Agents

### Agent Not Available

**Problem**: Agent doesn't appear in list
**Solution**: Check `.claude/agents/` folder for agent config file

### Agent Permission Issues

**Problem**: Agent asks for permission
**Solution**: Agents should have global permissions; check agent config

### Agent Made Unwanted Changes

**Problem**: Agent modified wrong files
**Solution**:
- Use Git to revert: `git checkout -- <file>`
- Provide clearer instructions next time
- Consider using Plan agent first for complex tasks

### Agent Activity Not Logged

**Problem**: Actions not appearing in activity log
**Solution**: Check `.claude/logs/agent-activity.log` exists and is writable

---

## Future Agent Development

### Potential New Agents

As the project grows, consider creating agents for:
- **Testing Specialist**: E2E tests, unit tests, test coverage
- **Performance Optimizer**: Bundle analysis, lazy loading, optimization
- **Accessibility Specialist**: ARIA, screen reader support, WCAG compliance
- **Security Auditor**: Security vulnerabilities, dependency audits
- **Documentation Writer**: Auto-generate API docs, README updates

### Creating Custom Agents

To create a new specialized agent:
1. Identify repeated workflow or domain expertise need
2. Create agent config in `.claude/agents/<agent-name>.md`
3. Define purpose, permissions, and behavior
4. Test with example tasks
5. Document in CLAUDE.md and this vault

---

## Related Notes

- [[Quick-Start|Quick Start Guide]]
- [[Development-Workflow|Development Workflow]]
- [[Git-Workflow|Git Workflow]]
- [[Architecture-Overview|Architecture Overview]]

## See Also

- **Agent Configs**: `.claude/agents/` folder
- **Activity Logs**: `.claude/logs/agent-activity.log`
- **CLAUDE.md**: Quick agent reference

---

**Last Updated**: 2025-11-24
**Review Frequency**: After adding new agents
