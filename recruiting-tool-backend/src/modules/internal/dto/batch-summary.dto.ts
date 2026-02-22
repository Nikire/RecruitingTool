import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BatchIssueDto {
  @ApiProperty({ example: 270, description: 'GitHub issue number' })
  @IsNumber()
  number: number;

  @ApiProperty({ example: 'Forgot password flow', description: 'Issue title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'completed', description: 'Issue status' })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class BatchSummaryDto {
  @ApiProperty({ example: 'Batch 3 - Auth Features', description: 'Name of the batch' })
  @IsString()
  @IsNotEmpty()
  batchName: string;

  @ApiProperty({
    type: [BatchIssueDto],
    description: 'List of issues included in this batch',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchIssueDto)
  issues: BatchIssueDto[];

  @ApiProperty({
    type: [String],
    example: ['Register new account → check verification email received'],
    description: 'Testing checklist items',
  })
  @IsArray()
  @IsString({ each: true })
  testingChecklist: string[];

  @ApiPropertyOptional({
    example: 'Optional extra context',
    description: 'Additional notes or context about this batch',
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
