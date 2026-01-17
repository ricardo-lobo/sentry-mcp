import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { SentryClient } from "../src/api/client";
import {
  listProjects,
  listIssues,
  getIssue,
  listIssueEvents,
  updateIssueStatus,
  getProjectStats,
} from "../src/tools";
import {
  mockProjects,
  mockIssues,
  mockIssueDetails,
  mockEvents,
  mockStats,
} from "./mocks";

describe("MCP Tools", () => {
  const originalFetch = globalThis.fetch;
  let mockFetchFn: ReturnType<typeof mock>;
  let client: SentryClient;

  beforeEach(() => {
    mockFetchFn = mock(() =>
      Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
    );
    globalThis.fetch = mockFetchFn;
    client = new SentryClient({
      url: "https://sentry.example.com",
      authToken: "test-token",
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("listProjects", () => {
    test("returns formatted project list", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(mockProjects), { status: 200 }))
      );

      const result = await listProjects(client, { organization: "my-org" });

      expect("projects" in result).toBe(true);
      if ("projects" in result) {
        expect(result.projects).toHaveLength(3);
        expect(result.total).toBe(3);
        expect(result.message).toContain("Found 3 projects");
      }
    });

    test("returns error on failure", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ detail: "Not found" }), { status: 404 })
        )
      );

      const result = await listProjects(client, { organization: "bad-org" });

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.suggestion).toBeTruthy();
      }
    });
  });

  describe("listIssues", () => {
    test("returns formatted issue list", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(mockIssues), { status: 200 }))
      );

      const result = await listIssues(client, {
        organization: "my-org",
        project: "frontend",
        status: "unresolved",
        limit: 25,
      });

      expect("issues" in result).toBe(true);
      if ("issues" in result) {
        expect(result.issues).toHaveLength(3);
        expect(result.showing).toBe(3);
        expect(result.message).toContain("Showing 3 issue(s)");
      }
    });
  });

  describe("getIssue", () => {
    test("returns formatted issue detail", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(mockIssueDetails), { status: 200 }))
      );

      const result = await getIssue(client, { issueId: "100" });

      expect("shortId" in result).toBe(true);
      if ("shortId" in result) {
        expect(result.shortId).toBe("FRONTEND-1");
        expect(result.eventCount).toBe(47);
        expect(result.topTags).toHaveLength(5);
        expect(result.message).toContain("ERROR:");
      }
    });
  });

  describe("listIssueEvents", () => {
    test("returns formatted event list", async () => {
      mockFetchFn.mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify(mockEvents), { status: 200 }))
      );

      const result = await listIssueEvents(client, { issueId: "100", limit: 25 });

      expect("events" in result).toBe(true);
      if ("events" in result) {
        expect(result.events).toHaveLength(3);
        expect(result.showing).toBe(3);
        expect(result.events[0].user).toBe("user@example.com");
      }
    });
  });

  describe("updateIssueStatus", () => {
    test("returns success on status update", async () => {
      // First call: get current status
      // Second call: update status
      let callCount = 0;
      mockFetchFn.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve(
            new Response(JSON.stringify(mockIssueDetails), { status: 200 })
          );
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({ ...mockIssueDetails, status: "resolved" }),
            { status: 200 }
          )
        );
      });

      const result = await updateIssueStatus(client, {
        issueId: "100",
        status: "resolved",
      });

      expect("success" in result).toBe(true);
      if ("success" in result) {
        expect(result.success).toBe(true);
        expect(result.previousStatus).toBe("unresolved");
        expect(result.newStatus).toBe("resolved");
        expect(result.message).toContain("changed from");
      }
    });
  });

  describe("getProjectStats", () => {
    test("returns formatted project stats", async () => {
      let callCount = 0;
      mockFetchFn.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // Stats call
          return Promise.resolve(
            new Response(JSON.stringify(mockStats), { status: 200 })
          );
        }
        // Issues call
        return Promise.resolve(
          new Response(JSON.stringify(mockIssues), { status: 200 })
        );
      });

      const result = await getProjectStats(client, {
        organization: "my-org",
        project: "frontend",
      });

      expect("totalEvents" in result).toBe(true);
      if ("totalEvents" in result) {
        expect(result.project).toBe("frontend");
        expect(result.totalEvents).toBe(332);
        expect(result.topIssues).toHaveLength(3);
        expect(result.message).toContain("332 events");
      }
    });
  });
});
