import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';

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

// ─── Quota Overview DTOs ───────────────────────────────────────────────────────

export class QuotaResourceUsageDto {
  @ApiProperty({ description: 'Used count', example: 2 })
  used: number;

  @ApiProperty({ description: 'Limit count (-1 means unlimited)', example: 3 })
  limit: number;

  @ApiProperty({ description: 'Usage percentage (0-100+)', example: 66.67 })
  percentage: number;
}

export class CompanyQuotaItemDto {
  @ApiProperty({ description: 'Company UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corp' })
  name: string;

  @ApiProperty({ description: 'Subscription plan', example: 'FREE' })
  plan: string;

  @ApiProperty({ description: 'Subscription status', example: 'ACTIVE' })
  subscriptionStatus: string;

  @ApiProperty({ description: 'Job positions usage', type: QuotaResourceUsageDto })
  jobPositions: QuotaResourceUsageDto;

  @ApiProperty({ description: 'Users usage', type: QuotaResourceUsageDto })
  users: QuotaResourceUsageDto;

  @ApiProperty({ description: 'AI credits usage', type: QuotaResourceUsageDto })
  aiCredits: QuotaResourceUsageDto;

  @ApiProperty({ description: 'Overall health status', enum: ['OK', 'WARNING', 'CRITICAL', 'EXCEEDED'] })
  healthStatus: 'OK' | 'WARNING' | 'CRITICAL' | 'EXCEEDED';
}

export class QuotaOverviewSummaryDto {
  @ApiProperty({ description: 'Total companies', example: 10 })
  totalCompanies: number;

  @ApiProperty({ description: 'Companies with OK status', example: 5 })
  okCount: number;

  @ApiProperty({ description: 'Companies with WARNING status', example: 3 })
  warningCount: number;

  @ApiProperty({ description: 'Companies with CRITICAL status', example: 1 })
  criticalCount: number;

  @ApiProperty({ description: 'Companies with EXCEEDED status', example: 1 })
  exceededCount: number;
}

export class QuotaOverviewResponseDto {
  @ApiProperty({ description: 'List of companies with quota usage', type: [CompanyQuotaItemDto] })
  companies: CompanyQuotaItemDto[];

