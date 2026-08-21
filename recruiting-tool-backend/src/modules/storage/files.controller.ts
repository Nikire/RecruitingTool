import { Body, Controller, Delete, Get, HttpCode, Post, Param, Query, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { CompanyStorageResponseDto, DeleteManyFilesDto, DownloadZipDto, FileUploadResponseDto, FileListQueryDto, FileViewUrlResponseDto } from './dto/file-upload.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileValidationPipe } from './pipes/file-validation.pipe';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload-resume-public')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a resume file (Public - No auth required)',
    description: 'Upload a resume file for job application (PDF, DOC, DOCX). Max size: 10MB. No authentication required.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Resume file (PDF, DOC, DOCX) - Max 10MB',
        },
      },
    },
  })
  async uploadResumePublic(
    @UploadedFile(new FileValidationPipe('document'))
    file: Express.Multer.File,
  ): Promise<FileUploadResponseDto> {
    // For public uploads, use a system identifier since there's no logged-in user
    return this.filesService.uploadFile(file, 'public-applicant');
  }

  @Post('upload')
  @Auth([RolesType.USER])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload a document file',
    description: 'Upload a document file (PDF, DOC, DOCX, TXT). Max size: 10MB. File type validation includes MIME type, extension, and magic number verification.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file (PDF, DOC, DOCX, TXT) - Max 10MB',
        },
        candidateUid: {
          type: 'string',
          description: 'Optional candidate UID to associate the file with',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile(new FileValidationPipe('document'))
    file: Express.Multer.File,
    @CurrentUser() currentUser: any,
    @Query('candidateUid') candidateUid?: string,
  ): Promise<FileUploadResponseDto> {
    return this.filesService.uploadFile(file, currentUser.uid, candidateUid);
  }

  @Post('upload-image')
  @Auth([RolesType.USER])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload an image file (for profile pictures, etc.)',
    description: 'Upload an image file (JPG, PNG, GIF, WebP). Max size: 2MB. File type validation includes MIME type, extension, and magic number verification.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, GIF, WebP) - Max 2MB',
        },
      },
    },
  })
  async uploadImage(
    @UploadedFile(new FileValidationPipe('image'))
    file: Express.Multer.File,
    @CurrentUser() currentUser: any,
  ): Promise<FileUploadResponseDto> {
    return this.filesService.uploadFile(file, currentUser.uid);
  }

  @Post('download-zip')
  @Auth([RolesType.USER])
  @HttpCode(200)
  @ApiOperation({ summary: 'Download selected files as a ZIP archive' })
  async downloadZip(@Body() dto: DownloadZipDto, @CurrentUser() currentUser: any, @Res() res: Response): Promise<void> {
    return this.filesService.downloadZip(dto.uids, currentUser.company.id, res);
  }

  // NOTE: Static GET routes MUST come before `:uid` parameterized routes to avoid conflicts
  @Get('company')
  @Auth([RolesType.USER])
  @ApiOperation({ summary: "Get all files belonging to the current user's company" })
  async getCompanyFiles(@CurrentUser() currentUser: any): Promise<FileUploadResponseDto[]> {
    return this.filesService.getCompanyFiles(currentUser.company.id);
  }

  @Get('company/storage')
  @Auth([RolesType.USER])
  @ApiOperation({ summary: 'Get storage usage for the current company' })
  async getCompanyStorageUsage(@CurrentUser() currentUser: any): Promise<CompanyStorageResponseDto> {
    return this.filesService.getCompanyStorageUsage(currentUser.company.id);
  }

  @Get()
  @Auth([RolesType.USER])
  @ApiOperation({ summary: "Get files visible to the current user's company, optionally filtered by candidate" })
  async getFiles(@Query() query: FileListQueryDto, @CurrentUser() currentUser: any): Promise<FileUploadResponseDto[]> {
    return this.filesService.getFiles(currentUser, query.candidateUid);
  }

  @Get(':uid')
  @Auth([RolesType.USER])
  @ApiOperation({ summary: 'Get file metadata by UID (company-scoped)' })
  async getFile(@Param('uid') uid: string, @CurrentUser() currentUser: any): Promise<FileUploadResponseDto> {
    return this.filesService.getFileByUid(uid, currentUser);
  }

  /**
   * PUBLIC ASSETS ONLY.
   *
   * This route is intentionally unauthenticated because avatars and other
   * decorative images are rendered with a bare <img src>, which cannot carry an
   * Authorization header. FilesService.getPublicViewableFile() enforces that only
   * images with no candidate / application / submission link are served here;
   * every private document returns 404. Private files are viewed via
   * GET :uid/view-url instead.
   */
  @Get(':uid/view')
  @ApiOperation({
    summary: 'View a public asset (avatars and other unattached images) - no auth required',
    description: 'Serves ONLY publicly viewable images. Private documents (resumes, cover letters, candidate attachments) return 404 here; use GET /files/:uid/view-url instead.',
  })
  async viewFile(@Param('uid') uid: string, @Res() res: Response): Promise<void> {
    const { stream, filename, mimetype } = await this.filesService.getPublicViewableFile(uid);

    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    // Safe: this route can only ever serve public assets.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    stream.pipe(res);
  }

  @Get(':uid/view-url')
  @Auth([RolesType.USER])
  @ApiOperation({
    summary: 'Get a short-lived presigned URL to view a private file inline',
    description: "Requires authentication AND that the file belongs to the caller's company. The URL expires in 5 minutes and is served directly by object storage.",
  })
  async getViewUrl(@Param('uid') uid: string, @CurrentUser() currentUser: any, @Res({ passthrough: true }) res: Response): Promise<FileViewUrlResponseDto> {
    res.setHeader('Cache-Control', 'private, no-store');
    return this.filesService.getViewUrl(uid, currentUser);
  }

  @Get(':uid/download')
  @Auth([RolesType.USER])
  @ApiOperation({ summary: "Download a file (must belong to the caller's company)" })
  async downloadFile(@Param('uid') uid: string, @CurrentUser() currentUser: any, @Res() res: Response): Promise<void> {
    const { stream, filename, mimetype } = await this.filesService.downloadFile(uid, currentUser);

    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Never let a shared proxy retain candidate personal data.
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Pragma', 'no-cache');

    stream.pipe(res);
  }

  @Delete('bulk')
  @Auth([RolesType.USER])
  @ApiOperation({ summary: 'Delete multiple files (must belong to company)' })
  async deleteManyFiles(@Body() dto: DeleteManyFilesDto, @CurrentUser() currentUser: any): Promise<{ deleted: number }> {
    return this.filesService.deleteManyFiles(dto.uids, currentUser.company.id);
  }

  @Delete(':uid')
  @Auth([RolesType.ADMIN])
  @ApiOperation({ summary: "Delete a file (must belong to the caller's company; platform admins may delete any)" })
  async deleteFile(@Param('uid') uid: string, @CurrentUser() currentUser: any): Promise<{ message: string }> {
    await this.filesService.deleteFile(uid, currentUser);
    return { message: 'File deleted successfully' };
  }
}
