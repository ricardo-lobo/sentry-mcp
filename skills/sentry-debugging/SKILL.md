---
name: sentry-debugging
description: Use when debugging errors with Sentry context, investigating production issues, triaging Sentry alerts, or when user mentions "sentry", "error tracking", "production error", or "investigate issue"
---

# Debugging with Sentry

Guide for using Sentry data to debug and resolve production errors effectively.

## Available Tools

Use these MCP tools to interact with Sentry:

| Tool | Purpose |
|------|---------|
| `mcp__sentry__list_projects` | List all projects in an organization |
| `mcp__sentry__list_issues` | List issues with filters (project, status) |
| `mcp__sentry__get_issue` | Get detailed issue info (stack trace, tags, users) |
| `mcp__sentry__list_issue_events` | Get individual error occurrences |
| `mcp__sentry__update_issue_status` | Resolve, unresolve, or ignore issues |
| `mcp__sentry__get_project_stats` | Get error rates and top issues |

## Debugging Workflow

### 1. Identify the Issue

Start by listing recent issues:
```
Use mcp__sentry__list_issues with:
- organization: (from settings or ask user)
- status: "unresolved"
- limit: 10
```

### 2. Get Issue Details

Once you have an issue ID, get full details:
```
Use mcp__sentry__get_issue with:
- issueId: "PROJ-123" or numeric ID
```

Key information to extract:
- **metadata.errorType**: The exception type (TypeError, ValueError, etc.)
- **metadata.errorValue**: The error message
- **metadata.filename**: File where error occurred
- **metadata.function**: Function name
- **topTags**: Browser, OS, environment, release info

### 3. Analyze Events

Look at individual occurrences for patterns:
```
Use mcp__sentry__list_issue_events with:
- issueId: the issue ID
- limit: 5
```

Check for:
- Common user patterns
- Browser/device patterns
- Time patterns (when do errors spike?)

### 4. Find Related Code

Using the filename and function from issue metadata:
1. Search the codebase for the file
2. Read the relevant function
3. Look for potential causes based on the error type

### 5. Fix and Verify

After implementing a fix:
1. Deploy the change
2. Monitor Sentry for new occurrences
3. Resolve the issue: `mcp__sentry__update_issue_status` with status "resolved"

## Common Error Patterns

### TypeError: Cannot read property 'X' of undefined
- Check for missing null checks
- Verify data is loaded before accessing
- Look for race conditions in async code

### Network Errors
- Check API endpoint availability
- Verify authentication tokens
- Look for CORS issues
- Check timeout settings

### Database Errors
- Check connection pool settings
- Look for transaction deadlocks
- Verify query parameters

## Settings

Configure defaults in `.claude/sentry.local.md`:

```yaml
---
organization: your-org-slug
project: your-project-slug
---

Optional notes about your Sentry setup.
```

## Quick Commands

- `/sentry:issues` - List recent issues
- `/sentry:issue <id>` - Get issue details
- `/sentry:resolve <id>` - Mark issue as resolved
- `/sentry:stats` - View project error statistics
- `/sentry:find-event <event-id>` - Find issue by event ID

## Tips

1. **Prioritize by user impact**: Sort issues by userCount to fix what affects most users
2. **Check release tags**: New issues after a release often indicate regressions
3. **Use environment tags**: Filter by production vs staging to focus on real issues
4. **Link issues to code**: When you find the fix, note the commit in Sentry
