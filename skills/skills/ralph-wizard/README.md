---
name: ralph-wizard
description: Use when starting a Ralph loop and you want guided prompt creation. Asks questions to gather specs, requirements, tech stack, testing needs, and completion criteria before auto-starting the loop.
---

# Ralph Wizard

Interactive workflow for creating well-structured Ralph loop prompts.

## When to Use

- Starting a new Ralph loop for any task
- When you want comprehensive, well-structured prompts
- Both greenfield projects and feature work

## Workflow

**You MUST use AskUserQuestion to gather ALL information before generating the prompt.**

### Phase 1: Core Task Understanding

Ask these questions using AskUserQuestion:

```
Question 1: "What is the main task you want Ralph to accomplish?"
Header: "Task"
Options:
- "Build a new tool/project" - Greenfield development
- "Add feature to existing code" - Feature implementation
- "Fix bugs or refactor" - Maintenance work
- "Other" - Custom task description
```

```
Question 2: "Describe the task in detail (what should be built/done):"
Header: "Description"
[Free text - use "Other" option]
```

### Phase 2: Technical Requirements

```
Question 3: "What tech stack should be used?"
Header: "Stack"
Options:
- "TypeScript + Bun" - Fast, modern TS runtime
- "TypeScript + Node" - Standard Node.js
- "Python" - Python ecosystem
- "Other" - Specify custom stack
```

```
Question 4: "Where should the work be done?"
Header: "Location"
Options:
- "New directory (specify path)" - Create fresh
- "Current directory" - Work in place
- "Existing project (specify)" - Add to existing
```

### Phase 3: Quality & Testing

```
Question 5: "What testing approach?"
Header: "Testing"
Options:
- "TDD - Write tests first" - Test-driven development
- "Tests after implementation" - Traditional approach
- "No tests required" - Quick prototype
- "Integration tests only" - End-to-end focus
```

```
Question 6: "Documentation requirements?"
Header: "Docs"
Options:
- "README with examples" - Standard documentation
- "Inline comments only" - Minimal docs
- "Full docs + API reference" - Comprehensive
- "None" - Skip documentation
```

### Phase 4: Completion & Safety

```
Question 7: "What signals task completion?"
Header: "Done when"
Options:
- "All tests passing" - Test-driven completion
- "Feature working + manual verification" - Demo-ready
- "Specific deliverables (list them)" - Custom criteria
```

```
Question 8: "Maximum iterations before stopping?"
Header: "Max iter"
Options:
- "10 iterations" - Quick tasks
- "25 iterations" - Medium complexity
- "50 iterations" - Complex projects
- "100 iterations" - Long-running tasks
```

## Prompt Template

After gathering answers, construct the prompt using this structure:

```markdown
[TASK DESCRIPTION - from user's answers]

Tech stack:
- [Stack from answers]

Project location: [Path from answers]

Requirements:
- [List specific requirements gathered]

Testing approach:
- [Testing strategy from answers]
- Write failing tests first (if TDD selected)
- Run tests after each change
- Fix failures before proceeding

Documentation:
- [Documentation requirements]

When complete:
- [Completion criteria from answers]
- Output: <promise>COMPLETE</promise>

If stuck after [N-3] iterations:
- Document current status and blockers
- List what was attempted
- Output: <promise>COMPLETE</promise>
```

## Execution

After constructing the prompt:

1. Show the generated prompt to the user briefly
2. Ask for confirmation: "Start Ralph loop with this prompt?"
3. If confirmed, execute:

```
/ralph-loop "[generated prompt]" --max-iterations [N] --completion-promise "COMPLETE"
```

## Example Session

**User:** `/ralph-wizard`

**Claude asks questions, user answers:**
- Task: Build new tool
- Description: MCP server for GitHub notifications
- Stack: TypeScript + Bun
- Location: tools/github-notifier/
- Testing: TDD
- Docs: README with examples
- Done when: All tests passing, 3 MCP tools working
- Max iterations: 25

**Claude generates prompt:**
```
Build an MCP server for GitHub notifications.

Tech stack:
- TypeScript with Bun
- Use fetch for GitHub API

Project location: tools/github-notifier/

Requirements:
- Implement 3 MCP tools: list_notifications, mark_read, get_notification_details
- LLM-friendly output (structured, summarized)

Testing approach:
- TDD: Write failing tests first
- Use bun:test with mocked HTTP
- Run 'bun test' after each change

Documentation:
- README with setup and examples

When complete:
- All 3 MCP tools working
- Tests passing
- README documented
- Output: <promise>COMPLETE</promise>

If stuck after 22 iterations, document status and output: <promise>COMPLETE</promise>
```

**Claude runs:**
```
/ralph-loop "[prompt]" --max-iterations 25 --completion-promise "COMPLETE"
```

## Tips

- Be specific in task description - vague prompts lead to wandering
- Always include escape hatch (stuck after N iterations)
- TDD works best for well-defined tasks
- Keep completion criteria measurable
