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
import { Prisma, RolesType, SubscriptionPlan } from '@prisma/client';
import { PLAN_LIMITS } from '../quota/config/plan-limits.config';

/**
 * Minimal shape of the authenticated principal required to authorize file access.
 * Populated by AuthGuard as `request.currentUser` (a User row with `company` included).
 */
export interface FileAccessActor {
  id?: number;
  companyId?: number | null;
  company?: { id: number } | null;
  roles?: RolesType[];
}

/** Roles that operate the platform itself and may reach any tenant's files. */
const PLATFORM_ADMIN_ROLES: RolesType[] = [RolesType.SUPER_ADMIN, RolesType.ADMIN];

/** Short lifetime for presigned in-app view URLs (seconds). */
export const VIEW_URL_TTL_SECONDS = 300;

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly storageService: StorageService,
    private readonly quotaService: QuotaService,
  ) {}

  // ---------------------------------------------------------------------------
  // Authorization
  // ---------------------------------------------------------------------------

  private isPlatformAdmin(actor?: FileAccessActor): boolean {
    return (actor?.roles ?? []).some((role) => PLATFORM_ADMIN_ROLES.includes(role));
  }

  private resolveCompanyId(actor?: FileAccessActor): number | null {
    return actor?.company?.id ?? actor?.companyId ?? null;
  }

  /**
   * A FileUpload row has no direct companyId column. Tenancy is derived from the
   * entities that reference it:
   *  - the uploading user's company
   *  - the candidate it is attached to (via that candidate's hiring processes)
   *  - the application it is the resume of (public applicants upload with no user)
   *  - the async-stage submission it belongs to
   */
  private companyScopeFilter(companyId: number): Prisma.FileUploadWhereInput {
    return {
      OR: [
        { uploadedBy: { companyId } },
        {
          candidate: {
            hiringProcesses: {
              some: { jobPosition: { companyId } },
            },
          },
        },
        { applicationResumes: { some: { jobPosition: { companyId } } } },
        {
          submissionFiles: {
            some: { submission: { hiringProcess: { jobPosition: { companyId } } } },
          },
        },
      ],
    };
  }

  /**
   * Build the WHERE clause an actor is allowed to read.
   * Role level alone is NEVER sufficient - the company must match.
   */
  private accessScopeFilter(actor?: FileAccessActor): Prisma.FileUploadWhereInput | null {
    if (this.isPlatformAdmin(actor)) {
      return {};
    }

    const companyId = this.resolveCompanyId(actor);
    const scopes: Prisma.FileUploadWhereInput[] = [];

    if (companyId) {
      scopes.push(this.companyScopeFilter(companyId));
    }

    // A user can always reach a file they uploaded themselves (e.g. applicants
    // with no company who uploaded their own resume).
    if (actor?.id) {
      scopes.push({ uploadedById: actor.id });
    }

    if (scopes.length === 0) {
      return null;
    }

    return scopes.length === 1 ? scopes[0] : { OR: scopes };
  }

  /**
   * Resolve a file the actor is entitled to read, or throw 404.
   * 404 (not 403) is deliberate: it does not confirm that the UID exists.
   */
  async assertFileAccess(uid: string, actor?: FileAccessActor) {
    const scope = this.accessScopeFilter(actor);

    if (!scope) {
      this.logger.warn(`Denied file access to ${uid}: actor has no company and no uploads`);
      throw new EntityNotFoundException('File', uid);
    }

    const file = await this.database.fileUpload.findFirst({
      where: { AND: [{ uid }, scope] },
    });

    if (!file) {
      this.logger.warn(`Denied file access to ${uid} for company ${this.resolveCompanyId(actor) ?? 'none'}`);
      throw new EntityNotFoundException('File', uid);
    }

    return file;
  }

  /**
   * Resolve a file that is safe to serve WITHOUT authentication.
   *
   * Only genuinely public assets qualify: images that are not attached to a
   * candidate, an application resume or an async-stage submission (i.e. avatars
   * and other decorative artwork). Every document - resume, cover letter,
   * candidate attachment - is private by construction and throws 404 here.
   */
  async getPublicViewableFile(uid: string) {
    const file = await this.database.fileUpload.findUnique({
      where: { uid },
      include: {
        applicationResumes: { select: { id: true }, take: 1 },
        submissionFiles: { select: { id: true }, take: 1 },
      },
    });

    if (!file) {
      throw new EntityNotFoundException('File', uid);
    }

    const isImage = (file.mimetype || '').toLowerCase().startsWith('image/');
    const isUnattached = file.candidateId === null && file.applicationResumes.length === 0 && file.submissionFiles.length === 0;

    if (!isImage || !isUnattached) {
      this.logger.warn(`Blocked unauthenticated view of private file ${uid} (${file.mimetype})`);
      throw new EntityNotFoundException('File', uid);
    }

    const stream = await this.storageService.downloadFile(file.s3Key);

    return { stream, filename: file.originalName, mimetype: file.mimetype };
  }

  /**
   * Short-lived presigned URL for in-app viewing of a PRIVATE file.
   * Bytes are served straight from MinIO (via the public storage endpoint), so
   * Nest never proxies megabytes of resume traffic.
   */
  async getViewUrl(uid: string, actor?: FileAccessActor) {
    const file = await this.assertFileAccess(uid, actor);

    const url = await this.storageService.getSignedUrl(file.s3Key, VIEW_URL_TTL_SECONDS, {
      contentDisposition: `inline; filename="${file.originalName}"`,
      contentType: file.mimetype,
    });

    return {
      uid: file.uid,
      url,
      expiresIn: VIEW_URL_TTL_SECONDS,
      originalName: file.originalName,
      mimetype: file.mimetype,
    };
  }

  /**
   * Upload a file and store metadata in database
   * NOTE: File validation should be done via FileValidationPipe before this method
   */
  async uploadFile(file: Express.Multer.File, userUid: string, candidateUid?: string): Promise<FileUploadResponseDto> {
    try {
      // Sanitize filename for additional security
      const sanitizedOriginalName = FileValidator.sanitizeFilename(file.originalname);

      this.logger.log(`Uploading file: ${sanitizedOriginalName} (sanitized from: ${file.originalname}) for user ${userUid}`);

      // Resolve the uploader BEFORE touching storage, so the quota is enforced
      // before bytes are written and so deduplication can be tenant-scoped.
      let userId: number | undefined;
      let uploaderCompanyId: number | null = null;
      const isPublicUpload = userUid === 'public-applicant';

      if (!isPublicUpload) {
        const user = await this.database.user.findUnique({
          where: { uid: userUid },
        });
        if (!user) {
          throw new EntityNotFoundException('User', userUid);
        }
        userId = user.id;
        uploaderCompanyId = user.companyId ?? null;

        // Check storage quota for authenticated users
        if (uploaderCompanyId) {
          await this.quotaService.checkStorageQuota(uploaderCompanyId, file.size);
        }
      }

      // Calculate file hash for deduplication
      const fileHash = this.storageService.calculateFileHash(file.buffer);
      this.logger.log(`File hash calculated: ${fileHash}`);

      // Deduplication must NEVER cross a tenant boundary: returning another
      // company's FileUpload row would hand the uploader that row's UID and a
      // presigned download URL for a document they never had access to.
      // Public (unauthenticated) uploads are never deduplicated for the same reason.
      const dedupeScope: Prisma.FileUploadWhereInput | null = uploaderCompanyId ? this.companyScopeFilter(uploaderCompanyId) : userId ? { uploadedById: userId } : null;

      if (dedupeScope) {
        const existingFile = await this.database.fileUpload.findFirst({
          where: { AND: [{ hash: fileHash }, dedupeScope] },
        });

        if (existingFile) {
          this.logger.log(`Duplicate file detected (hash: ${fileHash}). Returning existing file: ${existingFile.uid}`);

          // Return existing file record instead of uploading again
          // This saves storage space and upload time
          return this.mapToDto(existingFile);
        }
      }

      // Generate unique S3 key to prevent overwrites and collisions
      const uniqueFilename = `${randomUUID()}-${sanitizedOriginalName}`;

      // Upload to S3/MinIO with validated content type
      const s3Key = await this.storageService.uploadFile(file.buffer, uniqueFilename, file.mimetype);

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
  async getFiles(actor: FileAccessActor, candidateUid?: string): Promise<FileUploadResponseDto[]> {
    try {
      const scope = this.accessScopeFilter(actor);
      if (!scope) {
        return [];
      }

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
        where: { AND: [candidateId ? { candidateId } : {}, scope] },
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
  async getFileByUid(uid: string, actor?: FileAccessActor): Promise<FileUploadResponseDto> {
    try {
      const file = await this.assertFileAccess(uid, actor);

      return this.mapToDto(file);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to get file: ${error.message}`);
    }
  }

  /**
   * Download a file (returns stream).
   * Requires an authenticated actor whose company owns the file.
   */
  async downloadFile(uid: string, actor?: FileAccessActor) {
    try {
      const file = await this.assertFileAccess(uid, actor);

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
  async deleteFile(uid: string, actor?: FileAccessActor): Promise<void> {
    try {
      const file = await this.assertFileAccess(uid, actor);

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
        where: this.companyScopeFilter(companyId),
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
        where: { AND: [{ uid: { in: uids } }, this.companyScopeFilter(companyId)] },
      });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="files.zip"');
      res.setHeader('Cache-Control', 'private, no-store');

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
        where: { AND: [{ uid: { in: uids } }, this.companyScopeFilter(companyId)] },
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
