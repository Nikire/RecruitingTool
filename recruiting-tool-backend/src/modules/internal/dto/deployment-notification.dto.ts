import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum DeploymentEnvironment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
}

export enum DeploymentStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export class DeploymentNotificationDto {
  @ApiProperty({ example: 'a1b2c3d', description: 'Short commit SHA (7 chars)' })
  @IsString()
  @IsNotEmpty()
  commitSha: string;

  @ApiProperty({ example: 'feat: add email log browser page', description: 'Commit message' })
  @IsString()
  @IsNotEmpty()
  commitMessage: string;

  @ApiProperty({ example: 'erikpastuszek', description: 'GitHub actor who triggered the deployment' })
  @IsString()
  @IsNotEmpty()
  actor: string;

  @ApiProperty({ example: 'development', enum: DeploymentEnvironment })
  @IsEnum(DeploymentEnvironment)
  environment: DeploymentEnvironment;

  @ApiProperty({ example: 'success', enum: DeploymentStatus })
  @IsEnum(DeploymentStatus)
  status: DeploymentStatus;

  @ApiPropertyOptional({ example: 'Build took 4m 12s', description: 'Optional extra notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
