import { ApiProperty } from '@nestjs/swagger';

export class ReleaseNoteUserItemDto {
  @ApiProperty({ description: 'UID of the release note' })
  uid: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiProperty({ description: 'Body / content (markdown)' })
  body: string;

  @ApiProperty({ description: 'Version string', nullable: true })
  version: string | null;

  @ApiProperty({ description: 'Target subscription tier' })
  targetTier: string;

  @ApiProperty({ description: 'Published timestamp', nullable: true })
  publishedAt: Date | null;
}

export class UnreadReleaseNotesResponseDto {
  @ApiProperty({ type: [ReleaseNoteUserItemDto] })
  notes: ReleaseNoteUserItemDto[];
}

export class MarkSeenResponseDto {
  @ApiProperty({ description: 'Operation success flag' })
  ok: boolean;
}
