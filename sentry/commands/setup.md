---
description: Show Sentry plugin configuration instructions
allowed-tools: []
---

# Sentry Plugin Setup

This plugin uses environment variables for configuration. Add these to your project's `.env` file.

## Required Environment Variables

```bash
# Your Sentry instance URL
SENTRY_URL=https://sentry.your-company.com

# API auth token (see below for how to create)
SENTRY_AUTH_TOKEN=sntrys_eyJ...

# Your organization slug
SENTRY_ORG=my-org
```

## Optional Environment Variables

```bash
# Default project (if you mostly work with one project)
SENTRY_PROJECT=frontend
```

## Creating an Auth Token

1. **Open Sentry** and log in
2. **Navigate to:** Settings → Account → Auth Tokens
   Or go to: `{SENTRY_URL}/settings/account/api/auth-tokens/`
3. **Create a new token** with these scopes:
   - `project:read` - List projects and settings
   - `event:read` - Read issues and events
   - `event:write` - Update issue status
4. **Copy the token** - it's only shown once

## Verify Setup

After configuring your `.env`, test with:
```
/sentry:issues
```

## Notes

- The `.env` file should be in your project root
- Add `.env` to `.gitignore` to avoid committing secrets
- Bun automatically loads `.env` files
