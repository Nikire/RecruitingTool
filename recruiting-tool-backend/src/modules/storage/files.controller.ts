import {
	Controller,
	Post,
	Get,
	Delete,
	Param,
	Query,
	UploadedFile,
	UseInterceptors,
	Res,
	HttpStatus,
	ParseFilePipe,
	MaxFileSizeValidator,
	FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FilesService } from './files.service';
import { FileUploadResponseDto, FileListQueryDto } from './dto/file-upload.dto';
import { Auth } from '../shared/modules/auth/decorators/auth.decorator';
import { RolesType } from '@prisma/client';
import { CurrentUser } from '../shared/modules/auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('upload')
	@Auth([RolesType.USER])
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Upload a document file' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
				candidateUid: {
					type: 'string',
					description: 'Optional candidate UID to associate the file with',
				},
			},
		},
	})
	async uploadFile(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB max
					new FileTypeValidator({ fileType: /(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|plain)/ }), // PDF, DOC, DOCX, TXT
				],
			}),
		)
		file: Express.Multer.File,
		@CurrentUser() currentUser: any,
		@Query('candidateUid') candidateUid?: string,
	): Promise<FileUploadResponseDto> {
		return this.filesService.uploadFile(file, currentUser.uid, candidateUid);
	}

	@Post('upload-image')
	@Auth([RolesType.USER])
	@UseInterceptors(FileInterceptor('file'))
	@ApiOperation({ summary: 'Upload an image file (for profile pictures, etc.)' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
					description: 'Image file (JPG, PNG, GIF, WebP)',
				},
			},
		},
	})
	async uploadImage(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }), // 2MB max for images
					new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/i }), // Only images
				],
			}),
		)
		file: Express.Multer.File,
		@CurrentUser() currentUser: any,
	): Promise<FileUploadResponseDto> {
		return this.filesService.uploadFile(file, currentUser.uid);
	}

	@Get()
	@Auth([RolesType.USER])
	@ApiOperation({ summary: 'Get all files, optionally filtered by candidate' })
	async getFiles(@Query() query: FileListQueryDto): Promise<FileUploadResponseDto[]> {
		return this.filesService.getFiles(query.candidateUid);
	}

	@Get(':uid')
	@Auth([RolesType.USER])
	@ApiOperation({ summary: 'Get file metadata by UID' })
	async getFile(@Param('uid') uid: string): Promise<FileUploadResponseDto> {
		return this.filesService.getFileByUid(uid);
	}

	@Get(':uid/view')
	@ApiOperation({ summary: 'View a file (e.g., display images) - No auth required for public access' })
	async viewFile(@Param('uid') uid: string, @Res() res: Response): Promise<void> {
		const { stream, filename, mimetype } = await this.filesService.downloadFile(uid);

		res.setHeader('Content-Type', mimetype);
		res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
		res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

		stream.pipe(res);
	}

	@Get(':uid/download')
	@Auth([RolesType.USER])
	@ApiOperation({ summary: 'Download a file' })
	async downloadFile(@Param('uid') uid: string, @Res() res: Response): Promise<void> {
		const { stream, filename, mimetype } = await this.filesService.downloadFile(uid);

		res.setHeader('Content-Type', mimetype);
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

		stream.pipe(res);
	}

	@Delete(':uid')
	@Auth([RolesType.ADMIN])
	@ApiOperation({ summary: 'Delete a file' })
	async deleteFile(@Param('uid') uid: string): Promise<{ message: string }> {
		await this.filesService.deleteFile(uid);
		return { message: 'File deleted successfully' };
	}
}
