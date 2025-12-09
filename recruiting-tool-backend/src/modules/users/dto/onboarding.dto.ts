import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class HROnboardingStatusDto {
  @ApiProperty({ description: 'Whether onboarding is complete', example: true })
  isOnboardingComplete: boolean;

  @ApiProperty({ description: 'Whether profile is complete', example: false })
  isProfileComplete: boolean;

  @ApiProperty({ description: 'Whether user is connected to a company', example: true })
  hasCompany: boolean;

  @ApiProperty({ description: 'Next step in onboarding', example: 'complete_profile' })
  nextStep: 'complete_profile' | 'dashboard';
}

export class CompleteHROnboardingDto {
  @ApiProperty({ description: 'Job position/title', example: 'HR Manager', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  position?: string;

  @ApiProperty({ description: 'Department', example: 'Human Resources', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiProperty({ description: 'Phone number', example: '+1-555-0123', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ description: 'User timezone', example: 'America/New_York', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiProperty({ description: 'Professional bio', example: 'Experienced HR professional...', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}

export class HROnboardingCompleteResponseDto {
  @ApiProperty({ description: 'Success message' })
  message: string;

  @ApiProperty({ description: 'Whether onboarding is complete', example: true })
  isOnboardingComplete: boolean;

  @ApiProperty({ description: 'Next step redirect', example: '/hr/dashboard' })
  redirectTo: string;
}
