import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { StorageService } from './storage.service';
import { FileUploadResponseDto } from './dto/file-upload.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class FilesService {
	constructor(
		private readonly database: DatabaseService,
		private readonly storageService: StorageService,
	) {}

	/**
	 * Upload a file and store metadata in database
	 */
	async uploadFile(
		file: Express.Multer.File,
		userUid: string,
		candidateUid?: string,
	): Promise<FileUploadResponseDto> {
		// Generate unique filename
		const uniqueFilename = `${randomUUID()}-${file.originalname}`;

		// Upload to S3/MinIO
		const s3Key = await this.storageService.uploadFile(file.buffer, uniqueFilename, file.mimetype);

		// Get user ID from UID
		const user = await this.database.user.findUnique({
			where: { uid: userUid },
		});
		if (!user) {
			throw new NotFoundException(`User with UID ${userUid} not found`);
		}

		// Get candidate ID if provided
		let candidateId: number | undefined;
		if (candidateUid) {
			const candidate = await this.database.candidate.findUnique({
				where: { uid: candidateUid },
			});
			if (!candidate) {
				throw new NotFoundException(`Candidate with UID ${candidateUid} not found`);
			}
			candidateId = candidate.id;
		}

		// Save metadata to database
		const fileUpload = await this.database.fileUpload.create({
			data: {
				filename: uniqueFilename,
				originalName: file.originalname,
				mimetype: file.mimetype,
				size: file.size,
				s3Key,
				uploadedById: user.id,
				candidateId,
			},
		});

		return this.mapToDto(fileUpload);
	}

	/**
	 * Get all files, optionally filtered by candidate
	 */
	async getFiles(candidateUid?: string): Promise<FileUploadResponseDto[]> {
		let candidateId: number | undefined;

		if (candidateUid) {
			const candidate = await this.database.candidate.findUnique({
				where: { uid: candidateUid },
			});
			if (!candidate) {
				throw new NotFoundException(`Candidate with UID ${candidateUid} not found`);
			}
			candidateId = candidate.id;
		}

		const files = await this.database.fileUpload.findMany({
			where: candidateId ? { candidateId } : undefined,
			orderBy: { createdAt: 'desc' },
		});

		return Promise.all(files.map((file) => this.mapToDto(file)));
	}

	/**
	 * Get a single file by UID
	 */
	async getFileByUid(uid: string): Promise<FileUploadResponseDto> {
		const file = await this.database.fileUpload.findUnique({
			where: { uid },
		});

		if (!file) {
			throw new NotFoundException(`File with UID ${uid} not found`);
		}

		return this.mapToDto(file);
	}

	/**
	 * Download a file (returns stream)
	 */
	async downloadFile(uid: string) {
		const file = await this.database.fileUpload.findUnique({
			where: { uid },
		});

		if (!file) {
			throw new NotFoundException(`File with UID ${uid} not found`);
		}

		const stream = await this.storageService.downloadFile(file.s3Key);

		return {
			stream,
			filename: file.originalName,
			mimetype: file.mimetype,
		};
	}

	/**
	 * Delete a file
	 */
	async deleteFile(uid: string): Promise<void> {
		const file = await this.database.fileUpload.findUnique({
			where: { uid },
		});

		if (!file) {
			throw new NotFoundException(`File with UID ${uid} not found`);
		}

		// Delete from S3/MinIO
		await this.storageService.deleteFile(file.s3Key);

		// Delete from database
		await this.database.fileUpload.delete({
			where: { uid },
		});
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
