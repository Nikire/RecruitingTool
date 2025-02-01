import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisteredUserDto } from './dto/auth.dto';
import { CreateUserDto } from 'src/modules/users/dto/users.dto';
import { ApiBadRequestResponse, ApiBody, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@ApiResponse({
  status: 201,
  description: 'Returns the user details',
  type: RegisteredUserDto,
})
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: 'Register a User' })
  @ApiBadRequestResponse({
    description: 'User already exists',
  })
  @ApiBody({ type: CreateUserDto })
  @Post('register')
  register(
    @Body()
    registerDto: CreateUserDto,
  ): Promise<RegisteredUserDto> {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Login a User' })
  @ApiUnauthorizedResponse({
    description: 'Email is wrong or Password is wrong',
  })
  @ApiBody({ type: LoginDto })
  @Post('sign-in')
  login(
    @Body()
    loginDto: LoginDto,
  ): Promise<RegisteredUserDto> {
    return this.authService.login(loginDto);
  }
}
