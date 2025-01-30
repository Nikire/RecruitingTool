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
    const user = await this.usersService.findByEmail(email);
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const newUser = await this.usersService.create({
      name,
      email,
      password: await bycrypt.hash(password, 10),
    });

    const { token } = await this.login({ email, password });
    return {
      ...newUser,
      token,
    };
  }

  async login({ email, password }: LoginDto): Promise<RegisteredUserDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email is wrong');
    }

    const isPasswordValid = await bycrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is wrong');
    }

    const payload = user;

    const token = await this.jwtService.signAsync(payload, { expiresIn: '1d' });

    return {
      ...UserMapper(user),
      token,
    };
  }

  async verifyToken(token: string): Promise<UserWithPasswordResponseDto> {
    try {
      const user = await this.jwtService.verifyAsync(token);
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
