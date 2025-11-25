import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ParseResumeRequestDto, ParseResumeResponseDto } from './dto/parse-resume.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Auth } from '../shared/decorators/auth.decorator';
import { RolesType } from '@prisma/client';

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-resume')
  @Auth([RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Parse resume using AI',
    description:
      'Upload a resume file URL and extract structured data using OpenAI. Supports PDF, DOCX, and TXT formats.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resume parsed successfully',
    type: ParseResumeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file URL or unsupported file format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR, ADMIN, or SUPER_ADMIN role required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - OpenAI API error or configuration issue',
  })
  async parseResume(
    @Body() parseResumeDto: ParseResumeRequestDto,
  ): Promise<ParseResumeResponseDto> {
    return this.aiService.parseResume(parseResumeDto.fileUrl);
  }
}
