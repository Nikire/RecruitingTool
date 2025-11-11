import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'The description of the company', example: 'A leading technology company', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateCompanyDto {
  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp Updated', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'The description of the company', example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class CompanyResponseDto {
  @ApiProperty({ description: 'The UID of the company', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The name of the company', example: 'Tech Corp' })
  name: string;

  @ApiProperty({ description: 'The description of the company', example: 'A leading technology company', required: false })
  description?: string;

  @ApiProperty({ description: 'Number of users in the company', example: 5, required: false })
  userCount?: number;

  @ApiProperty({ description: 'Number of job positions', example: 10, required: false })
  jobPositionCount?: number;
}
