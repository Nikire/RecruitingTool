import { ApiProperty } from '@nestjs/swagger';
import { HiringProcessStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserResponseDto } from 'src/modules/users/dto/users.dto';

export class CreateHiringProcessDto {
  @ApiProperty({ description: 'The title of the hiring process', example: 'Software Engineer Interview' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'The UID of the candidate', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  candidateUid: string;
}

export class UpdateHiringProcessDto {
  @ApiProperty({ description: 'The title of the hiring process', example: 'Senior Software Engineer Postulation' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: 'The UID of the candidate', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsString()
  candidateUid?: string;

  @ApiProperty({ description: 'The status of the hiring process', example: 'IN_PROGRESS', enum: HiringProcessStatus })
  @IsOptional()
  @IsEnum(HiringProcessStatus)
  status?: HiringProcessStatus;
}

/*  uid: hiringProcess.uid,
    title: hiringProcess.title,
    status: hiringProcess.status,
    candidate: UserMapper(hiringProcess.candidate),
     */

export class HiringProcessResponseDto {
  @ApiProperty({ description: 'The UID of the hiring process', example: '123e4567-e89b-12d3-a456-426614174000' })
  uid: string;

  @ApiProperty({ description: 'The title of the hiring process', example: 'Software Engineer Interview' })
  title: string;

  @ApiProperty({ description: 'The status of the hiring process', example: 'IN_PROGRESS', enum: HiringProcessStatus })
  status: HiringProcessStatus;

  @ApiProperty({ description: 'The candidate of the hiring process' })
  candidate?: UserResponseDto;
}
