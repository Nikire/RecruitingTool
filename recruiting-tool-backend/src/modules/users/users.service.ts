import { Injectable, ConflictException, NotFoundException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto, CreateUserInternalDto, UpdateUserDto, UserResponseDto, UserWithPasswordResponseDto } from './dto/users.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { UserMapper, UserWithPasswordMapper } from './entities/users.entities';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import { StorageService } from '../storage/storage.service';
import * as bycrypt from 'bcryptjs';
import { EntityNotFoundException } from 'src/common/exceptions';

@Injectable()
export class UsersService {
  constructor(
    private databaseService: DatabaseService,
    private storageService: StorageService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
    try {
      let companyId: number | undefined = undefined;
      if (createUserDto.companyUid) {
        const company = await this.databaseService.company.findUnique({
          where: { uid: createUserDto.companyUid },
        });
        if (!company) {
          throw new NotFoundException(`Company ${createUserDto.companyUid} not found`);
        }
        companyId = company.id;
      }

      const { companyUid, ...userData } = createUserDto;
      const newUser = await this.databaseService.user.create({
        data: { ...userData, password: await bycrypt.hash(createUserDto.password, 10), companyId },
        include: {
          company: true,
        },
      });

      return UserMapper(newUser);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create: ${error.message}`,
      );
    }}

  async createInternal(createUserDto: CreateUserInternalDto): Promise<UserResponseDto> {
    try {
    try {
      const newUser = await this.databaseService.user.create({
        data: { ...createUserDto, password: await bycrypt.hash(createUserDto.password, 10) },
      });

      return UserMapper(newUser);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create internal: ${error.message}`,
      );
    }}

  async findAll(): Promise<Array<UserResponseDto>> {
    try {
    const users = await this.databaseService.user.findMany({
      include: {
        company: true,
      },
    });
    return users.map((user) => UserMapper(user));
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find all: ${error.message}`,
      );
    }}

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<UserResponseDto>> {
    try {
    const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Get total count
    const total = await this.databaseService.user.count({ where });

    // Get paginated data
    const users = await this.databaseService.user.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortBy]: sortOrder },
      include: {
        company: true,
      },
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data: users.map((user) => UserMapper(user)),
      pagination: {
        total,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to list: ${error.message}`,
      );
    }}

  async findOne(uid: string): Promise<UserResponseDto> {
    try {
    const user = await this.databaseService.user.findUnique({
      where: { uid },
      include: {
        company: true,
      },
    });
    if (!user) {
      throw new EntityNotFoundException('User', uid);
    }
    return UserMapper(user);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find one: ${error.message}`,
      );
    }}

  async update(uid: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
    if (!uid) {
      throw new EntityNotFoundException('User', uid);
    }
    const existingUser = await this.databaseService.user.findUnique({
      where: { uid },
    });

    if (!existingUser) {
      throw new EntityNotFoundException('User', uid);
    }

    // Delete old profile picture if a new one is being set
    if (updateUserDto.profilePicture !== undefined && existingUser.profilePicture) {
      // Only delete if the new value is different from the old one
      if (updateUserDto.profilePicture !== existingUser.profilePicture) {
        try {
          // Get the file record to find the S3 key
          const oldFile = await this.databaseService.fileUpload.findUnique({
            where: { uid: existingUser.profilePicture },
          });

          if (oldFile) {
            // Delete from S3/MinIO
            await this.storageService.deleteFile(oldFile.s3Key);
            // Delete from database
            await this.databaseService.fileUpload.delete({
              where: { uid: existingUser.profilePicture },
            });
          }
        } catch (error) {
          // Log error but don't fail the update if file deletion fails
          console.error(`Failed to delete old profile picture ${existingUser.profilePicture}:`, error.message);
        }
      }
    }

    let companyId: number | undefined = undefined;
    if (updateUserDto.companyUid) {
      const company = await this.databaseService.company.findUnique({
        where: { uid: updateUserDto.companyUid },
      });
      if (!company) {
        throw new NotFoundException(`Company ${updateUserDto.companyUid} not found`);
      }
      companyId = company.id;
    }

    const { companyUid, ...userData } = updateUserDto;
    const updatedUser = await this.databaseService.user.update({
      where: { uid },
      data: { ...userData, ...(companyId !== undefined && { companyId }) },
      include: {
        company: true,
      },
    });
    return UserMapper(updatedUser);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update: ${error.message}`,
      );
    }}

  async remove(uid: string): Promise<MessageResponseDto> {
    try {
    const existingUser = await this.databaseService.user.findUnique({
      where: { uid },
    });
    if (!existingUser) {
      throw new NotFoundException(`User #${uid} not found`);
    }
    await this.databaseService.user.delete({ where: { uid } });
    return { message: `User deleted successfully` };
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove: ${error.message}`,
      );
    }}

  async findByEmail(email: string): Promise<UserWithPasswordResponseDto> | null {
    try {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return UserWithPasswordMapper(user);
  
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to find by email: ${error.message}`,
      );
    }}
}
