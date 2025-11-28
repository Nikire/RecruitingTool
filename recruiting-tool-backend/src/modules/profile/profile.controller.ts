import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Profile not found' })
@Auth(['USER'])
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own profile (authenticated user)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
    type: ProfileResponseDto,
  })
  getMyProfile(@CurrentUser() currentUser: User): Promise<ProfileResponseDto> {
    return this.profileService.getMyProfile(currentUser.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update own profile (authenticated user)' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated profile',
    type: ProfileResponseDto,
  })
  @ApiBody({ type: UpdateProfileDto })
  updateMyProfile(@CurrentUser() currentUser: User, @Body() updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    return this.profileService.updateMyProfile(currentUser.id, updateProfileDto);
  }

  @Get('user/:uid')
  @ApiOperation({ summary: 'Get profile by user UID - ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'Returns the profile for the specified user',
    type: ProfileResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'User UID' })
  @Auth(['ADMIN'])
  getProfileByUserUid(@Param('uid') uid: string): Promise<ProfileResponseDto> {
    return this.profileService.getProfileByUserUid(uid);
  }
}
