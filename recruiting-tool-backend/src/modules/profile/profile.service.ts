import { Injectable, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ProfileMapper } from './entities/profile.entity';
import { EntityNotFoundException } from 'src/common/exceptions';

@Injectable()
export class ProfileService {
  constructor(private databaseService: DatabaseService) {}

  async getProfileByUserUid(userUid: string): Promise<ProfileResponseDto> {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { uid: userUid },
        include: { profile: true },
      });

      if (!user) {
        throw new EntityNotFoundException('User', userUid);
      }

      if (!user.profile) {
        throw new EntityNotFoundException('Profile', `for user ${userUid}`);
      }

      return ProfileMapper({ ...user.profile, user });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get profile by user UID: ${error.message}`,
      );
    }
  }

  async getMyProfile(userId: number): Promise<ProfileResponseDto> {
    try {
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // If profile doesn't exist, create one with defaults
      if (!user.profile) {
        const newProfile = await this.databaseService.profile.create({
          data: {
            userId: userId,
            timezone: 'UTC',
            preferences: {},
          },
          include: { user: true },
        });

        return ProfileMapper(newProfile);
      }

      return ProfileMapper({ ...user.profile, user });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get my profile: ${error.message}`,
      );
    }
  }

  async updateMyProfile(userId: number, updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    try {
      // Check if user exists
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      let profile;

      // If profile doesn't exist, create it
      if (!user.profile) {
        profile = await this.databaseService.profile.create({
          data: {
            userId: userId,
            timezone: updateProfileDto.timezone || 'UTC',
            preferences: updateProfileDto.preferences || {},
            bio: updateProfileDto.bio,
            phone: updateProfileDto.phone,
            location: updateProfileDto.location,
          },
          include: { user: true },
        });
      } else {
        // Update existing profile
        profile = await this.databaseService.profile.update({
          where: { userId: userId },
          data: updateProfileDto,
          include: { user: true },
        });
      }

      return ProfileMapper(profile);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update my profile: ${error.message}`,
      );
    }
  }

  async createProfile(userId: number, createProfileDto: CreateProfileDto): Promise<ProfileResponseDto> {
    try {
      // Check if user exists
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if profile already exists
      const existingProfile = await this.databaseService.profile.findUnique({
        where: { userId: userId },
      });

      if (existingProfile) {
        throw new NotFoundException(`Profile already exists for user ${userId}`);
      }

      const profile = await this.databaseService.profile.create({
        data: {
          userId: userId,
          timezone: createProfileDto.timezone || 'UTC',
          preferences: createProfileDto.preferences || {},
          bio: createProfileDto.bio,
          phone: createProfileDto.phone,
          location: createProfileDto.location,
        },
        include: { user: true },
      });

      return ProfileMapper(profile);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create profile: ${error.message}`,
      );
    }
  }
}
