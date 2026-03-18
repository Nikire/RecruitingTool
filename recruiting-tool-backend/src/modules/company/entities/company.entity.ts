import { Company, Prisma } from '@prisma/client';

export const includeCompany = {
  users: true,
  jobPositions: true,
  _count: {
    select: {
      users: true,
      jobPositions: true,
    },
  },
};

type CompanyWithRelations = Prisma.CompanyGetPayload<{
  include: typeof includeCompany;
}>;

export function CompanyMapper(company: Company | CompanyWithRelations) {
  const result: any = {
    uid: company.uid,
    name: company.name,
    description: company.description,
    logoUrl: company.logoUrl,
  };

  if ((company as any)._count) {
    result.userCount = (company as any)._count.users;
    result.jobPositionCount = (company as any)._count.jobPositions;
  }

  return result;
}

export function CompanyProfileMapper(company: Company) {
  return {
    uid: company.uid,
    name: company.name,
    description: company.description ?? undefined,
    logoUrl: company.logoUrl ?? undefined,
    website: company.website ?? undefined,
    industry: company.industry ?? undefined,
    companySize: company.companySize ?? undefined,
    foundedYear: company.foundedYear ?? undefined,
    location: company.location ?? undefined,
    linkedinUrl: company.linkedinUrl ?? undefined,
    twitterUrl: company.twitterUrl ?? undefined,
    instagramUrl: company.instagramUrl ?? undefined,
    careersEnabled: company.careersEnabled,
    careersHeadline: company.careersHeadline ?? undefined,
    timezone: company.timezone ?? undefined,
  };
}

export function PublicCompanyMapper(company: Company) {
  return {
    uid: company.uid,
    name: company.name,
    description: company.description,
    logoUrl: company.logoUrl,
  };
}
