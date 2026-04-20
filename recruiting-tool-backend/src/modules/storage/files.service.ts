import { Injectable, HttpException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { StorageService } from './storage.service';
import { CompanyStorageResponseDto, FileUploadResponseDto } from './dto/file-upload.dto';
import { randomUUID } from 'crypto';
import { EntityNotFoundException } from 'src/common/exceptions';
import { FileValidator } from './validators/file-validation';
import { QuotaService } from '../quota/quota.service';
import * as archiver from 'archiver';
import { Response } from 'express';
import { SubscriptionPlan } from '@prisma/client';
import { PLAN_LIMITS } from '../quota/config/plan-limits.config';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly storageService: StorageService,
    private readonly quotaService: QuotaService,
  ) {}

  /**
   * Upload a file and store metadata in database
   * NOTE: File validation should be done via FileValidationPipe before this method
   */
  async uploadFile(file: Express.Multer.File, userUid: string, candidateUid?: string): Promise<FileUploadResponseDto> {
    try {
      // Sanitize filename for additional security
      const sanitizedOriginalName = FileValidator.sanitizeFilename(file.originalname);

      this.logger.log(`Uploading file: ${sanitizedOriginalName} (sanitized from: ${file.originalname}) for user ${userUid}`);

      // Calculate file hash for deduplication
      const fileHash = this.storageService.calculateFileHash(file.buffer);
      this.logger.log(`File hash calculated: ${fileHash}`);

      // Check if file with same hash already exists
      const existingFile = await this.database.fileUpload.findFirst({
        where: { hash: fileHash },
      });

      if (existingFile) {
        this.logger.log(`Duplicate file detected (hash: ${fileHash}). Returning existing file: ${existingFile.uid}`);

        // Return existing file record instead of uploading again
        // This saves storage space and upload time
        return this.mapToDto(existingFile);
      }

      // Generate unique S3 key to prevent overwrites and collisions
      const uniqueFilename = `${randomUUID()}-${sanitizedOriginalName}`;

      // Upload to S3/MinIO with validated content type
      const s3Key = await this.storageService.uploadFile(file.buffer, uniqueFilename, file.mimetype);

      // Get user ID from UID (null for public uploads)
      let userId: number | undefined;
      const isPublicUpload = userUid === 'public-applicant';

      if (!isPublicUpload) {
        const user = await this.database.user.findUnique({
          where: { uid: userUid },
        });
        if (!user) {
          throw new EntityNotFoundException('User', userUid);
        }
        userId = user.id;

        // Check storage quota for authenticated users
        if (user.companyId) {
          await this.quotaService.checkStorageQuota(user.companyId, file.size);
        }
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

      // Save metadata to database with hash
      const fileUpload = await this.database.fileUpload.create({
        data: {
          filename: uniqueFilename,
          originalName: sanitizedOriginalName, // Store sanitized filename
          mimetype: file.mimetype,
          size: file.size,
          s3Key,
          hash: fileHash, // Store hash for deduplication
          uploadedByPublic: isPublicUpload, // Track if uploaded by public user
          uploadedById: userId, // null for public uploads
          candidateId,
        },
      });

      this.logger.log(`File uploaded successfully: ${fileUpload.uid} - ${sanitizedOriginalName} (${file.size} bytes, hash: ${fileHash})`);

      return this.mapToDto(fileUpload);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
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
      throw new InternalServerErrorException(`Failed to get files: ${error.message}`);
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
      throw new InternalServerErrorException(`Failed to get file: ${error.message}`);
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
      throw new InternalServerErrorException(`Failed to download file: ${error.message}`);
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
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get all files belonging to a company (HR-uploaded or candidate-linked)
   */
  async getCompanyFiles(companyId: number): Promise<FileUploadResponseDto[]> {
    try {
      const files = await this.database.fileUpload.findMany({
        where: {
          OR: [
            { uploadedBy: { companyId } },
            {
              candidate: {
                hiringProcesses: {
                  some: { jobPosition: { companyId } },
                },
              },
            },
          ],
        },
        include: {
          uploadedBy: { select: { uid: true, name: true } },
          candidate: { select: { uid: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return Promise.all(files.map((file) => this.mapCompanyFileToDto(file)));
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get company files: ${error.message}`);
    }
  }

  /**
   * Get company storage usage and limit
   */
  async getCompanyStorageUsage(companyId: number): Promise<CompanyStorageResponseDto> {
    try {
      const company = await this.database.company.findUnique({
        where: { id: companyId },
        include: { subscription: true },
      });

      const plan = (company?.subscription?.plan as SubscriptionPlan) || SubscriptionPlan.FREE;
      const limits = PLAN_LIMITS[plan];
      const limitMB = limits.maxStorageMB;

      const usedMB = await this.quotaService.getStorageUsageMB(companyId);
      const percentage = limitMB === -1 ? 0 : Math.min(100, (usedMB / limitMB) * 100);

      return { usedMB, limitMB, percentage };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get storage usage: ${error.message}`);
    }
  }

  /**
   * Stream a ZIP archive of the specified files to the HTTP response
   */
  async downloadZip(uids: string[], companyId: number, res: Response): Promise<void> {
    try {
      // Fetch files and verify they belong to this company
      const files = await this.database.fileUpload.findMany({
        where: {
          uid: { in: uids },
          OR: [
            { uploadedBy: { companyId } },
            {
              candidate: {
                hiringProcesses: {
                  some: { jobPosition: { companyId } },
                },
              },
            },
          ],
        },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="files.zip"');

      const archive = archiver.default('zip', { zlib: { level: 6 } });
      archive.pipe(res);

      for (const file of files) {
        const buffer = await this.storageService.downloadFileAsBuffer(file.s3Key);
        archive.append(buffer, { name: file.originalName });
      }

      await archive.finalize();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to generate ZIP: ${error.message}`);
    }
  }

  /**
   * Delete multiple files (verify they belong to the company first)
   */
  async deleteManyFiles(uids: string[], companyId: number): Promise<{ deleted: number }> {
    try {
      const files = await this.database.fileUpload.findMany({
        where: {
          uid: { in: uids },
          OR: [
            { uploadedBy: { companyId } },
            {
              candidate: {
                hiringProcesses: {
                  some: { jobPosition: { companyId } },
                },
              },
            },
          ],
        },
      });

      let deleted = 0;
      for (const file of files) {
        await this.storageService.deleteFile(file.s3Key);
        await this.database.fileUpload.delete({ where: { uid: file.uid } });
        deleted++;
      }

      return { deleted };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete files: ${error.message}`);
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
      hash: file.hash, // Include hash in response
      uploadedByPublic: file.uploadedByPublic,
      uploadedByUid,
      candidateUid,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      downloadUrl,
    };
  }

  /**
   * Map company file entity (with pre-included relations) to DTO
   */
  private async mapCompanyFileToDto(file: any): Promise<FileUploadResponseDto> {
    const downloadUrl = await this.storageService.getSignedUrl(file.s3Key);

    return {
      uid: file.uid,
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      s3Key: file.s3Key,
      hash: file.hash,
      uploadedByPublic: file.uploadedByPublic,
      uploadedByUid: file.uploadedBy?.uid,
      uploadedByName: file.uploadedBy?.name,
      candidateUid: file.candidate?.uid,
      candidateName: file.candidate?.name,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
      downloadUrl,
    };
  }
}
