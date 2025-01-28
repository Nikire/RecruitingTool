import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { DatabaseService } from '../shared/database/database.service';

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const newUser = await this.databaseService.user.create({
        data: createUserDto,
      });

      return {
        uid: newUser.uid.toString(),
        name: newUser.name.toString(),
        email: newUser.email.toString(),
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findAll() {
    const users = await this.databaseService.user.findMany();
    return users.map((user) => ({
      uid: user.uid.toString(),
      name: user.name.toString(),
      email: user.email.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));
  }

  async findOne(uid: string) {
    const user = await this.databaseService.user.findUnique({
      where: { uid },
    });
    if (!user) {
      throw new NotFoundException(`User ${uid} not found`);
    }
    return {
      uid: user.uid.toString(),
      name: user.name.toString(),
      email: user.email.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async update(uid: string, updateUserDto: UpdateUserDto) {
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
    return {
      uid: updatedUser.uid.toString(),
      name: updatedUser.name.toString(),
      email: updatedUser.email.toString(),
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  async remove(uid: string) {
    const existingUser = await this.databaseService.user.findUnique({
      where: { uid },
    });
    if (!existingUser) {
      throw new NotFoundException(`User #${uid} not found`);
    }
    await this.databaseService.user.delete({ where: { uid } });
    return { message: `User deleted successfully` };
  }

  async findByEmail(email: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return {
      uid: user.uid.toString(),
      name: user.name.toString(),
      password: user.password.toString(),
      email: user.email.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
