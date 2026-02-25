export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  roles: UserRoles[];
  companyUid?: string;
  company?: {
    uid: string;
    name: string;
    logoUrl?: string;
  };
  profilePicture?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  bio?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  location?: string;
  timezone?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  onboardingCompleted?: boolean;
  emailVerified?: boolean;
}

export enum UserRoles {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  HR = "HR",
  HR_MANAGER = "HR_MANAGER",
  RECRUITER = "RECRUITER",
  USER = "USER",
  COMPANY_OWNER = "COMPANY_OWNER",
  COMPANY_ADMIN = "COMPANY_ADMIN",
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  companyUid?: string;
  roles?: UserRoles[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  companyUid?: string;
  roles?: UserRoles[];
  profilePicture?: string;
  phoneNumber?: string;
  position?: string;
  department?: string;
  bio?: string;
  linkedinUrl?: string;
  timezone?: string;
}

// Company Roles Management
export interface CompanyMember {
  uid: string;
  name: string;
  email: string;
  roles: UserRoles[];
  isActive: boolean;
  position?: string;
  department?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AssignRoleDto {
  userUid: string;
  roles: UserRoles[];
}

export interface UpdateRoleDto {
  roles: UserRoles[];
}

// Account Linking
export interface LinkedAccount {
  provider: string;
  isLinked: boolean;
  email?: string;
}

export interface LinkedAccountsResponse {
  linkedAccounts: LinkedAccount[];
  hasLocalPassword: boolean;
}
