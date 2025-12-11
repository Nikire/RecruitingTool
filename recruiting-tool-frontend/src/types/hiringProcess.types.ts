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

export const HIRING_PROCESS_STATUS = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  IN_PROGRESS: "IN_PROGRESS",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
} as const;

export type HiringProcessStatus =
  (typeof HIRING_PROCESS_STATUS)[keyof typeof HIRING_PROCESS_STATUS];
