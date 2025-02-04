import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { StageStatus, StageType } from '@prisma/client';

export class CreateStageDto {
  @ApiProperty({ description: 'The title of the stage', example: 'Technical Interview' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'The type of the stage', example: StageType.INTERVIEW, enum: StageType })
  @IsEnum(StageType)
  @IsNotEmpty()
  type: StageType;

  @ApiProperty({ description: 'The description of the stage', example: 'A technical interview with coding challenges' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({ description: 'The UID of the hiring process', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsString()
  @IsNotEmpty()
  hiringProcessUid: string;

  @ApiProperty({ description: 'The position of the stage', example: 1 })
  @IsOptional()
  @IsNumber()
  position?: number;
}

export class UpdateStageDto {
  @ApiProperty({ description: 'The title of the stage', example: 'Final Interview', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: 'The type of the stage', example: StageType.TECHNICAL_INTERVIEW, enum: StageType, required: false })
  @IsOptional()
  @IsEnum(StageType)
  type?: StageType;

  @ApiProperty({ description: 'The description of the stage', example: 'A final round interview with senior leadership', required: false })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'The status of the stage', example: StageStatus.DONE, enum: StageStatus, required: false })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;

  @ApiProperty({ description: 'The position of the stage', example: 2, required: false })
  @IsOptional()
  @IsNumber()
  position?: number;
}

export class StageResponseDto {
  @ApiProperty({ description: 'The UID of the stage', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The title of the stage', example: 'Technical Interview' })
  title: string;

  @ApiProperty({ description: 'The type of the stage', example: StageType.INTERVIEW, enum: StageType })
  type: StageType;

  @ApiProperty({ description: 'The description of the stage', example: 'A technical interview with coding challenges' })
  description: string;

  @ApiProperty({ description: 'The status of the stage', example: StageStatus.DONE, enum: StageStatus })
  status: StageStatus;
}
