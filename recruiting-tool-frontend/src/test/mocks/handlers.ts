import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:4000/api";

// Mock data
export const mockCandidates = [
  {
    uid: "candidate-1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    uid: "candidate-2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+0987654321",
    status: "active",
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

export const mockJobPositions = [
  {
    uid: "job-1",
    title: "Software Engineer",
    department: "Engineering",
    status: "open",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    uid: "job-2",
    title: "Product Manager",
    department: "Product",
    status: "open",
    createdAt: "2024-01-02T00:00:00.000Z",
  },
];

export const mockApplications = [
  {
    uid: "app-1",
    candidateName: "John Doe",
    jobTitle: "Software Engineer",
    status: "pending",
    appliedDate: "2024-01-01T00:00:00.000Z",
  },
];

export const mockDashboardStats = {
  totalCandidates: 150,
  activeCandidates: 120,
  totalJobPositions: 25,
  openJobPositions: 15,
  totalApplications: 300,
  pendingApplications: 45,
  totalHiringProcesses: 80,
  activeHiringProcesses: 30,
};

// MSW Handlers
export const handlers = [
  // Candidates endpoints
  http.get(`${API_URL}/candidates`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;

    return HttpResponse.json({
      items: mockCandidates,
      total: mockCandidates.length,
      page,
      limit,
    });
  }),

  http.get(`${API_URL}/candidates/:uid`, ({ params }) => {
    const candidate = mockCandidates.find((c) => c.uid === params.uid);
    if (!candidate) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(candidate);
  }),

  http.post(`${API_URL}/candidates`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newCandidate = {
      uid: `candidate-${Date.now()}`,
      ...body,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(newCandidate, { status: 201 });
  }),

  http.delete(`${API_URL}/candidates/:uid`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Job Positions endpoints
  http.get(`${API_URL}/job-positions`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;

    return HttpResponse.json({
      items: mockJobPositions,
      total: mockJobPositions.length,
      page,
      limit,
    });
  }),

  http.get(`${API_URL}/job-positions/:uid`, ({ params }) => {
    const jobPosition = mockJobPositions.find((j) => j.uid === params.uid);
    if (!jobPosition) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(jobPosition);
  }),

  http.post(`${API_URL}/job-positions`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newJobPosition = {
      uid: `job-${Date.now()}`,
      ...body,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json(newJobPosition, { status: 201 });
  }),

  // Applications endpoints
  http.get(`${API_URL}/applications`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;

    return HttpResponse.json({
      items: mockApplications,
      total: mockApplications.length,
      page,
      limit,
    });
  }),

  // Dashboard stats
  http.get(`${API_URL}/dashboard/stats`, () => {
    return HttpResponse.json(mockDashboardStats);
  }),

  // Admin dashboard stats
  http.get(`${API_URL}/admin/dashboard/stats`, () => {
    return HttpResponse.json({
      ...mockDashboardStats,
      totalUsers: 50,
      activeUsers: 40,
      totalCompanies: 10,
    });
  }),

  // Auth endpoint (for user checks)
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      uid: "user-1",
      email: "test@example.com",
      role: "HR",
      name: "Test User",
    });
  }),
];

// Error handlers for testing error states
export const errorHandlers = [
  http.get(`${API_URL}/candidates`, () => {
    return new HttpResponse(null, { status: 500 });
  }),

  http.get(`${API_URL}/job-positions`, () => {
    return new HttpResponse(null, { status: 500 });
  }),

  http.get(`${API_URL}/dashboard/stats`, () => {
    return new HttpResponse(null, { status: 500 });
  }),
];

// Empty data handlers for testing empty states
export const emptyHandlers = [
  http.get(`${API_URL}/candidates`, () => {
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  }),

  http.get(`${API_URL}/job-positions`, () => {
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
    });
  }),
];
