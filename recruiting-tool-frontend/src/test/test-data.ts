/**
 * Test data factories for creating mock entities
 */

import { Application, ApplicationStatus } from "../types/application.types";
import { PaginationMeta } from "../types/pagination.types";

/**
 * Create a mock Application entity
 */
export const createMockApplication = (
  overrides?: Partial<Application>,
): Application => ({
  uid: "app-test-uid-123",
  applicantName: "John Doe",
  applicantEmail: "john.doe@example.com",
  applicantPhone: "+1234567890",
  jobPositionUid: "job-position-uid-123",
  jobPositionTitle: "Senior Frontend Developer",
  companyName: "Tech Corp",
  status: ApplicationStatus.PENDING,
  appliedAt: new Date("2025-01-15T10:30:00Z"),
  createdAt: new Date("2025-01-15T10:30:00Z"),
  updatedAt: new Date("2025-01-15T10:30:00Z"),
  coverLetter: "I am interested in this position...",
  ...overrides,
});

/**
 * Create multiple mock applications
 */
export const createMockApplications = (count: number): Application[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockApplication({
      uid: `app-uid-${i + 1}`,
      applicantName: `Applicant ${i + 1}`,
      applicantEmail: `applicant${i + 1}@example.com`,
      status: [
        ApplicationStatus.PENDING,
        ApplicationStatus.REVIEWED,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
      ][i % 4],
    }),
  );
};

/**
 * Create mock pagination meta
 */
export const createMockPaginationMeta = (
  overrides?: Partial<PaginationMeta>,
): PaginationMeta => ({
  page: 1,
  pageSize: 10,
  total: 100,
  totalPages: 10,
  hasNextPage: false,
  hasPreviousPage: false,
  ...overrides,
});

/**
 * Mock filter options for FilterPanel
 */
export const mockStatusOptions = [
  { value: "PENDING", label: "Pending", count: 10 },
  { value: "REVIEWED", label: "Reviewed", count: 5 },
  { value: "ACCEPTED", label: "Accepted", count: 3 },
  { value: "REJECTED", label: "Rejected", count: 2 },
];

export const mockSkillsOptions = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "SQL",
];
