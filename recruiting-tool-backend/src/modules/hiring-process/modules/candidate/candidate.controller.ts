import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth } from 'src/modules/shared/modules/auth/decorators/auth.decorator';

@ApiTags('Candidate')
@ApiBearerAuth()
@Controller('candidate')
@ApiUnauthorizedResponse({
  description: "Unauthorized - Bearer is missing / is expired / you don't have enough permissions",
})
@ApiNotFoundResponse({ description: 'Candidate not found' })
@Auth(['HR', 'ADMIN'])
export class CandidateController {}
