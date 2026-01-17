import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatIssueList, formatError } from "../formatters";
import type { IssueListOutput, ErrorOutput } from "../types";

export const listIssuesSchema = z.object({
  organization: z.string().optional().describe("The organization slug (defaults to SENTRY_ORG env var)"),
  project: z.string().optional().describe("Filter by project slug (defaults to SENTRY_PROJECT env var)"),
  status: z
    .enum(["resolved", "unresolved", "ignored"])
    .optional()
    .describe("Filter by issue status"),
  query: z.string().optional().describe("Search query (Sentry search syntax)"),
  cursor: z.string().optional().describe("Pagination cursor for next page"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(25)
    .describe("Number of issues to return (1-100, default 25)"),
});

export type ListIssuesInput = z.infer<typeof listIssuesSchema>;

export async function listIssues(
  client: SentryClient,
  input: ListIssuesInput
): Promise<IssueListOutput | ErrorOutput> {
  const organization = input.organization || process.env.SENTRY_ORG;
  const project = input.project || process.env.SENTRY_PROJECT;

  if (!organization) {
    return {
      error: "Organization not specified",
      suggestion: "Set SENTRY_ORG in your .env file or pass organization parameter",
    };
  }

  try {
    const { data: issues, link } = await client.listIssues(organization, {
      project,
      status: input.status,
      query: input.query,
      cursor: input.cursor,
      limit: input.limit,
    });
    return formatIssueList(issues, link);
  } catch (error) {
    return formatError(error);
  }
}

export const listIssuesTool = {
  name: "list_issues",
  description:
    "List issues in a Sentry organization with optional filters. Returns issue summaries with event counts, user impact, and timestamps. Uses SENTRY_ORG and SENTRY_PROJECT from env if not specified.",
  inputSchema: {
    type: "object" as const,
    properties: {
      organization: {
        type: "string",
        description: "The organization slug (defaults to SENTRY_ORG env var)",
      },
      project: {
        type: "string",
        description: "Filter by project slug (defaults to SENTRY_PROJECT env var)",
      },
      status: {
        type: "string",
        enum: ["resolved", "unresolved", "ignored"],
        description: "Filter by issue status (optional)",
      },
      query: {
        type: "string",
        description: "Search query using Sentry search syntax (optional)",
      },
      cursor: {
        type: "string",
        description: "Pagination cursor for next page (optional)",
      },
      limit: {
        type: "number",
        description: "Number of issues to return, 1-100 (default 25)",
      },
    },
    required: [],
  },
};
