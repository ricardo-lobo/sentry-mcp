---
description: List recent Sentry issues with optional filters
argument-hint: "[project] [--status unresolved|resolved|ignored]"
allowed-tools: ["mcp__sentry__list_issues", "Read"]
---

# List Sentry Issues

List recent issues from Sentry with optional filtering.

## Steps

1. **Read settings** from `.claude/sentry.local.md` if it exists to get default organization and project
2. **Parse arguments**:
   - First argument (if provided): project slug override
   - `--status <status>`: Filter by status (unresolved, resolved, ignored)
3. **Call the MCP tool** `mcp__sentry__list_issues` with:
   - `organization`: From settings or ask user if not configured
   - `project`: From argument or settings
   - `status`: From --status flag if provided
   - `limit`: 10 (reasonable default)
4. **Display results** in a clear format showing:
   - Issue short ID and title
   - Status, event count, user count
   - Last seen time
   - Link to Sentry

## Examples

```
/sentry:issues                     # List issues using defaults from settings
/sentry:issues frontend            # List issues for specific project
/sentry:issues --status unresolved # Only unresolved issues
/sentry:issues backend --status resolved
```

## Settings

If `.claude/sentry.local.md` exists, read organization and project from YAML frontmatter:
```yaml
---
organization: my-org
project: frontend
---
```
