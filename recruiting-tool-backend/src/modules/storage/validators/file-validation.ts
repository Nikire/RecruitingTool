import { Logger } from '@nestjs/common';
import * as FileType from 'file-type';

/**
 * Allowed document MIME types and their extensions
 */
export const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
} as const;

/**
 * Allowed image MIME types and their extensions
 */
export const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
} as const;

/**
 * File magic numbers (file signatures) for validation
 * These are the first bytes of the file that identify its type
 */
export const FILE_SIGNATURES = {
  // PDF: %PDF
  pdf: [0x25, 0x50, 0x44, 0x46],
  // PNG: �PNG
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  // JPEG: ÿØÿ
  jpg: [0xff, 0xd8, 0xff],
  // GIF: GIF87a or GIF89a
  gif87: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
  gif89: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  // ZIP (used by DOCX): PK
  zip: [0x50, 0x4b, 0x03, 0x04],
  // DOC: Ðϟà
  doc: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
} as const;

/**
 * Maximum file sizes in bytes
 */
export const MAX_FILE_SIZES = {
  document: 10 * 1024 * 1024, // 10MB
  image: 2 * 1024 * 1024, // 2MB
} as const;

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  detectedType?: string;
  sanitizedFilename?: string;
}

/**
 * Validates file type by checking MIME type, extension, and magic numbers
 */
export class FileValidator {
  private static readonly logger = new Logger(FileValidator.name);

  /**
   * Validate document file (PDF, DOC, DOCX, TXT)
   */
  static async validateDocument(file: Express.Multer.File): Promise<FileValidationResult> {
    return this.validateFile(file, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZES.document);
  }

  /**
   * Validate image file (JPG, PNG, GIF, WebP)
   */
  static async validateImage(file: Express.Multer.File): Promise<FileValidationResult> {
    return this.validateFile(file, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZES.image);
  }

  /**
   * Core file validation logic
   */
  private static async validateFile(file: Express.Multer.File, allowedTypes: Record<string, readonly string[]>, maxSize: number): Promise<FileValidationResult> {
    try {
      // 1. Check if file exists
      if (!file || !file.buffer) {
        return { isValid: false, error: 'No file provided' };
      }

      // 2. Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        return {
          isValid: false,
          error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
        };
      }

      // 3. Validate MIME type
      const mimeType = file.mimetype.toLowerCase();
      if (!Object.keys(allowedTypes).includes(mimeType)) {
        return {
          isValid: false,
          error: `Invalid file type. Allowed types: ${Object.keys(allowedTypes).join(', ')}`,
        };
      }

      // 4. Validate file extension
      const extension = this.getFileExtension(file.originalname).toLowerCase();
      const allowedExtensions = allowedTypes[mimeType];
      if (!allowedExtensions.includes(extension)) {
        return {
          isValid: false,
          error: `File extension "${extension}" does not match MIME type "${mimeType}"`,
        };
      }

      // 5. Validate magic numbers (file signature)
      const magicNumberValid = await this.validateMagicNumbers(file.buffer, mimeType);
      if (!magicNumberValid.isValid) {
        this.logger.warn(`Magic number validation failed for file: ${file.originalname} (MIME: ${mimeType})`);
        return {
          isValid: false,
          error: magicNumberValid.error || 'File content does not match declared type',
          detectedType: magicNumberValid.detectedType,
        };
      }

      // 6. Sanitize filename
      const sanitizedFilename = this.sanitizeFilename(file.originalname);

      // 7. Additional security checks
      const securityCheck = this.performSecurityChecks(file);
      if (!securityCheck.isValid) {
        return securityCheck;
      }

      this.logger.log(`File validation successful: ${file.originalname} (${mimeType}, ${file.size} bytes)`);

