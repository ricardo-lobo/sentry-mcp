import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { SentryClient, SentryApiError, createSentryClient } from "../src/api/client";
import { mockProjects, mockIssues, mockIssueDetails, mockEvents } from "./mocks";

describe("SentryClient", () => {
  const originalFetch = globalThis.fetch;
  let mockFetchFn: ReturnType<typeof mock>;

  beforeEach(() => {
    mockFetchFn = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify([]), {
          status: 200,
          headers: new Headers(),
        })
      )
    );
    globalThis.fetch = mockFetchFn;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const client = new SentryClient({
    url: "https://sentry.example.com",
    authToken: "test-token",
  });

  describe("listProjects", () => {
    test("fetches projects successfully", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockProjects), {
            status: 200,
            headers: new Headers(),
          })
        )
      );

      const { data } = await client.listProjects("my-org");

      expect(data).toHaveLength(3);
      expect(mockFetchFn).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://sentry.example.com/api/0/organizations/my-org/projects/");
      expect(options.headers).toHaveProperty("Authorization", "Bearer test-token");
    });
  });

  describe("listIssues", () => {
    test("fetches issues with filters", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockIssues), {
            status: 200,
            headers: new Headers({ Link: '<url>; rel="next"; results="true"' }),
          })
        )
      );

      const { data, link } = await client.listIssues("my-org", {
        project: "frontend",
        limit: 10,
      });

      expect(data).toHaveLength(3);
      expect(link).toContain("next");
      const [url] = mockFetchFn.mock.calls[0] as [string];
      expect(url).toContain("project=frontend");
      expect(url).toContain("limit=10");
    });
  });

  describe("getIssue", () => {
    test("fetches issue details", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockIssueDetails), {
            status: 200,
            headers: new Headers(),
          })
        )
      );

      const issue = await client.getIssue("100");

      expect(issue.id).toBe("100");
      expect(issue.shortId).toBe("FRONTEND-1");
      expect(issue.metadata.type).toBe("TypeError");
    });
  });

  describe("updateIssueStatus", () => {
    test("updates issue status", async () => {
      const updatedIssue = { ...mockIssueDetails, status: "resolved" };
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(updatedIssue), {
            status: 200,
            headers: new Headers(),
          })
        )
      );

      const issue = await client.updateIssueStatus("100", "resolved");

      expect(issue.status).toBe("resolved");
      const [, options] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(options.method).toBe("PUT");
      expect(options.body).toBe(JSON.stringify({ status: "resolved" }));
    });
  });

  describe("listIssueEvents", () => {
    test("fetches issue events", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockEvents), {
            status: 200,
            headers: new Headers(),
          })
        )
      );

      const { data } = await client.listIssueEvents("100", { limit: 25 });

      expect(data).toHaveLength(3);
      const [url] = mockFetchFn.mock.calls[0] as [string];
      expect(url).toContain("/issues/100/events/");
      expect(url).toContain("limit=25");
    });
  });

  describe("getProjectStats", () => {
    test("fetches project stats", async () => {
      const stats = [[Date.now(), 10]];
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(stats), {
            status: 200,
            headers: new Headers(),
          })
        )
      );

      const data = await client.getProjectStats("my-org", "frontend");

      expect(data).toHaveLength(1);
      const [url] = mockFetchFn.mock.calls[0] as [string];
      expect(url).toContain("/projects/my-org/frontend/stats/");
    });
  });

  describe("error handling", () => {
    test("throws SentryApiError on 401", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ detail: "Invalid token" }), {
            status: 401,
            statusText: "Unauthorized",
          })
        )
      );

      try {
        await client.listProjects("my-org");
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(SentryApiError);
        const apiError = error as SentryApiError;
        expect(apiError.statusCode).toBe(401);
        expect(apiError.suggestion).toContain("SENTRY_AUTH_TOKEN");
      }
    });

    test("throws SentryApiError on 404", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ detail: "Not found" }), {
            status: 404,
            statusText: "Not Found",
          })
        )
      );

      try {
        await client.getIssue("nonexistent");
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(SentryApiError);
        const apiError = error as SentryApiError;
        expect(apiError.statusCode).toBe(404);
        expect(apiError.suggestion).toContain("not found");
      }
    });

    test("throws SentryApiError on 429 rate limit", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ detail: "Rate limited" }), {
            status: 429,
            statusText: "Too Many Requests",
          })
        )
      );

      try {
        await client.listIssues("my-org");
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(SentryApiError);
        const apiError = error as SentryApiError;
        expect(apiError.statusCode).toBe(429);
        expect(apiError.suggestion).toContain("Rate limit");
      }
    });
  });
});

describe("createSentryClient", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("throws error when SENTRY_URL is missing", () => {
    delete process.env.SENTRY_URL;
    delete process.env.SENTRY_AUTH_TOKEN;

    expect(() => createSentryClient()).toThrow("SENTRY_URL");
  });

  test("throws error when SENTRY_AUTH_TOKEN is missing", () => {
    process.env.SENTRY_URL = "https://sentry.example.com";
    delete process.env.SENTRY_AUTH_TOKEN;

    expect(() => createSentryClient()).toThrow("SENTRY_AUTH_TOKEN");
  });

  test("creates client with valid config", () => {
    process.env.SENTRY_URL = "https://sentry.example.com";
    process.env.SENTRY_AUTH_TOKEN = "test-token";

    const client = createSentryClient();
    expect(client).toBeInstanceOf(SentryClient);
  });
});
