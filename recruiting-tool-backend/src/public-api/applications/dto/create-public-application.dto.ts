import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePublicApplicationDto {
  @ApiProperty({ description: 'UID of the job position to apply for', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  @IsString()
  @IsNotEmpty()
  jobPositionUid: string;

  @ApiProperty({ description: 'Applicant full name', example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  applicantName: string;

  @ApiProperty({ description: 'Applicant email address', example: 'jane.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  applicantEmail: string;

  @ApiProperty({ description: 'Applicant phone number', example: '+1-555-000-0000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  applicantPhone: string;

  @ApiPropertyOptional({ description: 'Cover letter text', example: 'I am excited to apply...' })
  @IsString()
  @IsOptional()
  coverLetter?: string;
}
