import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatProjectStats, formatError } from "../formatters";
import type { ProjectStatsOutput, ErrorOutput } from "../types";

export const getProjectStatsSchema = z.object({
  organization: z.string().describe("The organization slug"),
  project: z.string().describe("The project slug"),
});

export type GetProjectStatsInput = z.infer<typeof getProjectStatsSchema>;

export async function getProjectStats(
  client: SentryClient,
  input: GetProjectStatsInput
): Promise<ProjectStatsOutput | ErrorOutput> {
  try {
    // Get stats for the last 24 hours
    const stats = await client.getProjectStats(
      input.organization,
      input.project,
      "received",
      "1h"
    );

    // Get top issues for context
    const { data: topIssues } = await client.listIssues(input.organization, {
      project: input.project,
      limit: 5,
    });

    return formatProjectStats(input.project, stats, topIssues);
  } catch (error) {
    return formatError(error);
  }
}

export const getProjectStatsTool = {
  name: "get_project_stats",
  description:
    "Get error statistics for a project including event counts, error rates, and top issues. Shows data for the last 24 hours.",
  inputSchema: {
    type: "object" as const,
    properties: {
      organization: {
        type: "string",
        description: "The organization slug",
      },
      project: {
        type: "string",
        description: "The project slug",
      },
    },
    required: ["organization", "project"],
  },
};
