import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { StagesService } from './stages.service';
import { CreateStageDto, UpdateStageDto } from './dto/stages.dto';
import { Auth } from 'src/modules/shared/modules/auth/decorators/auth.decorator';

@Auth(['HR', 'ADMIN'])
@ApiBearerAuth()
@ApiTags('Stages')
@Controller('stages')
export class StagesController {
  constructor(private readonly stagesService: StagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stage' })
  @ApiBody({ type: CreateStageDto })
  create(@Body() createStageDto: CreateStageDto) {
    return this.stagesService.create(createStageDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create multiple stages for a hiring process' })
  @ApiBody({ type: Array<CreateStageDto> })
  bulkCreate(@Body() bulkCreateStagesDto: Array<CreateStageDto>) {
    return this.stagesService.bulkCreateStages(bulkCreateStagesDto);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a stage by UID' })
  @ApiParam({ name: 'uid', type: String, description: 'Stage UID' })
  findOne(@Param('uid') uid: string) {
    return this.stagesService.findOne(uid);
  }

  @Put(':uid')
  @ApiOperation({ summary: 'Update a stage' })
  @ApiParam({ name: 'uid', type: String, description: 'Stage UID' })
  @ApiBody({ type: UpdateStageDto })
  update(@Param('uid') uid: string, @Body() updateStageDto: UpdateStageDto) {
    return this.stagesService.update(uid, updateStageDto);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete a stage' })
  @ApiParam({ name: 'uid', type: String, description: 'Stage UID' })
  remove(@Param('uid') uid: string) {
    return this.stagesService.remove(uid);
  }
}
