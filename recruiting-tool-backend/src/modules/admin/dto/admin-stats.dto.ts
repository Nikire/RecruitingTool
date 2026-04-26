import { ApiProperty } from '@nestjs/swagger';

export class UsersByRoleDto {
  @ApiProperty({ description: 'The role name', example: 'USER' })
  role: string;

  @ApiProperty({ description: 'Number of users with this role', example: 15 })
  count: number;
}

export class RecentLoginDto {
  @ApiProperty({ description: 'The UID of the user', example: '123e4567-e89b-12d3-a456-426614174000' })
  userUid: string;

  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  userName: string;

  @ApiProperty({ description: 'Login timestamp', example: '2024-01-15T10:30:00.000Z' })
  loginAt: string;
}

export class AdminStatsResponseDto {
  // User statistics
  @ApiProperty({ description: 'Total number of users', example: 50 })
  totalUsers: number;

  @ApiProperty({ description: 'Number of active users', example: 45 })
  activeUsers: number;

  @ApiProperty({ description: 'Number of inactive users', example: 5 })
  inactiveUsers: number;

  @ApiProperty({ description: 'Users grouped by role', type: [UsersByRoleDto] })
  usersByRole: UsersByRoleDto[];

  @ApiProperty({ description: 'New users registered this month', example: 8 })
  newUsersThisMonth: number;

  // Company statistics
  @ApiProperty({ description: 'Total number of companies', example: 10 })
  totalCompanies: number;

  @ApiProperty({ description: 'Number of active companies (with active users)', example: 8 })
  activeCompanies: number;

  // Candidate statistics
  @ApiProperty({ description: 'Total number of candidates', example: 200 })
  totalCandidates: number;

  @ApiProperty({ description: 'Candidates added this month', example: 25 })
  candidatesThisMonth: number;

  // Job statistics
  @ApiProperty({ description: 'Total number of job positions', example: 30 })
  totalJobPositions: number;

  @ApiProperty({ description: 'Number of open job positions', example: 15 })
  openJobPositions: number;

  @ApiProperty({ description: 'Number of closed job positions', example: 10 })
  closedJobPositions: number;

  // Hiring process statistics
  @ApiProperty({ description: 'Total number of hiring processes', example: 150 })
  totalHiringProcesses: number;

  @ApiProperty({ description: 'Number of active hiring processes', example: 80 })
  activeHiringProcesses: number;

  // Recent activity
  @ApiProperty({ description: 'Recent user logins', type: [RecentLoginDto] })
  recentLogins: RecentLoginDto[];
}

export class UserStatsResponseDto {
  @ApiProperty({ description: 'Total number of users', example: 50 })
  totalUsers: number;

  @ApiProperty({ description: 'Number of active users', example: 45 })
  activeUsers: number;

  @ApiProperty({ description: 'Number of inactive users', example: 5 })
  inactiveUsers: number;

  @ApiProperty({ description: 'Users grouped by role', type: [UsersByRoleDto] })
  usersByRole: UsersByRoleDto[];

  @ApiProperty({ description: 'New users registered this month', example: 8 })
  newUsersThisMonth: number;
}

export class CompanyStatsResponseDto {
  @ApiProperty({ description: 'Total number of companies', example: 10 })
  totalCompanies: number;

  @ApiProperty({ description: 'Number of active companies (with active users)', example: 8 })
  activeCompanies: number;
}

export class RecentActivityResponseDto {
  @ApiProperty({ description: 'Recent user logins', type: [RecentLoginDto] })
  recentLogins: RecentLoginDto[];
}

export class PlanDistributionItemDto {
  @ApiProperty({ description: 'Subscription plan name', example: 'PROFESSIONAL' })
  plan: string;

  @ApiProperty({ description: 'Number of companies on this plan', example: 12 })
  count: number;
}

export class StatusDistributionItemDto {
  @ApiProperty({ description: 'Subscription status name', example: 'ACTIVE' })
  status: string;

  @ApiProperty({ description: 'Number of companies with this status', example: 20 })
  count: number;
}

export class MonthlySignupItemDto {
  @ApiProperty({ description: 'Month in YYYY-MM format', example: '2025-01' })
  month: string;

  @ApiProperty({ description: 'Number of new company signups in this month', example: 5 })
  count: number;
}

export class RevenueStatsResponseDto {
  @ApiProperty({ description: 'Estimated Monthly Recurring Revenue in USD', example: 2940 })
  mrr: number;

  @ApiProperty({ description: 'MRR percentage change vs last month', example: 12.5 })
  mrrGrowth: number;

  @ApiProperty({ description: 'Number of companies with ACTIVE subscription', example: 20 })
  activeCompanies: number;

  @ApiProperty({ description: 'Number of companies currently in TRIALING status', example: 8 })
  trialingCompanies: number;

  @ApiProperty({ description: 'Number of companies with PAST_DUE status', example: 2 })
  pastDueCompanies: number;

  @ApiProperty({ description: 'Number of companies whose subscription was CANCELED in the current calendar month', example: 1 })
  canceledThisMonth: number;

  @ApiProperty({ description: 'Total number of companies with any subscription', example: 35 })
  totalCompanies: number;

  @ApiProperty({ description: 'Plan distribution for pie chart', type: [PlanDistributionItemDto] })
  planDistribution: PlanDistributionItemDto[];

  @ApiProperty({ description: 'Status distribution for bar chart', type: [StatusDistributionItemDto] })
  statusDistribution: StatusDistributionItemDto[];

  @ApiProperty({ description: 'Monthly new company signups for the last 6 months', type: [MonthlySignupItemDto] })
  monthlySignups: MonthlySignupItemDto[];
}
