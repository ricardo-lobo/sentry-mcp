import type {
  SentryProject,
  SentryIssue,
  SentryIssueDetails,
  SentryEvent,
} from "../src/types";

export const mockProjects: SentryProject[] = [
  {
    id: "1",
    slug: "frontend",
    name: "Frontend App",
    platform: "javascript-react",
    dateCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "2",
    slug: "backend-api",
    name: "Backend API",
    platform: "python",
    dateCreated: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
  {
    id: "3",
    slug: "mobile-app",
    name: "Mobile App",
    platform: "react-native",
    dateCreated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
  },
];

export const mockIssues: SentryIssue[] = [
  {
    id: "100",
    shortId: "FRONTEND-1",
    title: "TypeError: Cannot read property 'map' of undefined",
    culprit: "components/UserList.tsx",
    level: "error",
    status: "unresolved",
    platform: "javascript",
    project: { id: "1", slug: "frontend", name: "Frontend App" },
    type: "error",
    count: "47",
    userCount: 12,
    firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    permalink: "https://sentry.io/issues/100",
  },
  {
    id: "101",
    shortId: "FRONTEND-2",
    title: "Network Error: Failed to fetch",
    culprit: "api/client.ts",
    level: "error",
    status: "unresolved",
    platform: "javascript",
    project: { id: "1", slug: "frontend", name: "Frontend App" },
    type: "error",
    count: "23",
    userCount: 8,
    firstSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    permalink: "https://sentry.io/issues/101",
  },
  {
    id: "102",
    shortId: "BACKEND-1",
    title: "DatabaseError: Connection timeout",
    culprit: "db/connection.py",
    level: "error",
    status: "resolved",
    platform: "python",
    project: { id: "2", slug: "backend-api", name: "Backend API" },
    type: "error",
    count: "5",
    userCount: 0,
    firstSeen: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    permalink: "https://sentry.io/issues/102",
  },
];

export const mockIssueDetails: SentryIssueDetails = {
  ...mockIssues[0],
  metadata: {
    type: "TypeError",
    value: "Cannot read property 'map' of undefined",
    filename: "components/UserList.tsx",
    function: "UserList",
  },
  tags: [
    { key: "browser", value: "Chrome 120", name: "Browser" },
    { key: "os", value: "Windows 10", name: "OS" },
    { key: "environment", value: "production", name: "Environment" },
    { key: "release", value: "v1.2.3", name: "Release" },
    { key: "url", value: "/users", name: "URL" },
  ],
  numComments: 2,
  isSubscribed: true,
  hasSeen: true,
  annotations: [],
};

export const mockEvents: SentryEvent[] = [
  {
    eventID: "evt1",
    id: "evt1",
    title: "TypeError: Cannot read property 'map' of undefined",
    message: "Error in UserList component",
    dateCreated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    context: {},
    tags: [
      { key: "browser", value: "Chrome 120" },
      { key: "os", value: "Windows 10" },
    ],
    user: {
      id: "user123",
      email: "user@example.com",
      username: "testuser",
      ip_address: "192.168.1.1",
    },
  },
  {
    eventID: "evt2",
    id: "evt2",
    title: "TypeError: Cannot read property 'map' of undefined",
    message: "Error in UserList component",
    dateCreated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    context: {},
    tags: [
      { key: "browser", value: "Firefox 121" },
      { key: "os", value: "macOS" },
    ],
    user: {
      email: "another@example.com",
    },
  },
  {
    eventID: "evt3",
    id: "evt3",
    title: "TypeError: Cannot read property 'map' of undefined",
    message: "",
    dateCreated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    context: {},
    tags: [{ key: "browser", value: "Safari 17" }],
  },
];

export const mockStats: number[][] = [
  [Date.now() - 24 * 60 * 60 * 1000, 10],
  [Date.now() - 23 * 60 * 60 * 1000, 15],
  [Date.now() - 22 * 60 * 60 * 1000, 8],
  [Date.now() - 21 * 60 * 60 * 1000, 12],
  [Date.now() - 20 * 60 * 60 * 1000, 25],
  [Date.now() - 19 * 60 * 60 * 1000, 18],
  [Date.now() - 18 * 60 * 60 * 1000, 7],
  [Date.now() - 17 * 60 * 60 * 1000, 9],
  [Date.now() - 16 * 60 * 60 * 1000, 14],
  [Date.now() - 15 * 60 * 60 * 1000, 22],
  [Date.now() - 14 * 60 * 60 * 1000, 16],
  [Date.now() - 13 * 60 * 60 * 1000, 11],
  [Date.now() - 12 * 60 * 60 * 1000, 13],
  [Date.now() - 11 * 60 * 60 * 1000, 19],
  [Date.now() - 10 * 60 * 60 * 1000, 21],
  [Date.now() - 9 * 60 * 60 * 1000, 17],
  [Date.now() - 8 * 60 * 60 * 1000, 6],
  [Date.now() - 7 * 60 * 60 * 1000, 8],
  [Date.now() - 6 * 60 * 60 * 1000, 12],
  [Date.now() - 5 * 60 * 60 * 1000, 15],
  [Date.now() - 4 * 60 * 60 * 1000, 20],
  [Date.now() - 3 * 60 * 60 * 1000, 14],
  [Date.now() - 2 * 60 * 60 * 1000, 9],
  [Date.now() - 1 * 60 * 60 * 1000, 11],
];

// Mock fetch responses
export function createMockFetch() {
  const responses: Map<string, { data: unknown; status: number; link?: string }> =
    new Map();

  const mockFetch = async (
    url: string | URL | Request,
    _init?: RequestInit
  ): Promise<Response> => {
    const urlStr = url.toString();

    // Find matching response
    for (const [pattern, response] of responses) {
      if (urlStr.includes(pattern)) {
        const headers = new Headers();
        if (response.link) {
          headers.set("Link", response.link);
        }

        return new Response(JSON.stringify(response.data), {
          status: response.status,
          headers,
        });
      }
    }

    return new Response(JSON.stringify({ detail: "Not found" }), {
      status: 404,
    });
  };

  return {
    fetch: mockFetch as typeof fetch,
    setResponse: (
      pattern: string,
      data: unknown,
      status = 200,
      link?: string
    ) => {
      responses.set(pattern, { data, status, link });
    },
    clear: () => responses.clear(),
  };
}
