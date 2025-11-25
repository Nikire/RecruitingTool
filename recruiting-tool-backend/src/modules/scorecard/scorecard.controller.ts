import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesType } from '@prisma/client';
import { ScorecardTemplateService } from './scorecard-template.service';
import { ScorecardService } from './scorecard.service';
import {
  CreateScorecardTemplateDto,
  UpdateScorecardTemplateDto,
  SubmitScorecardDto,
  ScorecardTemplateResponseDto,
  ScorecardResponseDto,
} from './dto/scorecard.dto';

@Controller('scorecard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScorecardController {
  constructor(
    private readonly templateService: ScorecardTemplateService,
    private readonly scorecardService: ScorecardService,
  ) {}

  // Template endpoints
  @Get('templates')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
  async getTemplates(@Query('companyUid') companyUid?: string): Promise<ScorecardTemplateResponseDto[]> {
    return this.templateService.getTemplates(companyUid);
  }

  @Get('templates/:uid')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.USER)
  async getTemplateByUid(@Param('uid') uid: string): Promise<ScorecardTemplateResponseDto> {
    return this.templateService.getTemplateByUid(uid);
  }

  @Post('templates')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
  async createTemplate(@Body() dto: CreateScorecardTemplateDto): Promise<ScorecardTemplateResponseDto> {
    return this.templateService.createTemplate(dto);
  }

  @Put('templates/:uid')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
  async updateTemplate(
    @Param('uid') uid: string,
    @Body() dto: UpdateScorecardTemplateDto,
  ): Promise<ScorecardTemplateResponseDto> {
    return this.templateService.updateTemplate(uid, dto);
  }

  @Delete('templates/:uid')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(@Param('uid') uid: string): Promise<void> {
    return this.templateService.deleteTemplate(uid);
  }

  // Scorecard submission endpoints
  @Post('submit')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.USER)
  async submitScorecard(@Body() dto: SubmitScorecardDto, @Req() req: any): Promise<ScorecardResponseDto> {
    return this.scorecardService.submitScorecard(dto, req.user.id);
  }

  @Get('interview/:interviewUid')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN)
  async getScorecardsByInterview(@Param('interviewUid') interviewUid: string): Promise<ScorecardResponseDto[]> {
    return this.scorecardService.getScorecardsByInterview(interviewUid);
  }

  @Get(':uid')
  @Roles(RolesType.HR, RolesType.ADMIN, RolesType.SUPER_ADMIN, RolesType.USER)
  async getScorecardByUid(@Param('uid') uid: string): Promise<ScorecardResponseDto> {
    return this.scorecardService.getScorecardByUid(uid);
  }
}
