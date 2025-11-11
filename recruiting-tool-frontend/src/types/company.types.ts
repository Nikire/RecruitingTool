export interface Company {
  uid: string;
  name: string;
  description?: string;
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
