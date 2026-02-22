import { Controller, Get, Post, Patch, Body, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RolesType } from '@prisma/client';
import { ContactMessagesService } from './contact-messages.service';
import { CreateContactMessageDto, ContactMessageResponseDto } from './dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';

@ApiTags('Contact Messages')
@Controller('contact')
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact message (public endpoint - no auth required)' })
  @ApiResponse({
    status: 201,
    description: 'Contact message submitted successfully',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createContactMessageDto: CreateContactMessageDto): Promise<ContactMessageResponseDto> {
    return this.contactMessagesService.create(createContactMessageDto);
  }

  @Get('messages')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all contact messages (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20)' })
  @ApiResponse({
    status: 200,
    description: 'List of contact messages with pagination',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<{ data: ContactMessageResponseDto[]; total: number }> {
    return this.contactMessagesService.findAll(page, limit);
  }

  @Patch('messages/:uid/read')
  @Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a contact message as read (admin only)' })
  @ApiParam({ name: 'uid', description: 'Contact message UID' })
  @ApiResponse({
    status: 200,
    description: 'Contact message marked as read',
    type: ContactMessageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Contact message not found' })
  async markAsRead(@Param('uid') uid: string): Promise<ContactMessageResponseDto> {
    return this.contactMessagesService.markAsRead(uid);
  }
}
