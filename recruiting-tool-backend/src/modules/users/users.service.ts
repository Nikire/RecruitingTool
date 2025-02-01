import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto, CreateUserInternalDto, UpdateUserDto, UserResponseDto, UserWithPasswordResponseDto } from './dto/users.dto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { UserMapper, UserWithPasswordMapper } from './entities/users.entities';
import * as bycrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
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

    const updatedUser = await this.databaseService.user.update({
      where: { uid },
      data: updateUserDto,
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
