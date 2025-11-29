import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiUnauthorizedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { EmailTemplatesService } from './email-templates.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto, EmailTemplateResponseDto, PreviewEmailTemplateDto, PreviewEmailTemplateResponseDto } from './dto/email-template.dto';
import { MessageResponseDto } from 'src/dto/responses.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';

@ApiTags('Email Templates')
@ApiBearerAuth()
@Controller('email-templates')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Email template not found' })
@Auth(['HR', 'ADMIN'])
export class EmailTemplatesController {
  constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new email template' })
  @ApiResponse({
    status: 201,
    description: 'The email template has been successfully created.',
    type: EmailTemplateResponseDto,
  })
  @ApiBody({ type: CreateEmailTemplateDto })
  create(@Body() createDto: CreateEmailTemplateDto, @CurrentUser() user: any): Promise<EmailTemplateResponseDto> {
    return this.emailTemplatesService.create(createDto, user.id);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes - templates rarely change
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of email templates',
    type: [EmailTemplateResponseDto],
  })
  @ApiQuery({ name: 'companyUid', required: false, description: 'Filter by company UID' })
  findAll(@Query('companyUid') companyUid?: string): Promise<EmailTemplateResponseDto[]> {
    return this.emailTemplatesService.findAll(companyUid);
  }

  @Get(':uid')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes
  @ApiOperation({ summary: 'Get an email template by UID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the email template details',
    type: EmailTemplateResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the email template' })
  findOne(@Param('uid') uid: string): Promise<EmailTemplateResponseDto> {
    return this.emailTemplatesService.findOne(uid);
  }

  @Put(':uid')
  @ApiOperation({ summary: 'Update an email template by UID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated email template',
    type: EmailTemplateResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the email template' })
  @ApiBody({ type: UpdateEmailTemplateDto })
  update(@Param('uid') uid: string, @Body() updateDto: UpdateEmailTemplateDto): Promise<EmailTemplateResponseDto> {
    return this.emailTemplatesService.update(uid, updateDto);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete an email template by UID' })
  @ApiResponse({
    status: 200,
    description: 'The email template has been successfully deleted.',
    type: MessageResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the email template' })
  remove(@Param('uid') uid: string): Promise<MessageResponseDto> {
    return this.emailTemplatesService.remove(uid);
  }

  @Post(':uid/preview')
  @ApiOperation({ summary: 'Preview an email template with sample or provided data' })
  @ApiResponse({
    status: 200,
    description: 'Returns the rendered template with variables replaced',
    type: PreviewEmailTemplateResponseDto,
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the email template' })
  @ApiBody({ type: PreviewEmailTemplateDto, required: false })
  preview(@Param('uid') uid: string, @Body() previewDto?: PreviewEmailTemplateDto): Promise<PreviewEmailTemplateResponseDto> {
    return this.emailTemplatesService.preview(uid, previewDto?.variables);
  }
}
