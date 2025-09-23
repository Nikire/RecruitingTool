import { ApiProperty } from '@nestjs/swagger';
import { JobPositionStatus } from '@prisma/client';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { HiringProcessResponseDto } from 'src/modules/hiring-process/dto/hiring-process.dto';
import { CreateStageDto, StageResponseDto } from 'src/modules/hiring-process/modules/stages/dto/stages.dto';

export class JobPositionResponseDto {
  @ApiProperty({ description: 'The title of the Job position', example: 'Software Engineer Interview' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'The UID of the job position', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The status of the job position', example: 'OPEN', enum: JobPositionStatus })
  status: JobPositionStatus;

  @ApiProperty({ description: 'The stages of the job position' })
  stages?: Array<StageResponseDto>;

  @ApiProperty({ description: 'The hiring processes of the job position' })
  hiringProcesses?: Array<HiringProcessResponseDto>;
}

export class CreateJobPositionDto {
  @ApiProperty({ description: 'The title of the Job position', example: 'Software Engineer Interview' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'The stages of the job position', type: [CreateStageDto] })
  stages?: Array<CreateStageDto>;
}

export class UpdateJobPositionDto {
  @ApiProperty({ description: 'The title of the Job position', example: 'Software Engineer Interview' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title?: string;
}
