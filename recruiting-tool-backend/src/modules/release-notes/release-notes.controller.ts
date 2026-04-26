import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { ReleaseNotesService } from './release-notes.service';
import { UnreadReleaseNotesResponseDto, MarkSeenResponseDto } from './dto/release-note.dto';
import { AuthGuard } from '../shared/modules/auth/guards/auth.guard';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';

@ApiTags('Release Notes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('release-notes')
export class ReleaseNotesController {
  constructor(private readonly releaseNotesService: ReleaseNotesService) {}

  @Get('unread')
  @ApiOperation({ summary: 'Get unread release notes for current user' })
  @ApiResponse({ status: 200, description: 'Returns unread release notes for the user tier', type: UnreadReleaseNotesResponseDto })
  getUnreadNotes(@CurrentUser() currentUser: User): Promise<UnreadReleaseNotesResponseDto> {
    return this.releaseNotesService.getUnreadNotes(currentUser.id);
  }

  @Post(':uid/mark-seen')
  @ApiOperation({ summary: 'Mark a release note as seen for current user' })
  @ApiResponse({ status: 201, description: 'Release note marked as seen', type: MarkSeenResponseDto })
  markSeen(@Param('uid') uid: string, @CurrentUser() currentUser: User): Promise<MarkSeenResponseDto> {
    return this.releaseNotesService.markSeen(uid, currentUser.id);
  }
}
