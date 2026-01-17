import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatEventList, formatError } from "../formatters";
import type { EventListOutput, ErrorOutput } from "../types";

export const listIssueEventsSchema = z.object({
  issueId: z
    .string()
    .describe("The issue ID (numeric) or short ID (e.g., PROJECT-123)"),
  cursor: z.string().optional().describe("Pagination cursor for next page"),
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(25)
    .describe("Number of events to return (1-100, default 25)"),
});

export type ListIssueEventsInput = z.infer<typeof listIssueEventsSchema>;

export async function listIssueEvents(
  client: SentryClient,
  input: ListIssueEventsInput
): Promise<EventListOutput | ErrorOutput> {
  try {
    const { data: events, link } = await client.listIssueEvents(input.issueId, {
      cursor: input.cursor,
      limit: input.limit,
    });
    return formatEventList(events, link);
  } catch (error) {
    return formatError(error);
  }
}

export const listIssueEventsTool = {
  name: "list_issue_events",
  description:
    "Get events (occurrences) for a specific issue. Returns summarized event data with timestamps, affected users, and key tags. Use cursor for pagination.",
  inputSchema: {
    type: "object" as const,
    properties: {
      issueId: {
        type: "string",
        description: "The issue ID (numeric) or short ID (e.g., PROJECT-123)",
      },
      cursor: {
        type: "string",
        description: "Pagination cursor for next page (optional)",
      },
      limit: {
        type: "number",
        description: "Number of events to return, 1-100 (default 25)",
      },
    },
    required: ["issueId"],
  },
};
