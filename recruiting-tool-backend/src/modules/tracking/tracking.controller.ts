import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SkipAuth } from '../shared/modules/auth/decorators/skip-auth.decorator';
import { TrackingService } from './tracking.service';

// 1×1 transparent GIF pixel
const TRACKING_PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

@ApiTags('tracking')
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  /**
   * Email open tracking pixel.
   * Called anonymously by email clients when loading the pixel.
   * Returns a 1×1 transparent GIF.
   */
  @Get('open/:leadUid')
  @SkipAuth()
  @ApiOperation({ summary: 'Record email open and return 1x1 tracking pixel' })
  @ApiParam({ name: 'leadUid', type: String })
  async trackOpen(@Param('leadUid') leadUid: string, @Res() res: Response): Promise<void> {
    // Fire-and-forget — never fail the pixel response due to DB errors
    this.trackingService.recordOpen(leadUid).catch(() => undefined);

    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': TRACKING_PIXEL.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.end(TRACKING_PIXEL);
  }

  /**
   * Email click tracking redirect.
   * Called anonymously when the recipient clicks a tracked link.
   * Redirects to the original destination URL.
   */
  @Get('click/:leadUid')
  @SkipAuth()
  @ApiOperation({ summary: 'Record email link click and redirect to destination URL' })
  @ApiParam({ name: 'leadUid', type: String })
  @ApiQuery({ name: 'url', type: String, description: 'Destination URL to redirect to', required: true })
  async trackClick(@Param('leadUid') leadUid: string, @Query('url') url: string, @Res() res: Response): Promise<void> {
    // Validate URL before redirecting
    let destination = '/';
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        destination = url;
      }
    } catch {
      // Invalid URL — redirect to root
    }

    // Fire-and-forget
    if (destination !== '/') {
      this.trackingService.recordClick(leadUid).catch(() => undefined);
    }

    res.redirect(302, destination);
  }
}
