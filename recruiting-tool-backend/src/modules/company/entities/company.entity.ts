import { Company, Prisma } from '@prisma/client';

export const includeCompany = {
  users: true,
  jobPositions: true,
  _count: {
    select: {
      users: true,
      jobPositions: true,
    }
  }
};

type CompanyWithRelations = Prisma.CompanyGetPayload<{
  include: typeof includeCompany;
}>;

export function CompanyMapper(company: Company | CompanyWithRelations) {
  const result: any = {
    uid: company.uid,
    name: company.name,
    description: company.description,
  };

  if ((company as any)._count) {
    result.userCount = (company as any)._count.users;
    result.jobPositionCount = (company as any)._count.jobPositions;
  }

  return result;
}

export function PublicCompanyMapper(company: Company) {
  return {
    uid: company.uid,
    name: company.name,
    description: company.description,
  };
}
