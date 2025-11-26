import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisteredUserDto } from './dto/auth.dto';
import * as bycrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { CreateUserDto, UserWithPasswordResponseDto } from 'src/modules/users/dto/users.dto';
import { UserMapper } from 'src/modules/users/entities/users.entities';
import { UserActivityService } from 'src/modules/users/services/user-activity.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly userActivityService: UserActivityService,
  ) {}

  async register({ name, email, password }: CreateUserDto): Promise<RegisteredUserDto> {
    const foundUser = await this.usersService.findByEmail(email);
    if (foundUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.usersService.create({
      name,
      email,
      password,
    });

    const { token } = await this.login({ email, password });
    return {
      user,
      token,
    };
  }

  async login({ email, password }: LoginDto): Promise<RegisteredUserDto> {
    const foundUser = await this.usersService.findByEmail(email);
    if (!foundUser) {
      throw new UnauthorizedException('Email is wrong');
    }

    // Check if user is active
    if (!foundUser.isActive) {
      throw new UnauthorizedException('User account has been deactivated');
    }

    const isPasswordValid = await bycrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is wrong');
    }

    // Create minimal JWT payload (don't include sensitive data like password!)
    const payload = {
      sub: foundUser.id,     // Standard JWT claim for user ID
      id: foundUser.id,
      email: foundUser.email,
      roles: foundUser.roles,
      companyUid: foundUser.companyUid,
    };

    const token = await this.jwtService.signAsync(payload, { expiresIn: '1d' });

    // Update last login time
    await this.usersService.updateLastLogin(foundUser.id);

    // Log the login activity
    await this.userActivityService.logActivity(foundUser.id, {
      action: 'LOGIN',
      metadata: { loginMethod: 'email' },
    });

    return {
      user: { ...UserMapper(foundUser) },
      token,
    };
  }

  async verifyToken(token: string): Promise<UserWithPasswordResponseDto> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);

      // Fetch fresh user data from database instead of using stale token data
      const freshUser = await this.usersService.findByEmail(decoded.email);

      if (!freshUser) {
        throw new UnauthorizedException('User not found');
      }

      // Check if user is active
      if (!freshUser.isActive) {
        throw new UnauthorizedException('User account has been deactivated');
      }

      return freshUser;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
