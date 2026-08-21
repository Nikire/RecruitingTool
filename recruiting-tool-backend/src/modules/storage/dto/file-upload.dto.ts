import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FileUploadResponseDto {
  uid: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  s3Key: string;
  hash?: string; // SHA-256 hash for deduplication
  uploadedByPublic: boolean;
  uploadedByUid?: string;
  uploadedByName?: string;
  candidateUid?: string;
  candidateName?: string;
  createdAt: Date;
  updatedAt: Date;
  downloadUrl?: string; // Optional signed URL for download
}

export class DownloadZipDto {
  @IsArray()
  @IsString({ each: true })
  uids: string[];
}

export class DeleteManyFilesDto {
  @IsArray()
  @IsString({ each: true })
  uids: string[];
}

export class FileViewUrlResponseDto {
  /** UID of the file the URL points at */
  uid: string;
  /** Short-lived presigned URL served straight from object storage */
  url: string;
  /** Lifetime of the URL in seconds */
  expiresIn: number;
  originalName: string;
  mimetype: string;
}

export class CompanyStorageResponseDto {
  usedMB: number;
  limitMB: number;
  percentage: number;
}

export class UploadFileDto {
  @IsNotEmpty()
  file: Express.Multer.File;

  @IsOptional()
  @IsString()
  candidateUid?: string;
}

export class FileListQueryDto {
  @IsOptional()
  @IsString()
  candidateUid?: string;
}
