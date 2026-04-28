import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesType } from '@prisma/client';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { ProspectTrackingService } from './prospect-tracking.service';
import { CreateProspectCompanyDto, UpdateProspectCompanyDto, CreateOutreachContactDto, CreateOutreachActivityDto, ProspectListQueryDto } from './dto/prospect-tracking.dto';

@ApiTags('prospect-tracking')
@ApiBearerAuth()
@Auth([RolesType.ADMIN, RolesType.SUPER_ADMIN])
@Controller('prospect-tracking')
export class ProspectTrackingController {
  constructor(private readonly service: ProspectTrackingService) {}

  @Get()
  findAll(@Query() query: ProspectListQueryDto, @Query('tag') tag?: string, @Query('featured') featured?: string) {
    return this.service.findAll({ ...query, tag, featured });
  }

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.service.findOne(uid);
  }

  @Post()
  create(@Body() dto: CreateProspectCompanyDto, @CurrentUser('id') userId: number) {
    return this.service.create(dto, userId);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() dto: UpdateProspectCompanyDto, @CurrentUser('id') userId: number) {
    return this.service.update(uid, dto, userId);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uid') uid: string) {
    return this.service.remove(uid);
  }

  @Post(':uid/contacts')
  addContact(@Param('uid') uid: string, @Body() dto: CreateOutreachContactDto) {
    return this.service.addContact(uid, dto);
  }

  @Delete(':uid/contacts/:contactUid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeContact(@Param('uid') uid: string, @Param('contactUid') contactUid: string) {
    return this.service.removeContact(uid, contactUid);
  }

  @Post(':uid/activities')
  addActivity(@Param('uid') uid: string, @Body() dto: CreateOutreachActivityDto, @CurrentUser('id') userId: number) {
    return this.service.addActivity(uid, dto, userId);
  }
}
