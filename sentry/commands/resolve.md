---
description: Resolve, unresolve, or ignore a Sentry issue
argument-hint: "<issue-id> [--unresolve|--ignore]"
allowed-tools: ["mcp__sentry__update_issue_status", "Read"]
---

# Update Sentry Issue Status

Change the status of a Sentry issue to resolved, unresolved, or ignored.

## Steps

1. **Parse arguments**:
   - First argument: Issue ID (required)
   - `--unresolve`: Set status to unresolved
   - `--ignore`: Set status to ignored
   - No flag: Set status to resolved (default)
2. **Validate**: If no issue ID provided, ask user to provide one
3. **Determine status**:
   - Default: `resolved`
   - With `--unresolve`: `unresolved`
   - With `--ignore`: `ignored`
4. **Call the MCP tool** `mcp__sentry__update_issue_status` with:
   - `issueId`: The provided issue ID
   - `status`: The determined status
5. **Confirm the change** showing:
   - Issue ID
   - Previous status → New status
   - Success message

## Examples

```
/sentry:resolve FRONTEND-123           # Resolve the issue
/sentry:resolve FRONTEND-123 --ignore  # Ignore the issue
/sentry:resolve FRONTEND-123 --unresolve  # Reopen the issue
```

## Notes

- Resolving an issue marks it as fixed
- Ignored issues won't appear in default issue lists
- Unresolving reopens a previously resolved/ignored issue
