---
description: List recent Sentry issues with optional filters
argument-hint: "[project] [--status unresolved|resolved|ignored]"
allowed-tools: ["mcp__sentry__list_issues"]
---

# List Sentry Issues

List recent issues from Sentry with optional filtering.

## Environment Variables

The MCP server reads these from the project's `.env` file:
- `SENTRY_ORG` - Default organization slug
- `SENTRY_PROJECT` - Default project slug (optional)

## Steps

1. **Parse arguments**:
   - First argument (if provided): project slug
   - `--status <status>`: Filter by status (unresolved, resolved, ignored)
2. **Call the MCP tool** `mcp__sentry__list_issues` with:
   - `organization`: Use `SENTRY_ORG` env var value, or ask user if not set
   - `project`: From argument or `SENTRY_PROJECT` env var
   - `status`: From --status flag if provided
   - `limit`: 10 (reasonable default)
3. **Display results** in a clear format showing:
   - Issue short ID and title
   - Status, event count, user count
   - Last seen time
   - Link to Sentry

## Examples

```
/sentry:issues                     # List issues using SENTRY_ORG from .env
/sentry:issues frontend            # List issues for specific project
/sentry:issues --status unresolved # Only unresolved issues
/sentry:issues backend --status resolved
```
