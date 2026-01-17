#!/usr/bin/env bun
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createSentryClient, SentryClient } from "./api/client";
import {
  listProjects,
  listProjectsSchema,
  listProjectsTool,
  listIssues,
  listIssuesSchema,
  listIssuesTool,
  getIssue,
  getIssueSchema,
  getIssueTool,
  listIssueEvents,
  listIssueEventsSchema,
  listIssueEventsTool,
  updateIssueStatus,
  updateIssueStatusSchema,
  updateIssueStatusTool,
  getProjectStats,
  getProjectStatsSchema,
  getProjectStatsTool,
} from "./tools";

const TOOLS = [
  listProjectsTool,
  listIssuesTool,
  getIssueTool,
  listIssueEventsTool,
  updateIssueStatusTool,
  getProjectStatsTool,
];

class SentryMcpServer {
  private server: Server;
  private client: SentryClient;

  constructor() {
    this.client = createSentryClient();

    this.server = new Server(
      {
        name: "sentry-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let result: unknown;

        switch (name) {
          case "list_projects": {
            const parsed = listProjectsSchema.parse(args);
            result = await listProjects(this.client, parsed);
            break;
          }
          case "list_issues": {
            const parsed = listIssuesSchema.parse(args);
            result = await listIssues(this.client, parsed);
            break;
          }
          case "get_issue": {
            const parsed = getIssueSchema.parse(args);
            result = await getIssue(this.client, parsed);
            break;
          }
          case "list_issue_events": {
            const parsed = listIssueEventsSchema.parse(args);
            result = await listIssueEvents(this.client, parsed);
            break;
          }
          case "update_issue_status": {
            const parsed = updateIssueStatusSchema.parse(args);
            result = await updateIssueStatus(this.client, parsed);
            break;
          }
          case "get_project_stats": {
            const parsed = getProjectStatsSchema.parse(args);
            result = await getProjectStats(this.client, parsed);
            break;
          }
          default:
            return {
              content: [
                {
                  type: "text" as const,
                  text: JSON.stringify({
                    error: `Unknown tool: ${name}`,
                    suggestion: `Available tools: ${TOOLS.map((t) => t.name).join(", ")}`,
                  }),
                },
              ],
              isError: true,
            };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                error: errorMessage,
                suggestion:
                  "Check your input parameters and try again. Ensure all required fields are provided.",
              }),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Sentry MCP server running on stdio");
  }
}

// Main entry point
const server = new SentryMcpServer();
server.run().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
