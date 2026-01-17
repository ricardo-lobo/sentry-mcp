import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatUpdateStatus, formatError } from "../formatters";
import type { UpdateStatusOutput, ErrorOutput } from "../types";

export const updateIssueStatusSchema = z.object({
  issueId: z
    .string()
    .describe("The issue ID (numeric) or short ID (e.g., PROJECT-123)"),
  status: z
    .enum(["resolved", "unresolved", "ignored"])
    .describe("The new status for the issue"),
});

export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;

export async function updateIssueStatus(
  client: SentryClient,
  input: UpdateIssueStatusInput
): Promise<UpdateStatusOutput | ErrorOutput> {
  try {
    // First get current status
    const currentIssue = await client.getIssue(input.issueId);
    const previousStatus = currentIssue.status;

    // Update status
    await client.updateIssueStatus(input.issueId, input.status);

    return formatUpdateStatus(input.issueId, previousStatus, input.status, true);
  } catch (error) {
    return formatError(error);
  }
}

export const updateIssueStatusTool = {
  name: "update_issue_status",
  description:
    "Update the status of a Sentry issue. Can resolve, unresolve, or ignore an issue.",
  inputSchema: {
    type: "object" as const,
    properties: {
      issueId: {
        type: "string",
        description: "The issue ID (numeric) or short ID (e.g., PROJECT-123)",
      },
      status: {
        type: "string",
        enum: ["resolved", "unresolved", "ignored"],
        description: "The new status: resolved, unresolved, or ignored",
      },
    },
    required: ["issueId", "status"],
  },
};
