import { PipeTransform, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FileValidator } from '../validators/file-validation';

export type FileValidationType = 'document' | 'image';

/**
 * Custom pipe for comprehensive file validation
 * Validates MIME type, file extension, magic numbers, and performs security checks
 */
@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly logger = new Logger(FileValidationPipe.name);

  constructor(private readonly validationType: FileValidationType) {}

  async transform(file: Express.Multer.File): Promise<Express.Multer.File> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(`Validating ${this.validationType} file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);

    // Perform validation based on type
    const validationResult = this.validationType === 'document' ? await FileValidator.validateDocument(file) : await FileValidator.validateImage(file);

    if (!validationResult.isValid) {
      this.logger.warn(`File validation failed for ${file.originalname}: ${validationResult.error}`);

      // Log security violations
      if (validationResult.error?.includes('does not match') || validationResult.error?.includes('Executable') || validationResult.error?.includes('Invalid characters')) {
        this.logger.error(`SECURITY VIOLATION: File upload blocked - ${file.originalname} - Reason: ${validationResult.error}`);
      }

      throw new BadRequestException(validationResult.error || 'File validation failed');
    }

    // Update original filename with sanitized version
    if (validationResult.sanitizedFilename) {
      file.originalname = validationResult.sanitizedFilename;
    }

    this.logger.log(`File validation successful: ${file.originalname}`);
    return file;
  }
}
