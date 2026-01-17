import { describe, expect, test } from "bun:test";
import {
  formatProjectList,
  formatIssueList,
  formatIssueDetail,
  formatEventList,
  formatUpdateStatus,
  formatProjectStats,
  formatError,
} from "../src/formatters";
import { SentryApiError } from "../src/api/client";
import {
  mockProjects,
  mockIssues,
  mockIssueDetails,
  mockEvents,
  mockStats,
} from "./mocks";

describe("formatProjectList", () => {
  test("formats multiple projects correctly", () => {
    const result = formatProjectList(mockProjects);

    expect(result.total).toBe(3);
    expect(result.projects).toHaveLength(3);
    expect(result.projects[0].name).toBe("Frontend App");
    expect(result.projects[0].slug).toBe("frontend");
    expect(result.projects[0].platform).toBe("javascript-react");
    expect(result.message).toContain("Found 3 projects");
  });

  test("formats empty project list", () => {
    const result = formatProjectList([]);

    expect(result.total).toBe(0);
    expect(result.projects).toHaveLength(0);
    expect(result.message).toBe("No projects found in this organization.");
  });

  test("formats single project", () => {
    const result = formatProjectList([mockProjects[0]]);

    expect(result.total).toBe(1);
    expect(result.message).toContain("Found 1 project: Frontend App");
  });
});

describe("formatIssueList", () => {
  test("formats multiple issues correctly", () => {
    const result = formatIssueList(mockIssues);

    expect(result.showing).toBe(3);
    expect(result.issues).toHaveLength(3);
    expect(result.issues[0].shortId).toBe("FRONTEND-1");
    expect(result.issues[0].eventCount).toBe(47);
    expect(result.issues[0].userCount).toBe(12);
    expect(result.message).toContain("Showing 3 issue(s)");
  });

  test("formats empty issue list", () => {
    const result = formatIssueList([]);

    expect(result.showing).toBe(0);
    expect(result.issues).toHaveLength(0);
    expect(result.message).toBe("No issues found matching the criteria.");
  });

  test("parses pagination link header", () => {
    const linkHeader =
      '<https://sentry.io/api/0/issues/?cursor=abc123>; rel="next"; results="true"';
    const result = formatIssueList(mockIssues, linkHeader);

    expect(result.hasMore).toBe(true);
    expect(result.cursor).toBe("abc123");
    expect(result.message).toContain("(more available)");
  });

  test("handles no more results", () => {
    const linkHeader =
      '<https://sentry.io/api/0/issues/?cursor=abc123>; rel="next"; results="false"';
    const result = formatIssueList(mockIssues, linkHeader);

    expect(result.hasMore).toBe(false);
  });
});

describe("formatIssueDetail", () => {
  test("formats issue details correctly", () => {
    const result = formatIssueDetail(mockIssueDetails);

    expect(result.id).toBe("100");
    expect(result.shortId).toBe("FRONTEND-1");
    expect(result.title).toBe("TypeError: Cannot read property 'map' of undefined");
    expect(result.level).toBe("error");
    expect(result.status).toBe("unresolved");
    expect(result.eventCount).toBe(47);
    expect(result.userCount).toBe(12);
    expect(result.metadata.errorType).toBe("TypeError");
    expect(result.topTags).toHaveLength(5);
    expect(result.message).toContain("ERROR:");
    expect(result.message).toContain("47 events");
    expect(result.message).toContain("12 user(s)");
  });
});

describe("formatEventList", () => {
  test("formats multiple events correctly", () => {
    const result = formatEventList(mockEvents);

    expect(result.showing).toBe(3);
    expect(result.events).toHaveLength(3);
    expect(result.events[0].id).toBe("evt1");
    expect(result.events[0].user).toBe("user@example.com");
    expect(result.events[0].tags.browser).toBe("Chrome 120");
    expect(result.message).toContain("Showing 3 event(s)");
    expect(result.message).toContain("2 unique user(s)");
  });

  test("formats empty event list", () => {
    const result = formatEventList([]);

    expect(result.showing).toBe(0);
    expect(result.events).toHaveLength(0);
    expect(result.message).toBe("No events found for this issue.");
  });
});

describe("formatUpdateStatus", () => {
  test("formats successful status update", () => {
    const result = formatUpdateStatus("FRONTEND-1", "unresolved", "resolved", true);

    expect(result.issueId).toBe("FRONTEND-1");
    expect(result.previousStatus).toBe("unresolved");
    expect(result.newStatus).toBe("resolved");
    expect(result.success).toBe(true);
    expect(result.message).toContain('changed from "unresolved" to "resolved"');
  });

  test("formats failed status update", () => {
    const result = formatUpdateStatus("FRONTEND-1", "unresolved", "resolved", false);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Failed to update");
  });
});

describe("formatProjectStats", () => {
  test("formats project stats correctly", () => {
    const result = formatProjectStats("frontend", mockStats, mockIssues);

    expect(result.project).toBe("frontend");
    expect(result.period).toBe("24 hours");
    expect(result.totalEvents).toBe(332); // Sum of all mock stats
    expect(result.topIssues).toHaveLength(3);
    expect(result.message).toContain("332 events");
    expect(result.message).toContain("24 hours");
  });

  test("handles empty stats", () => {
    const result = formatProjectStats("frontend", [], []);

    expect(result.totalEvents).toBe(0);
    expect(result.topIssues).toHaveLength(0);
    expect(result.errorRate).toBe("0/hr");
  });
});

describe("formatError", () => {
  test("formats SentryApiError correctly", () => {
    const error = new SentryApiError(401, "Unauthorized", "Check your token", "Details");
    const result = formatError(error);

    expect(result.error).toContain("401");
    expect(result.suggestion).toBe("Check your token");
    expect(result.details).toBe("Details");
  });

  test("formats generic Error", () => {
    const error = new Error("Something went wrong");
    const result = formatError(error);

    expect(result.error).toBe("Something went wrong");
    expect(result.suggestion).toContain("Check the error message");
  });

  test("formats unknown error", () => {
    const result = formatError("string error");

    expect(result.error).toBe("An unexpected error occurred");
    expect(result.suggestion).toContain("Try the operation again");
  });
});