      return {
        isValid: true,
        sanitizedFilename,
      };
    } catch (error) {
      this.logger.error(`File validation error: ${error.message}`, error.stack);
      return {
        isValid: false,
        error: `File validation failed: ${error.message}`,
      };
    }
  }

  /**
   * Validate file magic numbers (file signature) against declared MIME type
   */
  private static async validateMagicNumbers(buffer: Buffer, declaredMimeType: string): Promise<FileValidationResult> {
    try {
      // Use file-type library for robust magic number detection
      const detectedType = await FileType.fromBuffer(buffer);

      // Handle text files (no magic number)
      if (declaredMimeType === 'text/plain') {
        // Text files don't have magic numbers, check if it's readable text
        const isText = this.isTextFile(buffer);
        if (!isText) {
          return {
            isValid: false,
            error: 'File declared as text but contains non-text content',
          };
        }
        return { isValid: true };
      }

      // For binary files, validate detected type matches declared type
      if (!detectedType) {
        // Special case: Old DOC files might not be detected by file-type
        if (declaredMimeType === 'application/msword') {
          const hasDocSignature = this.checkSignature(buffer, FILE_SIGNATURES.doc);
          if (hasDocSignature) {
            return { isValid: true };
          }
        }

        return {
          isValid: false,
          error: 'Unable to detect file type from content',
        };
      }

      // Map detected MIME type to expected MIME type
      const detectedMime = detectedType.mime;

      // Handle DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)
      // DOCX files are ZIP archives, so file-type detects them as application/zip
      if (declaredMimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && detectedMime === 'application/zip') {
        // Further validate it's actually a DOCX by checking for specific content
        const isDocx = await this.validateDocxContent(buffer);
        if (isDocx) {
          return { isValid: true };
        }
        return {
          isValid: false,
          error: 'File is a ZIP archive but not a valid DOCX document',
          detectedType: detectedMime,
        };
      }

      // Direct MIME type match
      if (detectedMime === declaredMimeType) {
        return { isValid: true };
      }

      // JPEG can be image/jpeg (image/jpg is not a standard MIME type but we accept it)
      if (declaredMimeType === 'image/jpeg' && detectedMime === 'image/jpeg') {
        return { isValid: true };
      }

      return {
        isValid: false,
        error: `File content type "${detectedMime}" does not match declared type "${declaredMimeType}"`,
        detectedType: detectedMime,
      };
    } catch (error) {
      this.logger.error(`Magic number validation error: ${error.message}`);
      return {
        isValid: false,
        error: 'Failed to validate file signature',
      };
    }
  }

  /**
   * Check if buffer starts with specific signature
   */
  private static checkSignature(buffer: Buffer, signature: readonly number[]): boolean {
    if (buffer.length < signature.length) {
      return false;
    }
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if file is valid text
   */
  private static isTextFile(buffer: Buffer): boolean {
    // Check first 1KB of file
    const sampleSize = Math.min(buffer.length, 1024);
    const sample = buffer.slice(0, sampleSize);

    // Count non-printable characters
    let nonPrintableCount = 0;
    for (let i = 0; i < sample.length; i++) {
      const byte = sample[i];
      // Allow common text characters: printable ASCII, newline, tab, carriage return
      if (
        !(
          (byte >= 32 && byte <= 126) || // Printable ASCII
          byte === 9 || // Tab
          byte === 10 || // Line feed
          byte === 13 || // Carriage return
          byte >= 128
        ) // UTF-8 characters
      ) {
        nonPrintableCount++;
      }
    }

    // If more than 5% non-printable, probably not a text file
    const nonPrintableRatio = nonPrintableCount / sample.length;
    return nonPrintableRatio < 0.05;
  }

  /**
   * Validate DOCX content structure
   */
  private static async validateDocxContent(buffer: Buffer): Promise<boolean> {
    try {
      // DOCX files are ZIP archives with specific structure
      // They must contain [Content_Types].xml and word/document.xml
      // For now, we'll just check it's a valid ZIP with PK signature
      const hasZipSignature = this.checkSignature(buffer, FILE_SIGNATURES.zip);
      if (!hasZipSignature) {
        return false;
      }

      // Additional check: DOCX files typically have "word/" or "xl/" in content
      // This is a basic heuristic
      const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1000));
      return content.includes('word/') || content.includes('[Content_Types]');
    } catch {
      return false;
    }
  }

  /**
   * Sanitize filename to prevent security issues
   */
  static sanitizeFilename(filename: string): string {
    // Remove path traversal characters
    let sanitized = filename.replace(/\.\./g, '');

    // Remove or replace dangerous characters
    sanitized = sanitized
      .replace(/[<>:"|?*]/g, '') // Windows illegal characters
      .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Control characters
      .replace(/^\.+/, '') // Leading dots
      .replace(/\.+$/, '') // Trailing dots
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^\w\s.-]/g, ''); // Keep only alphanumeric, spaces, dots, dashes

    // Limit filename length
    const maxLength = 255;
    if (sanitized.length > maxLength) {
      const extension = this.getFileExtension(sanitized);
      const nameWithoutExt = sanitized.substring(0, sanitized.length - extension.length);
      sanitized = nameWithoutExt.substring(0, maxLength - extension.length) + extension;
    }

    // Ensure filename is not empty
    if (!sanitized || sanitized === '') {
      sanitized = 'untitled';
    }

    return sanitized;
  }

  /**
   * Get file extension
   */
  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot >= 0 ? filename.substring(lastDot) : '';
  }

  /**
   * Perform additional security checks
   */
  private static performSecurityChecks(file: Express.Multer.File): FileValidationResult {
    // Check for suspicious filenames
    const suspiciousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.com$/i, /\.scr$/i, /\.vbs$/i, /\.js$/i, /\.jar$/i, /\.sh$/i, /\.php$/i, /\.asp$/i, /\.aspx$/i, /\.jsp$/i];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(file.originalname)) {
        this.logger.warn(`Suspicious file extension detected: ${file.originalname} (blocked executable type)`);
        return {
          isValid: false,
          error: 'Executable files are not allowed',
        };
      }
    }

    // Check for null bytes in filename (potential security issue)
    if (file.originalname.includes('\0')) {
      this.logger.warn(`Null byte detected in filename: ${file.originalname}`);
      return {
        isValid: false,
        error: 'Invalid characters in filename',
      };
    }

    // Check for extremely long filenames (potential DoS)
    if (file.originalname.length > 255) {
      return {
        isValid: false,
        error: 'Filename is too long (max 255 characters)',
      };
    }

    return { isValid: true };
  }
}
