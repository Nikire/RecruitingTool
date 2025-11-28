export class FileUploadEntity {
  id: number;
  uid: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  s3Key: string;
  uploadedById: number;
  candidateId?: number;
  createdAt: Date;
  updatedAt: Date;
}
