---
description: Get error statistics for a Sentry project
argument-hint: "[project]"
allowed-tools: ["mcp__sentry__get_project_stats"]
---

# Sentry Project Statistics

Get error statistics for a project including event counts, error rates, and top issues.

## Environment Variables

The MCP server reads these from the project's `.env` file:
- `SENTRY_ORG` - Organization slug (required)
- `SENTRY_PROJECT` - Default project slug (optional)

## Steps

1. **Parse argument**: Optional project slug override
2. **Call the MCP tool** `mcp__sentry__get_project_stats` with:
   - `organization`: Uses SENTRY_ORG from env
   - `project`: From argument or SENTRY_PROJECT from env
3. **Display results** showing:
   - Total events in last 24 hours
   - Error rate (events per hour)
   - Top issues with event counts
   - Summary message

## Examples

```
/sentry:stats              # Stats for project from SENTRY_PROJECT env var
/sentry:stats backend-api  # Stats for specific project
```

## Output

The stats include:
- **Total Events**: Number of events in the last 24 hours
- **Error Rate**: Average events per hour
- **Top Issues**: The most frequent issues with their counts
