import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicEndpoint: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT || 'http://minio:9000';
    const region = process.env.S3_REGION || 'us-east-1';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || 'minioadmin';
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || 'minioadmin';
    this.bucketName = process.env.S3_BUCKET_NAME || 'recruiting-tool-files';
    // Public endpoint for signed URLs (accessible from browser)
    this.publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:9000';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // Required for MinIO
    });

    this.logger.log(`Storage service initialized with endpoint: ${endpoint}`);
    this.ensureBucketExists();
  }

  /**
   * Ensure the S3 bucket exists, create it if it doesn't
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`Bucket "${this.bucketName}" exists`);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        this.logger.log(`Bucket "${this.bucketName}" not found, creating...`);
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucketName }));
          this.logger.log(`Bucket "${this.bucketName}" created successfully`);
        } catch (createError) {
          this.logger.error(`Failed to create bucket: ${createError.message}`);
        }
      } else {
        this.logger.error(`Error checking bucket: ${error.message}`);
      }
    }
  }

  /**
   * Upload a file to S3/MinIO
   * @param file - File buffer
   * @param filename - Unique filename (e.g., with UUID prefix)
   * @param mimetype - MIME type of the file
   * @returns S3 key of the uploaded file
   */
  async uploadFile(file: Buffer, filename: string, mimetype: string): Promise<string> {
    const key = `uploads/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimetype,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File uploaded successfully: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Download a file from S3/MinIO
   * @param key - S3 key of the file
   * @returns Readable stream of the file
   */
  async downloadFile(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      this.logger.log(`File retrieved successfully: ${key}`);
      return response.Body as Readable;
    } catch (error) {
      this.logger.error(`Error downloading file: ${error.message}`);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3/MinIO
   * @param key - S3 key of the file
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get a signed URL for temporary file access
   * @param key - S3 key of the file
   * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });

      // Replace internal endpoint with public endpoint for browser access
      const internalEndpoint = process.env.S3_ENDPOINT || 'http://minio:9000';
      const publicUrl = url.replace(internalEndpoint, this.publicEndpoint);

      this.logger.log(`Generated signed URL for: ${key}`);
      return publicUrl;
    } catch (error) {
      this.logger.error(`Error generating signed URL: ${error.message}`);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Check storage connection health
   * Used by health check endpoints to verify MinIO/S3 connectivity
   * @returns Promise<boolean> - true if connection is healthy
   * @throws Error if connection check fails
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Test MinIO connection by checking if bucket exists
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log('Storage health check: OK');
      return true;
    } catch (error) {
      this.logger.error(`Storage health check failed: ${error.message}`);
      throw new Error(`Storage connection failed: ${error.message}`);
    }
  }
}
