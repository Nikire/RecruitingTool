import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { ScorecardTemplateService } from './scorecard-template.service';
import { ScorecardService } from './scorecard.service';
import {
  CreateScorecardTemplateDto,
  UpdateScorecardTemplateDto,
  SubmitScorecardDto,
  ScorecardTemplateResponseDto,
  ScorecardResponseDto,
  ScorecardSummaryDto,
} from './dto/scorecard.dto';

@Controller('scorecard')
export class ScorecardController {
  constructor(
    private readonly templateService: ScorecardTemplateService,
    private readonly scorecardService: ScorecardService,
  ) {}

  // Template endpoints
  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('templates')
  async getTemplates(@Query('companyUid') companyUid?: string): Promise<ScorecardTemplateResponseDto[]> {
    return this.templateService.getTemplates(companyUid);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @Get('templates/:uid')
  async getTemplateByUid(@Param('uid') uid: string): Promise<ScorecardTemplateResponseDto> {
    return this.templateService.getTemplateByUid(uid);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Post('templates')
  async createTemplate(@Body() dto: CreateScorecardTemplateDto): Promise<ScorecardTemplateResponseDto> {
    return this.templateService.createTemplate(dto);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Put('templates/:uid')
  async updateTemplate(
    @Param('uid') uid: string,
    @Body() dto: UpdateScorecardTemplateDto,
  ): Promise<ScorecardTemplateResponseDto> {
    return this.templateService.updateTemplate(uid, dto);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Delete('templates/:uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(@Param('uid') uid: string): Promise<void> {
    return this.templateService.deleteTemplate(uid);
  }

  // Scorecard submission endpoints
  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @Post('submit')
  async submitScorecard(@Body() dto: SubmitScorecardDto, @CurrentUser() user: User): Promise<ScorecardResponseDto> {
    return this.scorecardService.submitScorecard(dto, user.id);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('interview/:interviewUid')
  async getScorecardsByInterview(@Param('interviewUid') interviewUid: string): Promise<ScorecardResponseDto[]> {
    return this.scorecardService.getScorecardsByInterview(interviewUid);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN', 'USER'])
  @Get(':uid')
  async getScorecardByUid(@Param('uid') uid: string): Promise<ScorecardResponseDto> {
    return this.scorecardService.getScorecardByUid(uid);
  }

  @Auth(['HR', 'ADMIN', 'SUPER_ADMIN'])
  @Get('interview/:interviewUid/summary')
  async getInterviewSummary(@Param('interviewUid') interviewUid: string): Promise<ScorecardSummaryDto> {
    return this.scorecardService.getInterviewSummary(interviewUid);
  }
}
