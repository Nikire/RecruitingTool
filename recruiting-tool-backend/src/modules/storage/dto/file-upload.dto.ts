import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FileUploadResponseDto {
  uid: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  s3Key: string;
  uploadedByPublic: boolean;
  uploadedByUid?: string;
  candidateUid?: string;
  createdAt: Date;
  updatedAt: Date;
  downloadUrl?: string; // Optional signed URL for download
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
