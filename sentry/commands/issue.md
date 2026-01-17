---
description: Get detailed information about a specific Sentry issue
argument-hint: "<issue-id>"
allowed-tools: ["mcp__sentry__get_issue"]
---

# Get Sentry Issue Details

Retrieve detailed information about a specific issue including error type, stack trace location, affected users, and tags.

## Steps

1. **Parse argument**: Get the issue ID (numeric ID or short ID like FRONTEND-123)
2. **Validate**: If no issue ID provided, ask user to provide one
3. **Call the MCP tool** `mcp__sentry__get_issue` with:
   - `issueId`: The provided issue ID
4. **Display results** showing:
   - Issue title and status
   - Error type and value (from metadata)
   - File and function where error occurred
   - Event count and affected users
   - Top tags (browser, OS, environment, etc.)
   - Link to view in Sentry

## Examples

```
/sentry:issue FRONTEND-123    # Get issue by short ID
/sentry:issue 456789          # Get issue by numeric ID
```

## Tips

- Use `/sentry:issues` first to find issue IDs
- Short IDs (PROJECT-123) are easier to remember
- The response includes actionable context for debugging
