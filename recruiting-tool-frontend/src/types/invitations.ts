export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
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

export interface CompanyInvitation {
  uid: string;
  companyUid: string;
  companyName: string;
  email: string;
  role: RolesType;
  invitedByUid: string;
  invitedByName: string;
  token: string;
  expiresAt: string;
  status: InvitationStatus;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvitationDto {
  email: string;
  role: RolesType;
}
