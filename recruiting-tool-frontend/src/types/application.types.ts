export enum ApplicationStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  REJECTED = "REJECTED",
  ACCEPTED = "ACCEPTED",
  ARCHIVED = "ARCHIVED",
}

export interface Application {
  uid: string;
  jobPositionUid: string;
  jobPositionTitle: string;
  companyName?: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeFileUid?: string;
  resumeFileName?: string;
  coverLetter?: string;
  customAnswers?: Record<string, unknown>;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedByUid?: string;
  reviewedByName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationDto {
  jobPositionUid: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeFileUid?: string;
  coverLetter?: string;
  applicationSource?: string;
  customAnswers?: Record<string, unknown>;
}

export interface UpdateApplicationDto {
  status?: ApplicationStatus;
  notes?: string;
}

export interface ApplicationFilterDto {
  jobPositionUid?: string;
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

export interface ApplicationGroupedFilterDto {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

export interface ApplicationGroup {
  jobPositionUid: string | null;
  jobPositionTitle: string;
  applications: Application[];
}

export interface PaginatedApplicationGroupsResponse {
  data: ApplicationGroup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PublicJobPosition {
  uid: string;
  title: string;
  description?: string;
  companyName: string;
}
