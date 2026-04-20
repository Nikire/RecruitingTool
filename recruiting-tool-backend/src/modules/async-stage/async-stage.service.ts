import { Injectable, Logger, NotFoundException, UnauthorizedException, ConflictException, BadRequestException, GoneException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { DatabaseService } from '../shared/modules/database/database.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { QuotaService } from '../quota/quota.service';
import {
  SendAsyncInvitationDto,
  ReviewSubmissionDto,
  AsyncStageTokenResponseDto,
  AsyncStageSubmissionResponseDto,
  AsyncStageStatusResponseDto,
  AsyncSubmissionFileResponseDto,
  PublicAsyncStageInfoDto,
} from './dto/async-stage.dto';

@Injectable()
export class AsyncStageService {
  private readonly logger = new Logger(AsyncStageService.name);

  constructor(
    private readonly prisma: DatabaseService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly quotaService: QuotaService,
  ) {}

  // ─── Protected Methods (HR Endpoints) ────────────────────────────────────────

  /**
   * Send an async stage invitation to a candidate.
   * Revokes any existing non-used token for the same stage+hiringProcess,
   * generates a new secure token, and returns the submission URL.
   */
  async sendInvitation(dto: SendAsyncInvitationDto, createdById: number): Promise<AsyncStageTokenResponseDto> {
    // Find stage by uid, including relations
    const stage = await this.prisma.stage.findUnique({
      where: { uid: dto.stageUid },
      include: {
        JobPosition: {
          include: { company: true },
        },
      },
    });

    if (!stage) {
      throw new NotFoundException(`Stage with uid ${dto.stageUid} not found`);
    }

    // Find hiring process by uid, including candidate info
    const hiringProcess = await this.prisma.hiringProcess.findUnique({
      where: { uid: dto.hiringProcessUid },
      include: { candidate: true },
    });

    if (!hiringProcess) {
      throw new NotFoundException(`Hiring process with uid ${dto.hiringProcessUid} not found`);
    }

    // Invalidate any existing non-used, non-revoked token for this stage+hiringProcess
    await this.prisma.asyncStageToken.updateMany({
      where: {
        stageId: stage.id,
        hiringProcessId: hiringProcess.id,
        usedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    // Generate secure token
    const token = randomBytes(32).toString('hex');

    // Parse deadline if provided
    let expiresAt: Date | undefined;
    if (dto.deadline) {
      expiresAt = new Date(dto.deadline);
    }

    // Create new token
    const createdToken = await this.prisma.asyncStageToken.create({
      data: {
        token,
        stageId: stage.id,
        hiringProcessId: hiringProcess.id,
        candidateEmail: hiringProcess.candidate.email,
        candidateName: hiringProcess.candidate.name,
        expiresAt: expiresAt ?? null,
        createdById,
      },
    });

    this.logger.log(`Async stage invitation created for candidate ${hiringProcess.candidate.email}, stage ${dto.stageUid}`);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const submissionUrl = `${frontendUrl}/submit/${token}`;

    // Fetch HR user name for the signature
    const hrUser = await this.prisma.user.findUnique({ where: { id: createdById } });

    // Format deadline if present
    let formattedDeadline: string | undefined;
    if (expiresAt) {
      formattedDeadline = expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Send invitation email to candidate (fire-and-forget — do not block the response)
    this.emailService
      .sendAsyncStageInvitation(hiringProcess.candidate.email, {
        candidateName: hiringProcess.candidate.name,
        jobTitle: stage.JobPosition?.title ?? '',
        companyName: stage.JobPosition?.company.name ?? '',
        stageName: stage.title,
        stageDescription: stage.description ?? undefined,
        submissionUrl,
        deadline: formattedDeadline,
        hrName: hrUser?.name ?? undefined,
      })
      .catch((err) => this.logger.error(`Failed to send async stage invitation email: ${err.message}`));

    return this.mapTokenToDto(createdToken, stage.uid, hiringProcess.uid, submissionUrl);
  }

  /**
   * Get the current async stage status for a given stage+hiringProcess.
   * Returns the latest non-revoked token and its associated submission (if any).
   */
  async getStageStatus(stageUid: string, hiringProcessUid: string): Promise<AsyncStageStatusResponseDto> {
    const stage = await this.prisma.stage.findUnique({ where: { uid: stageUid } });
    if (!stage) throw new NotFoundException(`Stage ${stageUid} not found`);

    const hiringProcess = await this.prisma.hiringProcess.findUnique({ where: { uid: hiringProcessUid } });
    if (!hiringProcess) throw new NotFoundException(`Hiring process ${hiringProcessUid} not found`);

    const tokenRecord = await this.prisma.asyncStageToken.findFirst({
      where: {
        stageId: stage.id,
        hiringProcessId: hiringProcess.id,
        revokedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      return { token: null, submission: null };
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const submissionUrl = `${frontendUrl}/submit/${tokenRecord.token}`;
    const tokenDto = this.mapTokenToDto(tokenRecord, stageUid, hiringProcessUid, submissionUrl);

    // Find submission for this token
    const submission = await this.prisma.asyncStageSubmission.findUnique({
      where: { tokenId: tokenRecord.id },
      include: {
        files: {
          include: { fileUpload: true },
          orderBy: { position: 'asc' },
        },
        reviewedBy: true,
      },
    });

    if (!submission) {
      return { token: tokenDto, submission: null };
    }

    const submissionDto = await this.mapSubmissionToDto(submission, stageUid, hiringProcessUid);

    return { token: tokenDto, submission: submissionDto };
  }

  /**
   * Get a single submission by uid, including files with signed download URLs.
   */
  async getSubmission(submissionUid: string): Promise<AsyncStageSubmissionResponseDto> {
    const submission = await this.prisma.asyncStageSubmission.findUnique({
      where: { uid: submissionUid },
      include: {
        files: {
          include: { fileUpload: true },
          orderBy: { position: 'asc' },
        },
        reviewedBy: true,
        stage: true,
        hiringProcess: true,
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission ${submissionUid} not found`);
    }

    return this.mapSubmissionToDto(submission, submission.stage.uid, submission.hiringProcess.uid);
  }

  /**
   * Mark a submission as reviewed and optionally add an HR note.
   */
  async reviewSubmission(submissionUid: string, dto: ReviewSubmissionDto, reviewedById: number): Promise<AsyncStageSubmissionResponseDto> {
    const existing = await this.prisma.asyncStageSubmission.findUnique({
      where: { uid: submissionUid },
      include: { stage: true, hiringProcess: true },
    });

    if (!existing) {
      throw new NotFoundException(`Submission ${submissionUid} not found`);
    }

    const updated = await this.prisma.asyncStageSubmission.update({
      where: { uid: submissionUid },
      data: {
        reviewedAt: new Date(),
        reviewedById,
        hrNote: dto.hrNote ?? null,
      },
      include: {
        files: {
          include: { fileUpload: true },
          orderBy: { position: 'asc' },
        },
        reviewedBy: true,
        stage: true,
        hiringProcess: true,
      },
    });

    return this.mapSubmissionToDto(updated, updated.stage.uid, updated.hiringProcess.uid);
  }

  /**
   * Revoke an async stage token by uid.
   */
  async revokeToken(tokenUid: string): Promise<{ message: string }> {
    const token = await this.prisma.asyncStageToken.findUnique({ where: { uid: tokenUid } });

    if (!token) {
      throw new NotFoundException(`Token ${tokenUid} not found`);
    }

    await this.prisma.asyncStageToken.update({
      where: { uid: tokenUid },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`Token ${tokenUid} revoked`);

    return { message: 'Token revoked successfully' };
  }

  // ─── Public Methods ───────────────────────────────────────────────────────────

  /**
   * Validate an async stage token and return stage info for the public submission page.
   * Throws 401 if token not found or revoked, 410 if expired.
   */
  async validateToken(token: string): Promise<PublicAsyncStageInfoDto> {
    const tokenRecord = await this.prisma.asyncStageToken.findUnique({
      where: { token },
      include: {
        stage: {
          include: {
            JobPosition: {
              include: { company: true },
            },
          },
        },
        hiringProcess: true,
      },
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new UnauthorizedException('Invalid or revoked submission link');
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      throw new GoneException('This submission link has expired');
    }

    return {
      stageTitle: tokenRecord.stage.title,
      stageDescription: tokenRecord.stage.description ?? null,
      jobTitle: tokenRecord.stage.JobPosition?.title ?? '',
      companyName: tokenRecord.stage.JobPosition?.company.name ?? '',
      expiresAt: tokenRecord.expiresAt?.toISOString() ?? null,
      alreadySubmitted: tokenRecord.usedAt !== null,
    };
  }

  /**
   * Submit async stage content (text and/or files) using a public token.
   */
  async submitStage(token: string, textContent: string | undefined, files: Express.Multer.File[]): Promise<{ message: string }> {
    const tokenRecord = await this.prisma.asyncStageToken.findUnique({
      where: { token },
      include: {
        stage: {
          include: {
            JobPosition: true,
          },
        },
        hiringProcess: {
          include: { candidate: true },
        },
      },
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new UnauthorizedException('Invalid or revoked submission link');
    }

    if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
      throw new GoneException('This submission link has expired');
    }

    if (tokenRecord.usedAt) {
      throw new ConflictException('This submission link has already been used');
    }

    if (!textContent && (!files || files.length === 0)) {
      throw new BadRequestException('Submission must include text content or at least one file');
    }

    // Check storage quota before uploading (uses company from the stage's job position)
    if (files && files.length > 0) {
      const companyId = tokenRecord.stage.JobPosition?.companyId;
      if (companyId) {
        const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
        await this.quotaService.checkStorageQuota(companyId, totalBytes);
      }
    }

    // Upload files to MinIO and create FileUpload records
    const uploadedFiles: Array<{ fileUploadId: number; position: number }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const s3Key = `submissions/${tokenRecord.hiringProcess.uid}/${tokenRecord.stage.uid}/${Date.now()}-${sanitizedName}`;

      try {
        // Upload directly using the S3 key (not the uploadFile wrapper which adds a prefix)
        await this.storageService.uploadFileWithKey(file.buffer, s3Key, file.mimetype);
      } catch (err) {
        this.logger.error(`Failed to upload file ${file.originalname}`, err);
        throw new BadRequestException(`Failed to upload file: ${file.originalname}`);
      }

      const fileUploadRecord = await this.prisma.fileUpload.create({
        data: {
          filename: `${Date.now()}-${sanitizedName}`,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          s3Key,
          hash: this.storageService.calculateFileHash(file.buffer),
          uploadedByPublic: false,
          uploadedById: tokenRecord.createdById,
          candidateId: null,
        },
      });

      uploadedFiles.push({ fileUploadId: fileUploadRecord.id, position: i });
    }

    // Create submission
    const submission = await this.prisma.asyncStageSubmission.create({
      data: {
        tokenId: tokenRecord.id,
        stageId: tokenRecord.stageId,
        hiringProcessId: tokenRecord.hiringProcessId,
        textContent: textContent ?? null,
        submittedAt: new Date(),
        files: {
          create: uploadedFiles.map((f) => ({
            fileUploadId: f.fileUploadId,
            position: f.position,
          })),
        },
      },
    });

    // Mark token as used
    await this.prisma.asyncStageToken.update({
      where: { id: tokenRecord.id },
      data: { usedAt: new Date() },
    });

    this.logger.log(`Async stage submission created: ${submission.uid} for token ${token}`);

    // Send HR notification email (fire-and-forget)
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const hiringProcessUrl = `${frontendUrl}/hiring-process/${tokenRecord.hiringProcess.uid}`;
    const submittedAtFormatted = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (tokenRecord.createdById) {
      this.prisma.user
        .findUnique({ where: { id: tokenRecord.createdById } })
        .then((hrUser) => {
          if (!hrUser) return;
          return this.emailService.sendAsyncStageSubmissionReceived(hrUser.email, {
            hrName: hrUser.name,
            candidateName: tokenRecord.hiringProcess.candidate.name,
            candidateEmail: tokenRecord.hiringProcess.candidate.email,
            jobTitle: tokenRecord.stage.JobPosition?.title ?? '',
            stageName: tokenRecord.stage.title,
            submittedAt: submittedAtFormatted,
            fileCount: files.length,
            hasTextContent: !!textContent,
            hiringProcessUrl,
          });
        })
        .catch((err) => this.logger.error(`Failed to send async stage submission notification: ${err.message}`));
    }

    return { message: 'Submission received successfully' };
  }

  /**
   * Get a signed download URL for a submission file using a public token.
   * Token must exist and not be revoked (expired/used tokens still allow file downloads).
   */
  async getPublicFileDownload(token: string, fileUid: string): Promise<string> {
    const tokenRecord = await this.prisma.asyncStageToken.findUnique({
      where: { token },
      include: { submission: true },
    });

    if (!tokenRecord || tokenRecord.revokedAt) {
      throw new UnauthorizedException('Invalid or revoked submission link');
    }

    if (!tokenRecord.submission) {
      throw new NotFoundException('No submission found for this token');
    }

    // Find the file and verify it belongs to this token's submission
    const submissionFile = await this.prisma.asyncStageSubmissionFile.findFirst({
      where: {
        uid: fileUid,
        submissionId: tokenRecord.submission.id,
      },
      include: { fileUpload: true },
    });

    if (!submissionFile) {
      throw new NotFoundException(`File ${fileUid} not found in this submission`);
    }

    return this.storageService.getSignedUrl(submissionFile.fileUpload.s3Key);
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  private mapTokenToDto(
    token: {
      uid: string;
      candidateEmail: string;
      candidateName: string;
      expiresAt: Date | null;
      usedAt: Date | null;
      revokedAt: Date | null;
      createdAt: Date;
    },
    stageUid: string,
    hiringProcessUid: string,
    submissionUrl: string,
  ): AsyncStageTokenResponseDto {
    return {
      uid: token.uid,
      stageUid,
      hiringProcessUid,
      candidateEmail: token.candidateEmail,
      candidateName: token.candidateName,
      expiresAt: token.expiresAt?.toISOString() ?? null,
      usedAt: token.usedAt?.toISOString() ?? null,
      revokedAt: token.revokedAt?.toISOString() ?? null,
      createdAt: token.createdAt.toISOString(),
      submissionUrl,
    };
  }

  private async mapSubmissionToDto(
    submission: {
      uid: string;
      textContent: string | null;
      submittedAt: Date;
      reviewedAt: Date | null;
      hrNote: string | null;
      reviewedBy: { name: string } | null;
      files: Array<{
        uid: string;
        position: number;
        fileUpload: {
          originalName: string;
          size: number;
          mimetype: string;
          s3Key: string;
        };
      }>;
    },
    stageUid: string,
    hiringProcessUid: string,
  ): Promise<AsyncStageSubmissionResponseDto> {
    const files: AsyncSubmissionFileResponseDto[] = await Promise.all(
      submission.files.map(async (sf) => {
        const downloadUrl = await this.storageService.getSignedUrl(sf.fileUpload.s3Key);
        return {
          uid: sf.uid,
          originalName: sf.fileUpload.originalName,
          size: sf.fileUpload.size,
          mimetype: sf.fileUpload.mimetype,
          downloadUrl,
        };
      }),
    );

    const reviewedByName = submission.reviewedBy ? submission.reviewedBy.name : null;

    return {
      uid: submission.uid,
      stageUid,
      hiringProcessUid,
      textContent: submission.textContent,
      submittedAt: submission.submittedAt.toISOString(),
      reviewedAt: submission.reviewedAt?.toISOString() ?? null,
      reviewedByName,
      hrNote: submission.hrNote,
      files,
    };
  }
}
