import { UserResponseDto, UserWithPasswordResponseDto } from '../dto/users.dto';
import { User } from '@prisma/client';

export function UserMapper(user: User | UserWithPasswordResponseDto): UserResponseDto {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    createdAt: typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString(),
    updatedAt: typeof user.updatedAt === 'string' ? user.updatedAt : user.updatedAt.toISOString(),
  };
}

export function UserWithPasswordMapper(user: User): UserWithPasswordResponseDto {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
