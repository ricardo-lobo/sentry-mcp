---
description: Get error statistics for a Sentry project
argument-hint: "[project]"
allowed-tools: ["mcp__sentry__get_project_stats", "Read"]
---

# Sentry Project Statistics

Get error statistics for a project including event counts, error rates, and top issues.

## Steps

1. **Read settings** from `.claude/sentry.local.md` to get default organization and project
2. **Parse argument**: Optional project slug override
3. **Validate**: Ensure organization is configured (required)
4. **Call the MCP tool** `mcp__sentry__get_project_stats` with:
   - `organization`: From settings
   - `project`: From argument or settings
5. **Display results** showing:
   - Total events in last 24 hours
   - Error rate (events per hour)
   - Top issues with event counts
   - Summary message

## Examples

```
/sentry:stats              # Stats for default project from settings
/sentry:stats backend-api  # Stats for specific project
```

## Output

The stats include:
- **Total Events**: Number of events in the last 24 hours
- **Error Rate**: Average events per hour
- **Top Issues**: The most frequent issues with their counts

## Settings

Requires organization in `.claude/sentry.local.md`:
```yaml
---
organization: my-org
project: frontend
---
```
