import { z } from "zod";
import type { SentryClient } from "../api/client";
import { formatProjectList, formatError } from "../formatters";
import type { ProjectListOutput, ErrorOutput } from "../types";

export const listProjectsSchema = z.object({
  organization: z.string().describe("The organization slug to list projects for"),
});

export type ListProjectsInput = z.infer<typeof listProjectsSchema>;

export async function listProjects(
  client: SentryClient,
  input: ListProjectsInput
): Promise<ProjectListOutput | ErrorOutput> {
  try {
    const { data: projects, link } = await client.listProjects(input.organization);
    return formatProjectList(projects, link);
  } catch (error) {
    return formatError(error);
  }
}

export const listProjectsTool = {
  name: "list_projects",
  description:
    "List all Sentry projects in an organization with key stats. Returns project names, slugs, platforms, and status.",
  inputSchema: {
    type: "object" as const,
    properties: {
      organization: {
        type: "string",
        description: "The organization slug to list projects for",
      },
    },
    required: ["organization"],
  },
};
