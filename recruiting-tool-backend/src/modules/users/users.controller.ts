import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UserResponseDto, UpdateUserDto } from './dto/users.dto';
import { Auth } from '../shared/auth/decorators/auth.decorator';
import { ApiBearerAuth, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { MessageResponseDto } from 'src/dto/responses.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'User not found' })
@Auth(['USER'])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Creates a User - ADMIN role required' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'The email already exists.',
  })
  @ApiBody({ type: CreateUserDto })
  @Auth(['ADMIN'])
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get users list' })
  @ApiResponse({
    status: 200,
    description: 'Returns the users details',
    type: [UserResponseDto],
  })
  findAll(): Promise<Array<UserResponseDto>> {
    return this.usersService.findAll();
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get one user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user details',
    type: UserResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  findOne(@Param('uid') uid: string): Promise<UserResponseDto> {
    return this.usersService.findOne(uid);
  }

  @Put(':uid')
  @ApiOperation({ summary: 'Update one user' })
  @ApiResponse({
    status: 200,
    description: 'Returns the user details',
    type: UserResponseDto,
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiParam({ name: 'uid', required: true })
  update(@Param('uid') uid: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.usersService.update(uid, updateUserDto);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete one user - SUPER_ADMIN role required' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
    example: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true })
  @Auth(['SUPER_ADMIN'])
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.usersService.remove(uid);
  }
}
