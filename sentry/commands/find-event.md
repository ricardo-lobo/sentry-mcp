---
description: Find a Sentry issue by event ID
argument-hint: "<event-id>"
allowed-tools: ["mcp__sentry__list_issues", "mcp__sentry__list_issue_events", "mcp__sentry__get_issue"]
---

# Find Sentry Issue by Event ID

Look up an issue using a specific event ID. Useful when you have an event ID from logs or error reports.

## Environment Variables

The MCP server reads these from the project's `.env` file:
- `SENTRY_ORG` - Organization slug (required)
- `SENTRY_PROJECT` - Project slug (helps narrow search)

## Steps

1. **Parse argument**: Get the event ID
2. **Validate**: If no event ID provided, ask user to provide one
3. **Search strategy**:
   - First, get recent issues using `mcp__sentry__list_issues`
   - For each issue, check events using `mcp__sentry__list_issue_events`
   - Look for matching event ID
   - When found, get full issue details with `mcp__sentry__get_issue`
4. **Display results**:
   - If found: Show issue details and the specific event
   - If not found: Inform user and suggest checking SENTRY_PROJECT env var

## Examples

```
/sentry:find-event abc123def456    # Find issue containing this event
/sentry:find-event evt_789xyz      # Event IDs can have various formats
```

## Notes

- Event IDs are unique identifiers for individual error occurrences
- You can find event IDs in:
  - Application logs
  - Error tracking middleware output
  - Sentry notification emails
- If search is slow, set SENTRY_PROJECT in your .env to narrow the search
