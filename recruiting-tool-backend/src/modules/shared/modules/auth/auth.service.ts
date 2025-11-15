import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisteredUserDto } from './dto/auth.dto';
import * as bycrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import { CreateUserDto, UserWithPasswordResponseDto } from 'src/modules/users/dto/users.dto';
import { UserMapper } from 'src/modules/users/entities/users.entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

    const isPasswordValid = await bycrypt.compare(password, foundUser.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is wrong');
    }

    const payload = foundUser;

    const token = await this.jwtService.signAsync(payload, { expiresIn: '1d' });

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

      return freshUser;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
