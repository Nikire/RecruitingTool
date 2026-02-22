export interface Company {
  uid: string;
  name: string;
  description?: string;
  logoUrl?: string;
  userCount?: number;
  jobPositionCount?: number;
}

export interface CreateCompanyDto {
  name: string;
  description?: string;
}

export interface UpdateCompanyDto {
  name?: string;
  description?: string;
}

export interface CompanyUser {
  uid: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
  position?: string;
  department?: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface TransferOwnershipDto {
  newOwnerUid: string;
}

export interface ForceJoinDto {
  userUid: string;
  role?: string;
}

export interface TransferOwnershipResponse {
  message: string;
  previousOwner: CompanyUser;
  newOwner: CompanyUser;
}

export interface ForceJoinResponse {
  message: string;
  user: CompanyUser;
}
