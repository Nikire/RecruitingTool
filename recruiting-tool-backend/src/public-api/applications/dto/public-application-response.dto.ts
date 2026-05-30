import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class PublicApplicationResponseDto {
  @ApiProperty({ description: 'Unique identifier (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  uid: string;

  @ApiProperty({ description: 'Application status', enum: ApplicationStatus, example: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ApiProperty({ description: 'Applicant full name', example: 'Jane Doe' })
  applicantName: string;

  @ApiProperty({ description: 'Applicant email address', example: 'jane.doe@example.com' })
  applicantEmail: string;

  @ApiProperty({ description: 'Applicant phone number', example: '+1-555-000-0000' })
  applicantPhone: string;

  @ApiPropertyOptional({ description: 'Cover letter text', example: 'I am excited to apply...' })
  coverLetter: string | null;

  @ApiProperty({ description: 'UID of the job position this application is for', example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  jobPositionUid: string;

  @ApiProperty({ description: 'Timestamp when the application was submitted' })
  appliedAt: Date;

  @ApiProperty({ description: 'Timestamp when the record was created' })
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the record was last updated' })
  updatedAt: Date;
}
