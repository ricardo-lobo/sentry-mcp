# Claude Code Plugins

A collection of Claude Code plugins by Ricardo Lobo.

## Plugins

### sentry-mcp

A plugin for Sentry self-hosted instances. Query issues, manage errors, and debug with Sentry context directly from Claude Code.

## Features

- **6 MCP Tools** for Sentry API operations
- **6 Slash Commands** for quick access
- **Debugging Skill** - workflow guidance for error investigation
- **LLM-Optimized Output** - summarized, actionable responses
- **TypeScript + Bun** - fast, type-safe implementation

## Installation

### From GitHub (Marketplace-style)

```
/plugin marketplace add ricardo-lobo/claude-code
/plugin install sentry-mcp@ricardo-lobo
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/ricardo-lobo/claude-code.git ~/.claude/plugins/sentry-mcp

# Install dependencies
cd ~/.claude/plugins/sentry-mcp/sentry && bun install
```

Then use with:
```bash
claude --plugin-dir ~/.claude/plugins/sentry-mcp/sentry
```

### Prerequisites

**Option A: Project `.env` file** (recommended for per-project config):
```bash
# Create .env in your project root
SENTRY_URL=https://sentry.your-company.com
SENTRY_AUTH_TOKEN=your-auth-token
```

**Option B: System environment variables** (for global config):
```bash
export SENTRY_URL="https://sentry.your-company.com"
export SENTRY_AUTH_TOKEN="your-auth-token"
```

### Creating a Sentry Auth Token

1. **Open Sentry** and log in to your account
2. **Navigate to API tokens:**
   - Click your avatar (top-left) → **Settings**
   - In the left sidebar: **Auth Tokens** (under Account)
   - Or go directly to: `{SENTRY_URL}/settings/account/api/auth-tokens/`
3. **Create a new token:**
   - Click **"Create New Token"**
   - Give it a name (e.g., "Claude Code Plugin")
   - Select these scopes:
     - `project:read` - List projects and read project settings
     - `event:read` - Read issues and events
     - `event:write` - Update issue status (resolve/ignore)
   - Click **"Create Token"**
4. **Copy the token** - it will only be shown once!
5. **Add to your environment:**
   ```bash
   # In .env file or shell profile
   SENTRY_URL=https://sentry.your-company.com
   SENTRY_AUTH_TOKEN=sntrys_eyJ...  # Your token here
   ```

> **Note:** For self-hosted Sentry, replace `sentry.your-company.com` with your instance URL.

## Quick Start

1. **Configure defaults:**
   ```
   /sentry:setup
   ```

2. **List recent issues:**
   ```
   /sentry:issues
   ```

3. **Get issue details:**
   ```
   /sentry:issue FRONTEND-123
   ```

## Commands

| Command | Description |
|---------|-------------|
| `/sentry:setup` | Configure organization, project, and credentials |
| `/sentry:issues [project] [--status ...]` | List recent issues with filters |
| `/sentry:issue <id>` | Get detailed issue information |
| `/sentry:resolve <id> [--unresolve\|--ignore]` | Update issue status |
| `/sentry:find-event <event-id>` | Find issue by event ID |
| `/sentry:stats [project]` | Get project error statistics |

## Configuration

After running `/sentry:setup`, a config file is created at `.claude/sentry.local.md`:

```yaml
---
organization: my-org
project: frontend
---
```

## MCP Tools

The plugin exposes these tools for programmatic access:

| Tool | Purpose |
|------|---------|
| `list_projects` | List all projects in an organization |
| `list_issues` | List issues with filters (project, status, query) |
| `get_issue` | Get detailed issue info (stack trace, tags, users) |
| `list_issue_events` | Get individual error occurrences |
| `update_issue_status` | Resolve, unresolve, or ignore issues |
| `get_project_stats` | Get error rates and top issues |

## Example Usage

Ask Claude naturally:
- "Show me unresolved issues in the frontend project"
- "What's the error rate for backend-api?"
- "Get details for issue FRONTEND-123 and help me debug it"
- "Resolve issue 456"

## Development

```bash
cd sentry
bun install      # Install dependencies
bun test         # Run tests (36 tests)
bun run start    # Run MCP server standalone
```

## Project Structure

```
sentry-mcp/
├── .claude-plugin/
│   └── marketplace.json   # Marketplace registration
├── sentry/                # Plugin directory
│   ├── .claude-plugin/
│   │   └── plugin.json    # Plugin manifest
│   ├── commands/          # Slash commands (6)
│   ├── skills/
│   │   └── sentry-debugging/
│   ├── .mcp.json          # MCP server config
│   ├── src/               # MCP server source
│   └── tests/             # Test suite
└── README.md
```

## License

MIT
