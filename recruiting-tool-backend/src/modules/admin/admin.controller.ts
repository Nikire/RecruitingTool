import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  AdminStatsResponseDto,
  UserStatsResponseDto,
  CompanyStatsResponseDto,
  RecentActivityResponseDto,
} from './dto/admin-stats.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@Auth(['ADMIN'])
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get full admin dashboard overview statistics - ADMIN role required',
    description: 'Returns comprehensive statistics including users, companies, candidates, job positions, hiring processes, and recent activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns full overview statistics',
    type: AdminStatsResponseDto,
  })
  getOverviewStats(): Promise<AdminStatsResponseDto> {
    return this.adminService.getOverviewStats();
  }

  @Get('stats/users')
  @ApiOperation({
    summary: 'Get user statistics - ADMIN role required',
    description: 'Returns detailed user statistics including total users, active/inactive counts, users by role, and new users this month',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user statistics',
    type: UserStatsResponseDto,
  })
  getUserStats(): Promise<UserStatsResponseDto> {
    return this.adminService.getUserStats();
  }

  @Get('stats/companies')
  @ApiOperation({
    summary: 'Get company statistics - ADMIN role required',
    description: 'Returns company statistics including total companies and active companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns company statistics',
    type: CompanyStatsResponseDto,
  })
  getCompanyStats(): Promise<CompanyStatsResponseDto> {
    return this.adminService.getCompanyStats();
  }

  @Get('stats/activity')
  @ApiOperation({
    summary: 'Get recent activity logs - ADMIN role required',
    description: 'Returns recent user login activity (last 10 logins)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns recent activity logs',
    type: RecentActivityResponseDto,
  })
  getRecentActivity(): Promise<RecentActivityResponseDto> {
    return this.adminService.getRecentActivity();
  }
}
