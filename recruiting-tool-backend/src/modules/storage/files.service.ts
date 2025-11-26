import { Injectable, NotFoundException, HttpException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { StorageService } from './storage.service';
import { FileUploadResponseDto } from './dto/file-upload.dto';
import { randomUUID } from 'crypto';
import { EntityNotFoundException } from 'src/common/exceptions';
import { FileValidator } from './validators/file-validation';

@Injectable()
export class FilesService {
	private readonly logger = new Logger(FilesService.name);

	constructor(
		private readonly database: DatabaseService,
		private readonly storageService: StorageService,
	) {}

	/**
	 * Upload a file and store metadata in database
	 * NOTE: File validation should be done via FileValidationPipe before this method
	 */
	async uploadFile(
		file: Express.Multer.File,
		userUid: string,
		candidateUid?: string,
	): Promise<FileUploadResponseDto> {
		try {
		// Sanitize filename for additional security
		const sanitizedOriginalName = FileValidator.sanitizeFilename(file.originalname);

		// Generate unique S3 key to prevent overwrites and collisions
		const uniqueFilename = `${randomUUID()}-${sanitizedOriginalName}`;

		this.logger.log(
			`Uploading file: ${sanitizedOriginalName} (sanitized from: ${file.originalname}) for user ${userUid}`,
		);

		// Upload to S3/MinIO with validated content type
		const s3Key = await this.storageService.uploadFile(file.buffer, uniqueFilename, file.mimetype);

		// Get user ID from UID
		const user = await this.database.user.findUnique({
			where: { uid: userUid },
		});
		if (!user) {
			throw new EntityNotFoundException('User', userUid);
		}

		// Get candidate ID if provided
		let candidateId: number | undefined;
		if (candidateUid) {
			const candidate = await this.database.candidate.findUnique({
				where: { uid: candidateUid },
			});
			if (!candidate) {
				throw new EntityNotFoundException('Candidate', candidateUid);
			}
			candidateId = candidate.id;
		}

		// Save metadata to database with sanitized filename
		const fileUpload = await this.database.fileUpload.create({
			data: {
				filename: uniqueFilename,
				originalName: sanitizedOriginalName, // Store sanitized filename
				mimetype: file.mimetype,
				size: file.size,
				s3Key,
				uploadedById: user.id,
				candidateId,
			},
		});

		this.logger.log(
			`File uploaded successfully: ${fileUpload.uid} - ${sanitizedOriginalName} (${file.size} bytes)`,
		);

		return this.mapToDto(fileUpload);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to upload file: ${error.message}`,
			);
		}
	}

	/**
	 * Get all files, optionally filtered by candidate
	 */
	async getFiles(candidateUid?: string): Promise<FileUploadResponseDto[]> {
		try {
		let candidateId: number | undefined;

		if (candidateUid) {
			const candidate = await this.database.candidate.findUnique({
				where: { uid: candidateUid },
			});
			if (!candidate) {
				throw new EntityNotFoundException('Candidate', candidateUid);
			}
			candidateId = candidate.id;
		}

		const files = await this.database.fileUpload.findMany({
			where: candidateId ? { candidateId } : undefined,
			orderBy: { createdAt: 'desc' },
		});

		return Promise.all(files.map((file) => this.mapToDto(file)));
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to get files: ${error.message}`,
			);
		}
	}

	/**
	 * Get a single file by UID
	 */
	async getFileByUid(uid: string): Promise<FileUploadResponseDto> {
		try {
		const file = await this.database.fileUpload.findUnique({
			where: { uid },
		});

		if (!file) {
			throw new EntityNotFoundException('File', uid);
		}

		return this.mapToDto(file);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to get file: ${error.message}`,
			);
		}
	}

	/**
	 * Download a file (returns stream)
	 */
	async downloadFile(uid: string) {
		try {
		const file = await this.database.fileUpload.findUnique({
			where: { uid },
		});

		if (!file) {
			throw new EntityNotFoundException('File', uid);
		}

		const stream = await this.storageService.downloadFile(file.s3Key);

		return {
			stream,
			filename: file.originalName,
			mimetype: file.mimetype,
		};
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to download file: ${error.message}`,
			);
		}
	}

	/**
	 * Delete a file
	 */
	async deleteFile(uid: string): Promise<void> {
		try {
		const file = await this.database.fileUpload.findUnique({
			where: { uid },
		});

		if (!file) {
			throw new EntityNotFoundException('File', uid);
		}

		// Delete from S3/MinIO
		await this.storageService.deleteFile(file.s3Key);

		// Delete from database
		await this.database.fileUpload.delete({
			where: { uid },
		});
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to delete file: ${error.message}`,
			);
		}
	}

	/**
	 * Map database entity to DTO with signed URL
	 */
	private async mapToDto(file: any): Promise<FileUploadResponseDto> {
		const downloadUrl = await this.storageService.getSignedUrl(file.s3Key);

		// Get UIDs for uploaded user and candidate
		let uploadedByUid: string | undefined;
		let candidateUid: string | undefined;

		if (file.uploadedById) {
			const user = await this.database.user.findUnique({
				where: { id: file.uploadedById },
				select: { uid: true },
			});
			uploadedByUid = user?.uid;
		}

		if (file.candidateId) {
			const candidate = await this.database.candidate.findUnique({
				where: { id: file.candidateId },
				select: { uid: true },
			});
			candidateUid = candidate?.uid;
		}

		return {
			uid: file.uid,
			filename: file.filename,
			originalName: file.originalName,
			mimetype: file.mimetype,
			size: file.size,
			s3Key: file.s3Key,
			uploadedByUid,
			candidateUid,
			createdAt: file.createdAt,
			updatedAt: file.updatedAt,
			downloadUrl,
		};
	}
}
