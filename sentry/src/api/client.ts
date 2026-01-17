import type {
  SentryConfig,
  SentryProject,
  SentryIssue,
  SentryIssueDetails,
  SentryEvent,
  SentryEventDetails,
  ErrorOutput,
} from "../types";

export class SentryApiError extends Error {
  constructor(
    public statusCode: number,
    public statusText: string,
    public suggestion: string,
    public details?: string
  ) {
    super(`Sentry API Error: ${statusCode} ${statusText}`);
    this.name = "SentryApiError";
  }

  toErrorOutput(): ErrorOutput {
    return {
      error: this.message,
      suggestion: this.suggestion,
      details: this.details,
    };
  }
}

export class SentryClient {
  private baseUrl: string;
  private authToken: string;

  constructor(config: SentryConfig) {
    this.baseUrl = config.url.replace(/\/$/, "");
    this.authToken = config.authToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; link?: string }> {
    const url = `${this.baseUrl}/api/0${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw this.createApiError(response.status, response.statusText, errorText);
    }

    const data = (await response.json()) as T;
    const link = response.headers.get("Link") || undefined;

    return { data, link };
  }

  private createApiError(
    status: number,
    statusText: string,
    details: string
  ): SentryApiError {
    let suggestion: string;

    switch (status) {
      case 401:
        suggestion =
          "Check your SENTRY_AUTH_TOKEN. Ensure it has the required scopes (project:read, event:read, event:write).";
        break;
      case 403:
        suggestion =
          "You don't have permission to access this resource. Check your token scopes and organization membership.";
        break;
      case 404:
        suggestion =
          "The resource was not found. Verify the project slug, issue ID, or organization name is correct.";
        break;
      case 429:
        suggestion =
          "Rate limit exceeded. Wait a moment before retrying. Consider reducing request frequency.";
        break;
      case 500:
      case 502:
      case 503:
        suggestion =
          "Sentry server error. This is temporary - retry in a few moments.";
        break;
      default:
        suggestion = "Check your Sentry URL and network connection.";
    }

    return new SentryApiError(status, statusText, suggestion, details);
  }

  // Projects
  async listProjects(
    organization: string
  ): Promise<{ data: SentryProject[]; link?: string }> {
    return this.request<SentryProject[]>(
      `/organizations/${organization}/projects/`
    );
  }

  // Issues
  async listIssues(
    organization: string,
    options: {
      project?: string;
      query?: string;
      status?: string;
      cursor?: string;
      limit?: number;
    } = {}
  ): Promise<{ data: SentryIssue[]; link?: string }> {
    const params = new URLSearchParams();
    if (options.project) params.set("project", options.project);
    if (options.query) params.set("query", options.query);
    if (options.status) params.set("query", `is:${options.status}`);
    if (options.cursor) params.set("cursor", options.cursor);
    if (options.limit) params.set("limit", options.limit.toString());

    const queryString = params.toString();
    const endpoint = `/organizations/${organization}/issues/${queryString ? `?${queryString}` : ""}`;

    return this.request<SentryIssue[]>(endpoint);
  }

  async getIssue(issueId: string): Promise<SentryIssueDetails> {
    const { data } = await this.request<SentryIssueDetails>(`/issues/${issueId}/`);
    return data;
  }

  async updateIssueStatus(
    issueId: string,
    status: "resolved" | "unresolved" | "ignored"
  ): Promise<SentryIssueDetails> {
    const { data } = await this.request<SentryIssueDetails>(`/issues/${issueId}/`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return data;
  }

  // Events
  async listIssueEvents(
    issueId: string,
    options: { cursor?: string; limit?: number } = {}
  ): Promise<{ data: SentryEvent[]; link?: string }> {
    const params = new URLSearchParams();
    if (options.cursor) params.set("cursor", options.cursor);
    if (options.limit) params.set("limit", options.limit.toString());

    const queryString = params.toString();
    const endpoint = `/issues/${issueId}/events/${queryString ? `?${queryString}` : ""}`;

    return this.request<SentryEvent[]>(endpoint);
  }

  async getEvent(
    organization: string,
    projectSlug: string,
    eventId: string
  ): Promise<SentryEventDetails> {
    const { data } = await this.request<SentryEventDetails>(
      `/projects/${organization}/${projectSlug}/events/${eventId}/`
    );
    return data;
  }

  // Stats
  async getProjectStats(
    organization: string,
    projectSlug: string,
    stat: "received" | "rejected" | "blacklisted" = "received",
    resolution: "10s" | "1h" | "1d" = "1h"
  ): Promise<number[][]> {
    const params = new URLSearchParams({
      stat,
      resolution,
    });

    const { data } = await this.request<number[][]>(
      `/projects/${organization}/${projectSlug}/stats/?${params.toString()}`
    );
    return data;
  }
}

export function createSentryClient(): SentryClient {
  const url = process.env.SENTRY_URL;
  const authToken = process.env.SENTRY_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "SENTRY_URL environment variable is required. Set it to your Sentry instance URL (e.g., https://sentry.io or https://sentry.mycompany.com)"
    );
  }

  if (!authToken) {
    throw new Error(
      "SENTRY_AUTH_TOKEN environment variable is required. Create an auth token at {SENTRY_URL}/settings/account/api/auth-tokens/ with scopes: project:read, event:read, event:write"
    );
  }

  return new SentryClient({ url, authToken });
}
