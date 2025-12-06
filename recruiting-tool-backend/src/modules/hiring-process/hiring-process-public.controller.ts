import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { HiringProcessService } from './hiring-process.service';
import { PublicStatusResponseDto } from './dto/hiring-process.dto';

@ApiTags('Public - Hiring Process Status')
@Controller('public/status')
export class HiringProcessPublicController {
  constructor(private readonly hiringProcessService: HiringProcessService) {}

  @Get(':accessCode')
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
}
