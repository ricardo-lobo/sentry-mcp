import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatProjectList, formatError } from "../formatters";
import type { ProjectListOutput, ErrorOutput } from "../types";

export const listProjectsSchema = z.object({
  organization: z.string().optional().describe("The organization slug (defaults to SENTRY_ORG env var)"),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

export async function listProjects(
  client: SentryClient,
  input: ListProjectsInput
): Promise<ProjectListOutput | ErrorOutput> {
  const organization = input.organization || process.env.SENTRY_ORG;

  if (!organization) {
    return {
      error: "Organization not specified",
      suggestion: "Set SENTRY_ORG in your .env file or pass organization parameter",
    };
  }

  try {
    const { data: projects, link } = await client.listProjects(organization);
    return formatProjectList(projects, link);
  } catch (error) {
    return formatError(error);
  }
}

export const listProjectsTool = {
  name: "list_projects",
  description:
    "List all Sentry projects in an organization. Uses SENTRY_ORG from env if not specified. Returns project names, slugs, platforms, and status.",
  inputSchema: {
    type: "object" as const,
    properties: {
      organization: {
        type: "string",
        description: "The organization slug (defaults to SENTRY_ORG env var)",
      },
    },
    required: [],
  },
};
