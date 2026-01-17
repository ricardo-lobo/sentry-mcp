import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatIssueDetail, formatError } from "../formatters";
import type { IssueDetailOutput, ErrorOutput } from "../types";

export const getIssueSchema = z.object({
  issueId: z
    .string()
    .describe("The issue ID (numeric) or short ID (e.g., PROJECT-123)"),
});

export type GetIssueInput = z.infer<typeof getIssueSchema>;

export async function getIssue(
  client: SentryClient,
  input: GetIssueInput
): Promise<IssueDetailOutput | ErrorOutput> {
  try {
    const issue = await client.getIssue(input.issueId);
    return formatIssueDetail(issue);
  } catch (error) {
    return formatError(error);
  }
}

export const getIssueTool = {
  name: "get_issue",
  description:
    "Get detailed information about a specific Sentry issue including error type, stack trace location, affected users, tags, and event counts.",
  inputSchema: {
    type: "object" as const,
    properties: {
      issueId: {
        type: "string",
        description: "The issue ID (numeric) or short ID (e.g., PROJECT-123)",
      },
    },
    required: ["issueId"],
  },
};
