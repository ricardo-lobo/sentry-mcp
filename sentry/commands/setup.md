---
description: Configure Sentry plugin settings (organization, project, credentials)
allowed-tools: ["Write", "Read"]
---

# Setup Sentry Plugin

Configure default organization, project, and credentials for the Sentry plugin.

## Steps

1. **Ask user for configuration**:
   - Sentry URL (e.g., https://sentry.io or self-hosted URL)
   - Organization slug
   - Default project slug (optional)

2. **Create settings file** at `.claude/sentry.local.md`:

```yaml
---
organization: <org-slug>
project: <project-slug>
---

# Sentry Configuration

Your Sentry instance: <url>

## Getting an Auth Token

1. Go to <url>/settings/account/api/auth-tokens/
2. Create a new token with scopes: project:read, event:read, event:write
3. Set the environment variable: export SENTRY_AUTH_TOKEN="your-token"
4. Set the URL: export SENTRY_URL="<url>"
```

3. **Remind user about environment variables**:
   - `SENTRY_URL` must be set to their Sentry instance URL
   - `SENTRY_AUTH_TOKEN` must be set to their API token

4. **Verify setup** by suggesting they run `/sentry:issues` to test

## Example Output

After setup, the user should have:
- `.claude/sentry.local.md` with their org/project defaults
- Environment variables configured for authentication

## Notes

- The settings file is gitignored (contains org-specific info)
- Environment variables should be set in shell profile or .envrc
- Token needs scopes: project:read, event:read, event:write
