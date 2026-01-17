import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatProjectStats, formatError } from "../formatters";
import type { ProjectStatsOutput, ErrorOutput } from "../types";

export const getProjectStatsSchema = z.object({
  organization: z.string().optional().describe("The organization slug (defaults to SENTRY_ORG env var)"),
  project: z.string().optional().describe("The project slug (defaults to SENTRY_PROJECT env var)"),
});

export type GetProjectStatsInput = z.infer<typeof getProjectStatsSchema>;

export async function getProjectStats(
  client: SentryClient,
  input: GetProjectStatsInput
): Promise<ProjectStatsOutput | ErrorOutput> {
  const organization = input.organization || process.env.SENTRY_ORG;
  const project = input.project || process.env.SENTRY_PROJECT;

  if (!organization) {
    return {
      error: "Organization not specified",
      suggestion: "Set SENTRY_ORG in your .env file or pass organization parameter",
    };
  }

  if (!project) {
    return {
      error: "Project not specified",
      suggestion: "Set SENTRY_PROJECT in your .env file or pass project parameter",
    };
  }

  try {
    // Get stats for the last 24 hours
    const stats = await client.getProjectStats(
      organization,
      project,
      "received",
      "1h"
    );

    // Get top issues for context
    const { data: topIssues } = await client.listIssues(organization, {
      project,
      limit: 5,
    });

    return formatProjectStats(project, stats, topIssues);
  } catch (error) {
    return formatError(error);
  }
}

export const getProjectStatsTool = {
  name: "get_project_stats",
  description:
    "Get error statistics for a project. Uses SENTRY_ORG and SENTRY_PROJECT from env if not specified. Shows event counts, error rates, and top issues for last 24 hours.",
  inputSchema: {
    type: "object" as const,
    properties: {
      organization: {
        type: "string",
        description: "The organization slug (defaults to SENTRY_ORG env var)",
      },
      project: {
        type: "string",
        description: "The project slug (defaults to SENTRY_PROJECT env var)",
      },
    },
    required: [],
  },
};
