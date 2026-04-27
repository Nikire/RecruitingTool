import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminTasksService } from './admin-tasks.service';
import { CreateAdminTaskDto, UpdateAdminTaskDto, AdminTaskResponseDto } from './dto/admin-task.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';

@ApiTags('admin-tasks')
@ApiBearerAuth()
@Controller('admin-tasks')
@Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
export class AdminTasksController {
  constructor(private readonly adminTasksService: AdminTasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all admin tasks - ADMIN role required' })
  @ApiResponse({ status: 200, description: 'Returns all admin tasks', type: [AdminTaskResponseDto] })
  findAll(): Promise<AdminTaskResponseDto[]> {
    return this.adminTasksService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create an admin task - ADMIN role required' })
  @ApiResponse({ status: 201, description: 'Task created', type: AdminTaskResponseDto })
  create(@Body() dto: CreateAdminTaskDto, @Request() req: { user: { id: number } }): Promise<AdminTaskResponseDto> {
    return this.adminTasksService.create(dto, req.user.id);
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Update an admin task - ADMIN role required' })
  @ApiResponse({ status: 200, description: 'Task updated', type: AdminTaskResponseDto })
  update(@Param('uid') uid: string, @Body() dto: UpdateAdminTaskDto): Promise<AdminTaskResponseDto> {
    return this.adminTasksService.update(uid, dto);
  }

  @Delete(':uid')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an admin task - ADMIN role required' })
  @ApiResponse({ status: 204, description: 'Task deleted' })
  remove(@Param('uid') uid: string): Promise<void> {
    return this.adminTasksService.remove(uid);
  }
}