  @ApiProperty({ description: 'Total matching companies', example: 10 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Summary counters', type: QuotaOverviewSummaryDto })
  summary: QuotaOverviewSummaryDto;
}

// ─── Company Health Monitor DTOs ──────────────────────────────────────────────

export type RiskTier = 'HEALTHY' | 'AT_RISK' | 'CHURNING' | 'CRITICAL';

export class CompanyHealthItemDto {
  @ApiProperty({ description: 'Company UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corp' })
  name: string;

  @ApiProperty({ description: 'Subscription plan', example: 'PROFESSIONAL' })
  plan: string;

  @ApiProperty({ description: 'Subscription status', example: 'ACTIVE' })
  subscriptionStatus: string;

  @ApiProperty({ description: 'Churn-risk health score 0-100', example: 72 })
  healthScore: number;

  @ApiProperty({ description: 'Risk tier derived from health score', enum: ['HEALTHY', 'AT_RISK', 'CHURNING', 'CRITICAL'] })
  riskTier: RiskTier;

  @ApiProperty({ description: 'Days since most recent user login, null if never logged in', example: 5, nullable: true })
  lastLoginDaysAgo: number | null;

  @ApiProperty({ description: 'Number of open job positions', example: 3 })
  activeJobPositions: number;

  @ApiProperty({ description: 'Number of applications created this calendar month', example: 12 })
  applicationsThisMonth: number;

  @ApiProperty({ description: 'Number of hiring processes updated this calendar month', example: 4 })
  hiringActivitiesThisMonth: number;
}

export class CompanyHealthSummaryDto {
  @ApiProperty({ description: 'Number of HEALTHY companies (score 80-100)', example: 5 })
  healthyCount: number;

  @ApiProperty({ description: 'Number of AT_RISK companies (score 50-79)', example: 3 })
  atRiskCount: number;

  @ApiProperty({ description: 'Number of CHURNING companies (score 20-49)', example: 2 })
  churningCount: number;

  @ApiProperty({ description: 'Number of CRITICAL companies (score 0-19)', example: 1 })
  criticalCount: number;
}

export class CompanyHealthResponseDto {
  @ApiProperty({ description: 'List of companies with health scores', type: [CompanyHealthItemDto] })
  companies: CompanyHealthItemDto[];

  @ApiProperty({ description: 'Total matching companies', example: 10 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Risk tier summary counters', type: CompanyHealthSummaryDto })
  summary: CompanyHealthSummaryDto;
}

// ─── Trial & Conversion Tracker DTOs ─────────────────────────────────────────

export type ConversionReadiness = 'HOT' | 'WARM' | 'COLD';

export class TrialCompanyItemDto {
  @ApiProperty({ description: 'Company UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'Company name', example: 'Acme Corp' })
  name: string;

  @ApiProperty({ description: 'Subscription plan', example: 'FREE' })
  plan: string;

  @ApiProperty({ description: 'Subscription status', example: 'TRIALING' })
  subscriptionStatus: string;

  @ApiProperty({ description: 'Days since company was created', example: 14 })
  daysOnPlatform: number;

  @ApiProperty({ description: 'Activation score 0-100 based on 5 signals × 20pts each', example: 60 })
  activationScore: number;

  @ApiProperty({ description: 'Conversion readiness tier derived from activation score', enum: ['HOT', 'WARM', 'COLD'] })
  conversionReadiness: ConversionReadiness;

  @ApiProperty({ description: 'Number of job positions created', example: 2 })
  jobPositionsCreated: number;

  @ApiProperty({ description: 'Number of candidates added to the company', example: 7 })
  candidatesAdded: number;

  @ApiProperty({ description: 'Number of non-deleted applications received', example: 4 })
  applicationsReceived: number;

  @ApiProperty({ description: 'Number of hiring processes started', example: 1 })
  hiringProcessesStarted: number;

  @ApiProperty({ description: 'Number of active team members (users)', example: 2 })
  teamMembersInvited: number;

  @ApiProperty({ description: 'Whether a ProspectCompany record is linked to this company', example: false })
  hasOutreachRecord: boolean;

  @ApiProperty({ description: 'UID of the linked ProspectCompany record, null if none', example: null, nullable: true })
  prospectCompanyUid: string | null;
}

export class TrialOverviewSummaryDto {
  @ApiProperty({ description: 'Number of HOT companies (score ≥70)', example: 3 })
  hotCount: number;

  @ApiProperty({ description: 'Number of WARM companies (score 40-69)', example: 5 })
  warmCount: number;

  @ApiProperty({ description: 'Number of COLD companies (score <40)', example: 7 })
  coldCount: number;
}

export class TrialOverviewResponseDto {
  @ApiProperty({ description: 'List of FREE/TRIALING companies with activation metrics', type: [TrialCompanyItemDto] })
  companies: TrialCompanyItemDto[];

  @ApiProperty({ description: 'Total matching companies', example: 15 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Summary counters by readiness tier', type: TrialOverviewSummaryDto })
  summary: TrialOverviewSummaryDto;
}

// ─── Subscription Lifecycle Manager DTOs ─────────────────────────────────────

export class ChangePlanDto {
  @ApiProperty({ description: 'New subscription plan', enum: ['FREE', 'PROFESSIONAL', 'ENTERPRISE'], example: 'PROFESSIONAL' })
  @IsEnum(['FREE', 'PROFESSIONAL', 'ENTERPRISE'])
  plan: string;

  @ApiProperty({ description: 'Optional note explaining the plan change', required: false, example: 'Customer requested upgrade' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ChangeStatusDto {
  @ApiProperty({ description: 'New subscription status', enum: ['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'EXPIRED'], example: 'ACTIVE' })
  @IsEnum(['TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'EXPIRED'])
  status: string;

  @ApiProperty({ description: 'Optional note explaining the status change', required: false, example: 'Manual activation after payment confirmed' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class ExtendTrialDto {
  @ApiProperty({ description: 'Number of days to extend the trial', example: 14 })
  @IsInt()
  @Min(1)
  days: number;

  @ApiProperty({ description: 'Optional note explaining the trial extension', required: false, example: 'Extended for onboarding assistance' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class SubscriptionAuditLogItemDto {
  @ApiProperty({ description: 'Audit log entry UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'Action performed', example: 'PLAN_CHANGE' })
  action: string;

  @ApiProperty({ description: 'Timestamp of the action', example: '2025-01-15T10:30:00.000Z' })
  timestamp: Date;

  @ApiProperty({ description: 'Metadata about the change (previousPlan, newPlan, note, etc.)', nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ description: 'Name of the admin who performed the action', example: 'John Admin' })
  adminName: string;
}

export class UpdatedSubscriptionDto {
  @ApiProperty({ description: 'Subscription UID', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'Current plan', example: 'PROFESSIONAL' })
  plan: string;

  @ApiProperty({ description: 'Current status', example: 'ACTIVE' })
  status: string;

  @ApiProperty({ description: 'Trial end date', nullable: true })
  trialEnd: Date | null;

  @ApiProperty({ description: 'Current period start', nullable: true })
  currentPeriodStart: Date | null;

  @ApiProperty({ description: 'Current period end', nullable: true })
  currentPeriodEnd: Date | null;
}

// ─── Demo Booking Manager DTOs ───────────────────────────────────────────────

export const DEMO_OUTCOME_VALUES = ['PENDING', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED', 'CANCELED'] as const;
export type DemoOutcomeValue = (typeof DEMO_OUTCOME_VALUES)[number];

export class DemoBookingAdminItemDto {
  @ApiProperty({ description: 'Demo booking token UID' })
  uid: string;

  @ApiProperty({ description: 'Prospect email address' })
  prospectEmail: string;

  @ApiProperty({ description: 'Prospect name', nullable: true })
  prospectName: string | null;

  @ApiProperty({ description: 'Prospect company name', nullable: true })
  prospectCompany: string | null;

  @ApiProperty({ description: 'Scheduled date/time of the demo', nullable: true })
  scheduledAt: Date | null;

  @ApiProperty({ description: 'Demo outcome', enum: DEMO_OUTCOME_VALUES })
  outcome: string;

  @ApiProperty({ description: 'Notes about the outcome', nullable: true })
  outcomeNotes: string | null;

  @ApiProperty({ description: 'Linked ProspectCompany UID', nullable: true })
  linkedProspectUid: string | null;

  @ApiProperty({ description: 'Token creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Date the booking was used (slot selected)', nullable: true })
  usedAt: Date | null;
}

export class DemoBookingOutcomeSummaryDto {
  @ApiProperty({ description: 'Number of pending demos' })
  pending: number;

  @ApiProperty({ description: 'Number of completed demos' })
  completed: number;

  @ApiProperty({ description: 'Number of no-show demos' })
  noShow: number;

  @ApiProperty({ description: 'Number of rescheduled demos' })
  rescheduled: number;

  @ApiProperty({ description: 'Number of canceled demos' })
  canceled: number;
}

export class DemoBookingListResponseDto {
  @ApiProperty({ type: [DemoBookingAdminItemDto] })
  demos: DemoBookingAdminItemDto[];

  @ApiProperty({ description: 'Total number of records matching filter' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ type: DemoBookingOutcomeSummaryDto })
  summary: DemoBookingOutcomeSummaryDto;
}

export class SetDemoOutcomeDto {
  @ApiProperty({ description: 'New outcome for the demo', enum: DEMO_OUTCOME_VALUES })
  @IsEnum(DEMO_OUTCOME_VALUES)
  @IsNotEmpty()
  outcome: DemoOutcomeValue;

  @ApiProperty({ description: 'Optional notes about the outcome', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LinkDemoProspectDto {
  @ApiProperty({ description: 'UID of the ProspectCompany to link' })
  @IsString()
  @IsNotEmpty()
  prospectUid: string;
}

// ─── Email Deliverability DTOs ────────────────────────────────────────────────

export class RecentBounceDto {
  @ApiProperty({ description: 'UID of the EmailLog record' })
  uid: string;

  @ApiProperty({ description: 'Recipient email address' })
  recipientEmail: string;

  @ApiProperty({ description: 'Email subject' })
  subject: string;

  @ApiProperty({ description: 'Timestamp when the email bounced', nullable: true })
  bouncedAt: string | null;

  @ApiProperty({ description: 'Type of bounce: hard, soft, or complaint', nullable: true })
  bounceType: string | null;

  @ApiProperty({ description: 'Email type/category' })
  emailType: string;
}

export class EmailDeliverabilityStatsDto {
  @ApiProperty({ description: 'Total emails sent' })
  totalSent: number;

  @ApiProperty({ description: 'Emails with DELIVERED status' })
  delivered: number;

  @ApiProperty({ description: 'Emails with OPENED status' })
  opened: number;

  @ApiProperty({ description: 'Emails with BOUNCED status' })
  bounced: number;

  @ApiProperty({ description: 'Emails with SPAM/complaint status' })
  spam: number;

  @ApiProperty({ description: 'Emails with FAILED status' })
  failed: number;

  @ApiProperty({ description: 'Delivery rate as a percentage (DELIVERED + OPENED / total)' })
  deliveryRate: number;

  @ApiProperty({ description: 'Open rate as a percentage (OPENED / DELIVERED)' })
  openRate: number;

  @ApiProperty({ description: 'Bounce rate as a percentage (BOUNCED / total)' })
  bounceRate: number;

  @ApiProperty({ description: 'Last 10 bounced email records', type: [RecentBounceDto] })
  recentBounces: RecentBounceDto[];
}

export class EmailDeliverabilityPerTypeItemDto {
  @ApiProperty({ description: 'Email type/category' })
  emailType: string;

  @ApiProperty({ description: 'Total emails of this type' })
  total: number;

  @ApiProperty({ description: 'Delivered count' })
  delivered: number;

  @ApiProperty({ description: 'Opened count' })
  opened: number;

  @ApiProperty({ description: 'Bounced count' })
  bounced: number;

  @ApiProperty({ description: 'Bounce rate as a percentage' })
  bounceRate: number;
}

export class EmailDeliverabilityPerTypeDto {
  @ApiProperty({ description: 'Per email type breakdown sorted by bounceRate descending', type: [EmailDeliverabilityPerTypeItemDto] })
  perType: EmailDeliverabilityPerTypeItemDto[];
}
