import { Controller, Get, Post, Body, Param, Delete, Put, Patch, Query, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto, UpdateUserDto, UserActivityLogResponseDto, UpdateProfileDto } from './dto/users.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse, ApiConsumes } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { UserActivityService } from './services/user-activity.service';
import { CheckQuota } from '../quota/decorators/check-quota.decorator';
import { OnboardingService } from './services/onboarding.service';
import { HROnboardingStatusDto, CompleteHROnboardingDto, HROnboardingCompleteResponseDto } from './dto/onboarding.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from '../storage/pipes/file-validation.pipe';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'User not found' })
@Auth(['USER'])
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userActivityService: UserActivityService,
    private readonly onboardingService: OnboardingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Creates a User - ADMIN role required' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 402,
    description: 'Payment Required - Quota exceeded for current subscription plan',
  })
  @ApiConflictResponse({
    description: 'The email already exists.',
  })
  @ApiBody({ type: CreateUserDto })
  @Auth(['ADMIN'])
  @CheckQuota('users')
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get('list')
  @ApiOperation({ summary: 'Get paginated users list with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated users list',
  })
  list(@Query() paginationDto: PaginationDto): Promise<PaginatedResponse<UserResponseDto>> {
    return this.usersService.list(paginationDto);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get one user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user details',
    type: UserResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string): Promise<UserResponseDto> {
    return this.usersService.findOne(uid);
  }

  @Put(':uid')
  @ApiOperation({ summary: 'Update one user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user details',
    type: UserResponseDto,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(uid, updateUserDto);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete one user - SUPER_ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    example: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  @Auth(['SUPER_ADMIN'])
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.usersService.remove(uid);
  }

  @Put(':uid/deactivate')
  @ApiOperation({ summary: 'Deactivate a user (soft delete) - SUPER_ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deactivated.',
    type: UserResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  @Auth(['SUPER_ADMIN'])
  deactivateUser(@Param('uid') uid: string, @Request() req): Promise<UserResponseDto> {
    return this.usersService.deactivateUser(uid, req.user.id);
  }

  @Put(':uid/reactivate')
  @ApiOperation({ summary: 'Reactivate a user - SUPER_ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully reactivated.',
    type: UserResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  @Auth(['SUPER_ADMIN'])
  reactivateUser(@Param('uid') uid: string, @Request() req): Promise<UserResponseDto> {
    return this.usersService.reactivateUser(uid, req.user.id);
  }

  @Get(':uid/activity')
  @ApiOperation({ summary: 'Get user activity log - ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'Returns user activity logs',
    type: [UserActivityLogResponseDto],
  })
  @ApiParam({ name: 'uid', required: true })
  @Auth(['ADMIN'])
  getUserActivity(@Param('uid') uid: string): Promise<UserActivityLogResponseDto[]> {
    return this.userActivityService.getUserActivity(uid);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiBody({ type: UpdateProfileDto })
  @Auth(['USER'])
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Get('onboarding/hr/status')
  @ApiOperation({ summary: 'Get HR onboarding status for current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns HR onboarding status',
    type: HROnboardingStatusDto,
  })
  @Auth(['HR', 'USER'])
  getHROnboardingStatus(@Request() req): Promise<HROnboardingStatusDto> {
    return this.onboardingService.getHROnboardingStatus(req.user.id);
  }

  @Post('onboarding/hr/complete')
  @ApiOperation({ summary: 'Complete HR user onboarding' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
    type: HROnboardingCompleteResponseDto,
  })
  @ApiBody({ type: CompleteHROnboardingDto })
  @Auth(['HR', 'USER'])
  completeHROnboarding(@Request() req, @Body() data: CompleteHROnboardingDto): Promise<HROnboardingCompleteResponseDto> {
    return this.onboardingService.completeHROnboarding(req.user.id, data);
  }

  @Post('resume')
  @ApiOperation({ summary: 'Upload resume for current user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Resume file (PDF, DOC, DOCX - max 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Resume uploaded successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or file too large',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Auth(['USER'])
  async uploadResume(
    @Request() req,
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    return this.usersService.uploadResume(req.user.id, file);
  }

  @Get('resume/download')
  @ApiOperation({ summary: 'Get presigned URL for resume download' })
  @ApiResponse({
    status: 200,
    description: 'Returns presigned download URL',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: { type: 'string' },
        fileName: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Resume not found',
  })
  @Auth(['USER'])
  async getResumeDownloadUrl(@Request() req) {
    return this.usersService.getResumeDownloadUrl(req.user.id);
  }

  @Delete('resume')
  @ApiOperation({ summary: 'Delete resume for current user' })
  @ApiResponse({
    status: 200,
    description: 'Resume deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Resume not found',
  })
  @Auth(['USER'])
  async deleteResume(@Request() req): Promise<MessageResponseDto> {
    return this.usersService.deleteResume(req.user.id);
  }
}
