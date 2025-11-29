import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CandidateImportRowDto {
  @ApiProperty({ description: 'Name of the candidate', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Email of the candidate', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number (optional)', example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'LinkedIn profile URL (optional)', example: 'https://www.linkedin.com/in/johndoe', required: false })
  @IsUrl()
  @IsOptional()
  linkedin?: string;

  @ApiProperty({ description: 'Additional notes (optional)', example: 'Referred by Jane Smith', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class CandidateImportErrorDto {
  @ApiProperty({ description: 'Row number where the error occurred', example: 1 })
  row: number;

  @ApiProperty({ description: 'Name from the row (if available)', example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ description: 'Email from the row (if available)', example: 'john.doe@example.com', required: false })
  email?: string;

  @ApiProperty({ description: 'List of validation errors', example: ['Email is already in use', 'Invalid phone number'] })
  errors: string[];
}

export class CandidateImportResultDto {
  @ApiProperty({ description: 'Total rows in the CSV file', example: 10 })
  totalRows: number;

  @ApiProperty({ description: 'Number of candidates successfully imported', example: 8 })
  successCount: number;

  @ApiProperty({ description: 'Number of rows with errors', example: 2 })
  errorCount: number;

  @ApiProperty({ description: 'List of errors that occurred', type: [CandidateImportErrorDto] })
  errors: CandidateImportErrorDto[];

  @ApiProperty({ description: 'List of successfully imported candidate UIDs', example: ['uuid-1', 'uuid-2'] })
  importedCandidates: string[];
}

export class CandidateImportPreviewDto {
  @ApiProperty({ description: 'List of valid rows ready for import', type: [CandidateImportRowDto] })
  validRows: CandidateImportRowDto[];

  @ApiProperty({ description: 'List of rows with validation errors', type: [CandidateImportErrorDto] })
  invalidRows: CandidateImportErrorDto[];

  @ApiProperty({ description: 'Total number of rows in the CSV', example: 10 })
  totalRows: number;

  @ApiProperty({ description: 'Number of valid rows', example: 8 })
  validCount: number;

  @ApiProperty({ description: 'Number of invalid rows', example: 2 })
  invalidCount: number;
}
