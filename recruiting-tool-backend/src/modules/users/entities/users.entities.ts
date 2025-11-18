import { UserResponseDto, UserWithPasswordResponseDto } from '../dto/users.dto';
import { User } from '@prisma/client';

export function UserLoginMapper(user: User | UserWithPasswordResponseDto): UserResponseDto {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
  };
}

export function UserMapper(user: any): UserResponseDto {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    createdAt: typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toISOString(),
    updatedAt: typeof user.updatedAt === 'string' ? user.updatedAt : user.updatedAt.toISOString(),
    roles: user.roles,
    companyUid: user.company?.uid,
    profilePicture: user.profilePicture,
    phoneNumber: user.phoneNumber,
    position: user.position,
    department: user.department,
    bio: user.bio,
    linkedinUrl: user.linkedinUrl,
    timezone: user.timezone,
  };
}

export function PublicUserMapper(user: User | UserWithPasswordResponseDto): UserResponseDto {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
  };
}

export function UserWithPasswordMapper(user: any): UserWithPasswordResponseDto {
  return {
    uid: user.uid,
    name: user.name,
    email: user.email,
    password: user.password,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    roles: user.roles,
    companyUid: user.company?.uid,
    profilePicture: user.profilePicture,
    phoneNumber: user.phoneNumber,
    position: user.position,
    department: user.department,
    bio: user.bio,
    linkedinUrl: user.linkedinUrl,
    timezone: user.timezone,
  };
}
