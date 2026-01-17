#!/bin/bash
# Show welcome message only on first use in this project

MARKER_DIR="${CLAUDE_PROJECT_DIR:-.}/.claude"
MARKER_FILE="$MARKER_DIR/.sentry-welcomed"

# Check if already welcomed
if [ -f "$MARKER_FILE" ]; then
  exit 0
fi

# Create marker directory and file
mkdir -p "$MARKER_DIR"
touch "$MARKER_FILE"

# Output welcome message
cat << 'EOF'

  Sentry plugin ready!

  Commands:
    /sentry:issues  - List recent issues
    /sentry:issue   - Get issue details
    /sentry:stats   - Project statistics
    /sentry:setup   - Configuration help

  Tip: Run /sentry:setup if you haven't configured your .env yet.

EOF
