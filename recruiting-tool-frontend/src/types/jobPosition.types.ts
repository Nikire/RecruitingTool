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
