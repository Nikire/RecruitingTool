import { HiringProcess } from "./hiringProcess.types";
import { Stage } from "./stage.types";
import { CustomQuestion } from "./customQuestions";

export type SalaryPeriod = "HOURLY" | "MONTHLY" | "YEARLY";

export interface JobPosition {
  uid: string;
  title: string;
  status: JobPositionStatus;
  description?: string;
  companyUid?: string;
  companyName?: string;
  /**
   * The end client this role is being filled for. Null for direct-employer roles and for
   * postings created before clients existed — never assume it is present.
   */
  clientUid?: string | null;
  clientName?: string | null;
  companyLogoUrl?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  customQuestions?: Array<CustomQuestion>;
  hiringProcesses?: Array<HiringProcess>;
  stages: Array<Stage>;
  createdBy?: {
    uid: string;
    name: string;
    email: string;
  };
  createdAt?: Date | string;
  // Job details
  jobCategory?: string;
  jobType?: JobType;
  workLocation?: WorkLocation;
  experienceLevel?: ExperienceLevel;
  educationLevel?: string;
  skills?: string[];
  // Salary fields
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;
  showSalary?: boolean;
  // Additional details
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  applicationDeadline?: Date | string;
  isUrgent?: boolean;
  isFeatured?: boolean;
  isHighlighted?: boolean;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
  viewCount?: number;
  applicationCount?: number;
  candidateSource?: string;
  // Platform moderation (anti-spam gate) - only present on authenticated,
  // company-owned views. Never exposed on the public careers board.
  moderationStatus?: JobModerationStatus;
  moderationReason?: string | null;
  moderatedAt?: Date | string | null;
}

export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "FREELANCE"
  | "INTERNSHIP"
  | "TEMPORARY";
export type WorkLocation = "REMOTE" | "HYBRID" | "ON_SITE";
export type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "LEAD" | "EXECUTIVE";

export interface PublicJobPosition {
  uid: string;
  title: string;
  description?: string;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  companyName?: string;
  companyDescription?: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  companyIndustry?: string;
  customQuestions?: Array<CustomQuestion>;
  stages?: Array<{
    uid: string;
    title: string;
    description?: string;
    type: string;
    estimatedTime?: number;
    position: number;
    status?: string;
  }>;
  jobCategory?: string;
  jobType?: JobType;
  workLocation?: WorkLocation;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;
  showSalary?: boolean;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  educationLevel?: string;
  applicationDeadline?: Date | string;
  isUrgent?: boolean;
  isFeatured?: boolean;
  isHighlighted?: boolean;
  city?: string;
  state?: string;
  country?: string;
  tags?: string[];
  viewCount?: number;
  applicationCount?: number;
  createdAt: Date | string;
}

export const JOB_POSITION_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
} as const;

export type JobPositionStatus =
  (typeof JOB_POSITION_STATUS)[keyof typeof JOB_POSITION_STATUS];

/**
 * Platform-level moderation state of a job posting.
 * Deliberately separate from `JobPositionStatus` (OPEN/CLOSED/CANCELLED):
 * a posting can be APPROVED and CLOSED at the same time.
 */
export const JOB_MODERATION_STATUS = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type JobModerationStatus =
  (typeof JOB_MODERATION_STATUS)[keyof typeof JOB_MODERATION_STATUS];

/** A single posting as returned by the SUPER_ADMIN moderation queue. */
export interface ModerationJobPositionItem {
  uid: string;
  title: string;
  description: string | null;
  status: JobPositionStatus;
  moderationStatus: JobModerationStatus;
  moderationReason: string | null;
  moderatedAt: string | null;
  moderatedByUid: string | null;
  moderatedByName: string | null;
  companyUid: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyPlan: string;
  companyHasActiveSubscription: boolean;
  createdByUid: string;
  createdByName: string;
  createdByEmail: string | null;
  jobType: JobType | null;
  workLocation: WorkLocation | null;
  experienceLevel: ExperienceLevel | null;
  city: string | null;
  country: string | null;
  createdAt: string;
}

/** Counters rendered above the moderation queue. */
export interface JobModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

/** Query params accepted by GET /admin/job-moderation/pending. */
export interface JobModerationQueueParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "createdAt" | "title" | "moderatedAt";
  sortOrder?: "asc" | "desc";
  moderationStatus?: JobModerationStatus;
  companyUid?: string;
}

/**
 * The moderation endpoints return the backend's standard `PaginatedResponse`
 * shape (`{ data, pagination }`), not the `{ data, meta }` shape used by the
 * frontend's `PaginatedResponse<T>` helper - so it is typed explicitly here.
 */
export interface JobModerationQueueResponse {
  data: ModerationJobPositionItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
