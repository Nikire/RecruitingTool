import { Controller, Get, Post, Body, Param, Delete, Put, Query, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto, UpdateUserDto, UserActivityLogResponseDto } from './dto/users.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { UserActivityService } from './services/user-activity.service';
import { CheckQuota } from '../quota/decorators/check-quota.decorator';

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
}
