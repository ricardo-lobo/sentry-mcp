import type {
  SentryProject,
  SentryIssue,
  SentryIssueDetails,
  SentryEvent,
  ProjectListOutput,
  ProjectSummary,
  IssueListOutput,
  IssueSummary,
  IssueDetailOutput,
  EventListOutput,
  EventSummary,
  UpdateStatusOutput,
  ProjectStatsOutput,
  ErrorOutput,
} from "../types";
import { SentryApiError } from "../api/client";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toISOString().split("T")[0];
}

function parseLinkHeader(link: string | undefined): { hasMore: boolean; cursor?: string } {
  if (!link) return { hasMore: false };

  const nextMatch = link.match(/rel="next"[^,]*results="true"/);
  if (!nextMatch) return { hasMore: false };

  const cursorMatch = link.match(/<[^>]*cursor=([^&>]+)[^>]*>;\s*rel="next"/);
  return {
    hasMore: true,
    cursor: cursorMatch ? cursorMatch[1] : undefined,
  };
}

export function formatProjectList(
  projects: SentryProject[],
  _link?: string
): ProjectListOutput {
  const projectSummaries: ProjectSummary[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    platform: p.platform || "unknown",
    status: p.status,
    createdAt: formatRelativeTime(p.dateCreated),
  }));

  const total = projects.length;
  let message: string;

  if (total === 0) {
    message = "No projects found in this organization.";
  } else if (total === 1) {
    message = `Found 1 project: ${projects[0].name}`;
  } else {
    const platforms = [...new Set(projects.map((p) => p.platform || "unknown"))];
    message = `Found ${total} projects across ${platforms.length} platform(s): ${platforms.slice(0, 3).join(", ")}${platforms.length > 3 ? "..." : ""}`;
  }

  return {
    projects: projectSummaries,
    total,
    message,
  };
}

export function formatIssueList(
  issues: SentryIssue[],
  link?: string
): IssueListOutput {
  const { hasMore, cursor } = parseLinkHeader(link);

  const issueSummaries: IssueSummary[] = issues.map((i) => ({
    id: i.id,
    shortId: i.shortId,
    title: i.title,
    level: i.level,
    status: i.status,
    eventCount: parseInt(i.count, 10),
    userCount: i.userCount,
    firstSeen: formatRelativeTime(i.firstSeen),
    lastSeen: formatRelativeTime(i.lastSeen),
    project: i.project.slug,
    link: i.permalink,
  }));

  const showing = issues.length;
  let message: string;

  if (showing === 0) {
    message = "No issues found matching the criteria.";
  } else {
    const unresolvedCount = issues.filter((i) => i.status === "unresolved").length;
    const totalEvents = issues.reduce((sum, i) => sum + parseInt(i.count, 10), 0);
    message = `Showing ${showing} issue(s)${hasMore ? " (more available)" : ""}. ${unresolvedCount} unresolved, ${totalEvents} total events.`;
  }

  return {
    issues: issueSummaries,
    showing,
    hasMore,
    cursor,
    message,
  };
}

export function formatIssueDetail(issue: SentryIssueDetails): IssueDetailOutput {
  const eventCount = parseInt(issue.count, 10);
  const lastSeenRelative = formatRelativeTime(issue.lastSeen);

  const topTags = issue.tags
    .slice(0, 5)
    .map((t) => ({ key: t.key, value: t.value }));

  const message = `${issue.level.toUpperCase()}: "${issue.title}" - ${eventCount} events affecting ${issue.userCount} user(s), last seen ${lastSeenRelative}`;

  return {
    id: issue.id,
    shortId: issue.shortId,
    title: issue.title,
    level: issue.level,
    status: issue.status,
    type: issue.type,
    culprit: issue.culprit,
    eventCount,
    userCount: issue.userCount,
    firstSeen: formatRelativeTime(issue.firstSeen),
    lastSeen: lastSeenRelative,
    project: issue.project.slug,
    link: issue.permalink,
    metadata: {
      errorType: issue.metadata.type,
      errorValue: issue.metadata.value,
      filename: issue.metadata.filename,
      function: issue.metadata.function,
    },
    topTags,
    message,
  };
}

export function formatEventList(
  events: SentryEvent[],
  link?: string
): EventListOutput {
  const { hasMore, cursor } = parseLinkHeader(link);

  const eventSummaries: EventSummary[] = events.map((e) => {
    const tags: Record<string, string> = {};
    e.tags.forEach((t) => {
      tags[t.key] = t.value;
    });

    let user: string | undefined;
    if (e.user) {
      user =
        e.user.email ||
        e.user.username ||
        e.user.id ||
        e.user.ip_address ||
        undefined;
    }

    return {
      id: e.eventID || e.id,
      title: e.title,
      message: e.message || "",
      timestamp: formatRelativeTime(e.dateCreated),
      user,
      tags,
    };
  });

  const showing = events.length;
  const usersAffected = new Set(eventSummaries.filter((e) => e.user).map((e) => e.user)).size;

  let message: string;
  if (showing === 0) {
    message = "No events found for this issue.";
  } else {
    message = `Showing ${showing} event(s)${hasMore ? " (more available)" : ""}. ${usersAffected} unique user(s) affected.`;
  }

  return {
    events: eventSummaries,
    showing,
    hasMore,
    cursor,
    message,
  };
}

export function formatUpdateStatus(
  issueId: string,
  previousStatus: string,
  newStatus: string,
  success: boolean
): UpdateStatusOutput {
  const message = success
    ? `Issue ${issueId} status changed from "${previousStatus}" to "${newStatus}".`
    : `Failed to update issue ${issueId} status.`;

  return {
    issueId,
    previousStatus,
    newStatus,
    success,
    message,
  };
}

export function formatProjectStats(
  projectSlug: string,
  stats: number[][],
  topIssues: SentryIssue[]
): ProjectStatsOutput {
  const totalEvents = stats.reduce((sum, [, count]) => sum + count, 0);
  const hours = stats.length;
  const avgPerHour = hours > 0 ? Math.round(totalEvents / hours) : 0;

  const topIssuesSummary = topIssues.slice(0, 5).map((i) => ({
    id: i.shortId,
    title: i.title,
    count: parseInt(i.count, 10),
  }));

  const message = `Project "${projectSlug}": ${totalEvents} events in the last ${hours} hours (avg ${avgPerHour}/hr). ${topIssuesSummary.length} top issue(s) listed.`;

  return {
    project: projectSlug,
    period: `${hours} hours`,
    totalEvents,
    totalErrors: totalEvents, // Stats endpoint returns error events by default
    errorRate: `${avgPerHour}/hr`,
    topIssues: topIssuesSummary,
    message,
  };
}

export function formatError(error: unknown): ErrorOutput {
  if (error instanceof SentryApiError) {
    return error.toErrorOutput();
  }

  if (error instanceof Error) {
    return {
      error: error.message,
      suggestion: "Check the error message and try again. Ensure your configuration is correct.",
      details: error.stack,
    };
  }

  return {
    error: "An unexpected error occurred",
    suggestion: "Try the operation again. If the problem persists, check your Sentry configuration.",
  };
}
