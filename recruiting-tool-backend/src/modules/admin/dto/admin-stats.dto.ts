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
