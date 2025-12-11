export enum ConnectionRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  DENIED = "DENIED",
  CANCELLED = "CANCELLED",
}

export enum RolesType {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  HR = "HR",
  HR_MANAGER = "HR_MANAGER",
  RECRUITER = "RECRUITER",
  COMPANY_OWNER = "COMPANY_OWNER",
  COMPANY_ADMIN = "COMPANY_ADMIN",
}

export interface ConnectionRequest {
  uid: string;
  userUid: string;
  userName: string;
  userEmail: string;
  companyUid: string;
  companyName: string;
  requestedRole: RolesType;
  status: ConnectionRequestStatus;
  message?: string;
  reviewedByUid?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConnectionRequestDto {
  companyUid: string;
  requestedRole?: RolesType;
  message?: string;
}

export interface ApproveConnectionRequestDto {
  reviewNote?: string;
  assignedRole?: RolesType;
}

export interface DenyConnectionRequestDto {
  reviewNote: string;
}

export interface GetConnectionRequestsQuery {
  status?: ConnectionRequestStatus;
  limit?: number;
  skip?: number;
}
