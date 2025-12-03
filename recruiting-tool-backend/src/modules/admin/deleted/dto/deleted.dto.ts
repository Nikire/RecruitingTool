import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for deleted Candidate records
 */
export class DeletedCandidateDto {
  @ApiProperty({ description: 'Candidate UID' })
  uid: string;

  @ApiProperty({ description: 'Candidate name' })
  name: string;

  @ApiProperty({ description: 'Candidate email' })
  email: string;

  @ApiProperty({ description: 'Source of application', nullable: true })
  source?: string;

  @ApiProperty({ description: 'Date when the record was deleted' })
  deletedAt: Date;

  @ApiProperty({ description: 'Date when the record was created' })
  createdAt: Date;
}

/**
 * Response DTO for deleted JobPosition records
 */
export class DeletedJobPositionDto {
  @ApiProperty({ description: 'JobPosition UID' })
  uid: string;

  @ApiProperty({ description: 'Job position title' })
  title: string;

  @ApiProperty({ description: 'Job position description', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Job position status' })
  status: string;

  @ApiProperty({ description: 'Date when the record was deleted' })
  deletedAt: Date;

  @ApiProperty({ description: 'Date when the record was created' })
  createdAt: Date;
}

/**
 * Response DTO for deleted Application records
 */
export class DeletedApplicationDto {
  @ApiProperty({ description: 'Application UID' })
  uid: string;

  @ApiProperty({ description: 'Applicant name' })
  applicantName: string;

  @ApiProperty({ description: 'Applicant email' })
  applicantEmail: string;

  @ApiProperty({ description: 'Application status' })
  status: string;

  @ApiProperty({ description: 'Date when the record was deleted' })
  deletedAt: Date;

  @ApiProperty({ description: 'Date when application was submitted' })
  appliedAt: Date;
}

/**
 * Response DTO for deleted Interview records
 */
export class DeletedInterviewDto {
  @ApiProperty({ description: 'Interview UID' })
  uid: string;

  @ApiProperty({ description: 'Scheduled date', nullable: true })
  scheduledDate?: Date;

  @ApiProperty({ description: 'Interview status' })
  status: string;

  @ApiProperty({ description: 'Date when the record was deleted' })
  deletedAt: Date;

  @ApiProperty({ description: 'Date when the record was created' })
  createdAt: Date;
}

/**
 * Response DTO for purge operation
 */
export class PurgeResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;
}
