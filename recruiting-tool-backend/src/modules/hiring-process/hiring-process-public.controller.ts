import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { HiringProcessService } from './hiring-process.service';
import { PublicStatusResponseDto, PublicHiringProcessTrackingDto } from './dto/hiring-process.dto';

@ApiTags('Public - Hiring Process Status')
@Controller()
export class HiringProcessPublicController {
  constructor(private readonly hiringProcessService: HiringProcessService) {}

  @Get('public/status/:accessCode')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute per IP
  @ApiOperation({ summary: 'Get hiring process status by access code (Public - No auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Returns hiring process status information',
    type: PublicStatusResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid or expired access code',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many status check requests. Maximum 5 requests per minute per IP.',
  })
  @ApiParam({ name: 'accessCode', required: true, description: 'Access code provided to candidate', example: 'A1B2C3D4' })
  getStatus(@Param('accessCode') accessCode: string): Promise<PublicStatusResponseDto> {
    return this.hiringProcessService.getStatusByAccessCode(accessCode);
  }

  @Get('hiring-process/:uid/public')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute per IP
  @ApiOperation({ summary: 'Get hiring process tracking view by UID (Public - No auth required)' })
  @ApiResponse({
    status: 200,
    description: 'Returns hiring process tracking information for the candidate',
    type: PublicHiringProcessTrackingDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Hiring process not found',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests. Maximum 30 requests per minute per IP.',
  })
  @ApiParam({ name: 'uid', required: true, description: 'UID of the hiring process', example: '123e4567-e89b-12d3-a456-426614174000' })
  getPublicTracking(@Param('uid') uid: string): Promise<PublicHiringProcessTrackingDto> {
    return this.hiringProcessService.getPublicTracking(uid);
  }
}
