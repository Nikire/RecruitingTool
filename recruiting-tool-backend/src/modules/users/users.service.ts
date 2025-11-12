import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto, CreateUserInternalDto, UpdateUserDto, UserResponseDto, UserWithPasswordResponseDto } from './dto/users.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { UserMapper, UserWithPasswordMapper } from './entities/users.entities';
import { PaginationDto, PaginatedResponse } from 'src/dto/pagination.dto';
import * as bycrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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
      });

      return UserMapper(newUser);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async createInternal(createUserDto: CreateUserInternalDto): Promise<UserResponseDto> {
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
  }

  async findAll(): Promise<Array<UserResponseDto>> {
    const users = await this.databaseService.user.findMany();
    return users.map((user) => UserMapper(user));
  }

  async list(paginationDto: PaginationDto): Promise<PaginatedResponse<UserResponseDto>> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;
    const skip = (page - 1) * limit;

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
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        company: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => UserMapper(user)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(uid: string): Promise<UserResponseDto> {
    const user = await this.databaseService.user.findUnique({
      where: { uid },
    });
    if (!user) {
      throw new NotFoundException(`User ${uid} not found`);
    }
    return UserMapper(user);
  }

  async update(uid: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    if (!uid) {
      throw new NotFoundException(`User ${uid} not found`);
    }
    const existingUser = await this.databaseService.user.findUnique({
      where: { uid },
    });

    if (!existingUser) {
      throw new NotFoundException(`User ${uid} not found`);
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
    });
    return UserMapper(updatedUser);
  }

  async remove(uid: string): Promise<MessageResponseDto> {
    const existingUser = await this.databaseService.user.findUnique({
      where: { uid },
    });
    if (!existingUser) {
      throw new NotFoundException(`User #${uid} not found`);
    }
    await this.databaseService.user.delete({ where: { uid } });
    return { message: `User deleted successfully` };
  }

  async findByEmail(email: string): Promise<UserWithPasswordResponseDto> | null {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return UserWithPasswordMapper(user);
  }
}
