import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

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

  @ApiProperty({ description: 'UID of the company', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  @IsNotEmpty()
  companyUid: string;

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

  @ApiProperty({ description: 'UID of the company', example: '123e4567-e89b-12d3-a456-426614174001' })
  companyUid: string;

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
