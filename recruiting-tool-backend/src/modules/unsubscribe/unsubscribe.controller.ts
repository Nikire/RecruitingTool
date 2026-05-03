import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipAuth } from '../shared/modules/auth/decorators/skip-auth.decorator';
import { UnsubscribeService } from './unsubscribe.service';

@ApiTags('unsubscribe')
@Controller('unsubscribe')
export class UnsubscribeController {
  constructor(private readonly service: UnsubscribeService) {}

  @Get(':token')
  @SkipAuth()
  @ApiOperation({ summary: 'Consume an unsubscribe token (public endpoint)' })
  @ApiParam({ name: 'token', description: 'Unsubscribe token from email link' })
  @ApiResponse({ status: 200, description: 'Token consumed, email unsubscribed' })
  async consumeToken(@Param('token') token: string): Promise<{ success: boolean; message: string }> {
    await this.service.consumeToken(token);
    return { success: true, message: "You've been unsubscribed successfully" };
  }
}
