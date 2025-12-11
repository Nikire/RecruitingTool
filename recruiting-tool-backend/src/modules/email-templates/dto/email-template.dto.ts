import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { EmailTemplateType } from '@prisma/client';

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'Name of the email template', example: 'Application Received Confirmation' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Email subject line', example: 'Thank you for your application' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  subject: string;

  @ApiProperty({
    description: 'Email body with Handlebars variables',
    example: 'Dear {{candidateName}},\n\nThank you for applying to the {{positionTitle}} position at {{companyName}}.\n\nBest regards,\n{{hrName}}',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ description: 'UID of the company (optional for system-wide templates)', example: '123e4567-e89b-12d3-a456-426614174001', required: false })
  @IsUUID()
  @IsOptional()
  companyUid?: string;

  @ApiProperty({
    description: 'Template type for automated email selection',
    enum: EmailTemplateType,
    example: EmailTemplateType.APPLICATION_RECEIVED,
    required: false,
  })
  @IsEnum(EmailTemplateType)
  @IsOptional()
  type?: EmailTemplateType;

  @ApiProperty({ description: 'Is this a default template', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateEmailTemplateDto {
  @ApiProperty({ description: 'Name of the email template', example: 'Application Received Confirmation', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @ApiProperty({ description: 'Email subject line', example: 'Thank you for your application', required: false })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(500)
  subject?: string;

  @ApiProperty({
    description: 'Email body with Handlebars variables',
    example: 'Dear {{candidateName}},\n\nThank you for applying to the {{positionTitle}} position at {{companyName}}.\n\nBest regards,\n{{hrName}}',
    required: false,
  })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({
    description: 'Template type for automated email selection',
    enum: EmailTemplateType,
    example: EmailTemplateType.APPLICATION_RECEIVED,
    required: false,
  })
  @IsEnum(EmailTemplateType)
  @IsOptional()
  type?: EmailTemplateType;

  @ApiProperty({ description: 'Is this a default template', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class EmailTemplateResponseDto {
  @ApiProperty({ description: 'UUID of the email template', example: '123e4567-e89b-12d3-a456-426614174001' })
  uid: string;

  @ApiProperty({ description: 'Name of the email template', example: 'Application Received Confirmation' })
  name: string;

  @ApiProperty({ description: 'Email subject line', example: 'Thank you for your application' })
  subject: string;

  @ApiProperty({
    description: 'Email body with Handlebars variables',
    example: 'Dear {{candidateName}},\n\nThank you for applying to the {{positionTitle}} position at {{companyName}}.\n\nBest regards,\n{{hrName}}',
  })
  body: string;

  @ApiProperty({ description: 'UID of the company (null for system-wide templates)', example: '123e4567-e89b-12d3-a456-426614174001', nullable: true })
  companyUid: string | null;

  @ApiProperty({
    description: 'Template type for automated email selection',
    enum: EmailTemplateType,
    example: EmailTemplateType.APPLICATION_RECEIVED,
    nullable: true,
  })
  type: EmailTemplateType | null;

  @ApiProperty({ description: 'UID of the user who created the template', example: '123e4567-e89b-12d3-a456-426614174001' })
  createdByUid: string;

  @ApiProperty({ description: 'Name of the user who created the template', example: 'John Doe' })
  createdByName: string;

  @ApiProperty({ description: 'Is this a default template', example: false })
  isDefault: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class PreviewEmailTemplateDto {
  @ApiProperty({ description: 'Variables to use in template rendering', example: { candidateName: 'John Doe', positionTitle: 'Software Engineer' }, required: false })
  @IsOptional()
  variables?: Record<string, any>;
}

export class PreviewEmailTemplateResponseDto {
  @ApiProperty({ description: 'Rendered email subject with variables replaced', example: 'Interview Invitation - Software Engineer at Tech Corp' })
  renderedSubject: string;

  @ApiProperty({ description: 'Rendered email body with variables replaced', example: 'Dear John Doe,\n\nWe are pleased to invite you...' })
  renderedBody: string;
}
