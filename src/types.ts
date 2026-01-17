// Sentry API Types

export interface SentryConfig {
  url: string;
  authToken: string;
}

export interface SentryProject {
  id: string;
  slug: string;
  name: string;
  platform: string | null;
  dateCreated: string;
  status: string;
}

export interface SentryProjectStats {
  id: string;
  slug: string;
  name: string;
  totalEvents24h: number;
  totalErrors24h: number;
  totalTransactions24h: number;
}

export interface SentryIssue {
  id: string;
  shortId: string;
  title: string;
  culprit: string;
  level: string;
  status: string;
  platform: string;
  project: {
    id: string;
    slug: string;
    name: string;
  };
  type: string;
  count: string;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  permalink: string;
}

export interface SentryIssueDetails extends SentryIssue {
  metadata: {
    type?: string;
    value?: string;
    filename?: string;
    function?: string;
  };
  tags: Array<{
    key: string;
    value: string;
    name: string;
  }>;
  numComments: number;
  isSubscribed: boolean;
  hasSeen: boolean;
  annotations: string[];
}

export interface SentryEvent {
  eventID: string;
  id: string;
  title: string;
  message: string;
  dateCreated: string;
  context: Record<string, unknown>;
  tags: Array<{
    key: string;
    value: string;
  }>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
    ip_address?: string;
  };
}

export interface SentryEventDetails extends SentryEvent {
  entries: Array<{
    type: string;
    data: unknown;
  }>;
  sdk?: {
    name: string;
    version: string;
  };
}

// LLM-Friendly Output Types

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  platform: string;
  status: string;
  createdAt: string;
}

export interface ProjectListOutput {
  projects: ProjectSummary[];
  total: number;
  message: string;
}

export interface IssueSummary {
  id: string;
  shortId: string;
  title: string;
  level: string;
  status: string;
  eventCount: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  project: string;
  link: string;
}

export interface IssueListOutput {
  issues: IssueSummary[];
  showing: number;
  hasMore: boolean;
  cursor?: string;
  message: string;
}

export interface IssueDetailOutput {
  id: string;
  shortId: string;
  title: string;
  level: string;
  status: string;
  type: string;
  culprit: string;
  eventCount: number;
  userCount: number;
  firstSeen: string;
  lastSeen: string;
  project: string;
  link: string;
  metadata: {
    errorType?: string;
    errorValue?: string;
    filename?: string;
    function?: string;
  };
  topTags: Array<{ key: string; value: string }>;
  message: string;
}

export interface EventSummary {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  user?: string;
  tags: Record<string, string>;
}

export interface EventListOutput {
  events: EventSummary[];
  showing: number;
  hasMore: boolean;
  cursor?: string;
  message: string;
}

export interface UpdateStatusOutput {
  issueId: string;
  previousStatus: string;
  newStatus: string;
  success: boolean;
  message: string;
}

export interface ProjectStatsOutput {
  project: string;
  period: string;
  totalEvents: number;
  totalErrors: number;
  errorRate: string;
  topIssues: Array<{
    id: string;
    title: string;
    count: number;
  }>;
  message: string;
}

export interface ErrorOutput {
  error: string;
  suggestion: string;
  details?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  link?: string;
}
