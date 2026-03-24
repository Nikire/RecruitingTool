import { Candidate } from "./candidate";
import { Stage } from "./stage.types";

export interface HiringProcess {
  uid: string;
  title: string;
  status: HiringProcessStatus;
  stages: Array<Stage>;
  candidate?: Candidate;
  company?: {
    uid: string;
    name: string;
  };
  jobPosition?: {
    uid: string;
    title: string;
    createdBy?: {
      uid: string;
      name: string;
      email: string;
    };
  };
}

export interface CreateHiringProcessDto {
  candidateUid: string;
  jobPositionUid: string;
}

export interface HiringProcessGroupedFilterDto {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface HiringProcessGroup {
  jobPositionUid: string | null;
  jobPositionTitle: string;
  processes: HiringProcess[];
}

export interface PaginatedHiringProcessGroupsResponse {
  data: HiringProcessGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const HIRING_PROCESS_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  IN_PROGRESS: "IN_PROGRESS",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
} as const;

export type HiringProcessStatus =
  (typeof HIRING_PROCESS_STATUS)[keyof typeof HIRING_PROCESS_STATUS];
