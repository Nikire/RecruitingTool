import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DatabaseService } from 'src/modules/shared/modules/database/database.service';
import { CandidateImportRowDto, CandidateImportErrorDto, CandidateImportResultDto, CandidateImportPreviewDto } from './dto/candidate-import.dto';
import { ApplicationSource } from '@prisma/client';

@Injectable()
export class CandidateImportService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * Parse CSV file buffer and return array of objects
   */
  private async parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.trim().toLowerCase(),
            skipLines: 0,
          }),
        )
        .on('data', (row) => {
          // Trim all values
          const trimmedRow: any = {};
          Object.keys(row).forEach((key) => {
            trimmedRow[key] = typeof row[key] === 'string' ? row[key].trim() : row[key];
          });
          rows.push(trimmedRow);
        })
        .on('end', () => resolve(rows))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Validate a single row and return validation errors
   */
  private async validateRow(row: any, index: number): Promise<{ valid: boolean; errors: string[]; data?: CandidateImportRowDto }> {
    const errors: string[] = [];

    // Map CSV columns to DTO properties
    const candidateData = {
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || row.phonenumber || undefined,
      linkedin: row.linkedin || row.linkedinurl || undefined,
      notes: row.notes || row.sourcedetails || undefined,
    };

    // Check required fields
    if (!candidateData.name) {
      errors.push('Name is required');
    }
    if (!candidateData.email) {
      errors.push('Email is required');
    }

    // Create DTO instance and validate
    const dto = plainToInstance(CandidateImportRowDto, candidateData);
    const validationErrors = await validate(dto);

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        if (error.constraints) {
          Object.values(error.constraints).forEach((message) => {
            errors.push(message);
          });
        }
      });
    }

    // Validate email format manually if not empty
    if (candidateData.email && !candidateData.email.includes('@')) {
      errors.push('Invalid email format');
    }

    // Validate LinkedIn URL format if provided
    if (candidateData.linkedin && !candidateData.linkedin.startsWith('http')) {
      errors.push('LinkedIn URL must start with http or https');
    }

    // Validate phone format if provided (basic check)
    if (candidateData.phone && candidateData.phone.length < 7) {
      errors.push('Phone number is too short');
    }

    return {
      valid: errors.length === 0,
      errors,
      data: errors.length === 0 ? dto : undefined,
    };
  }

  /**
   * Preview import - validate without creating
   */
  async previewImport(buffer: Buffer): Promise<CandidateImportPreviewDto> {
    try {
      const rows = await this.parseCSV(buffer);

      if (rows.length === 0) {
        throw new BadRequestException('CSV file is empty or has no data rows');
      }

      const validRows: CandidateImportRowDto[] = [];
      const invalidRows: CandidateImportErrorDto[] = [];

      // Validate each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const validation = await this.validateRow(row, i);

        if (validation.valid && validation.data) {
          validRows.push(validation.data);
        } else {
          invalidRows.push({
            row: i + 2, // +2 because row 1 is header and array is 0-indexed
            name: row.name || undefined,
            email: row.email || undefined,
            errors: validation.errors,
          });
        }
      }

      return {
        validRows,
        invalidRows,
        totalRows: rows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to preview CSV: ${error.message}`);
    }
  }

  /**
   * Import candidates from CSV
   */
  async importCandidates(buffer: Buffer, companyId?: number): Promise<CandidateImportResultDto> {
    try {
      const rows = await this.parseCSV(buffer);

      if (rows.length === 0) {
        throw new BadRequestException('CSV file is empty or has no data rows');
      }

      const errors: CandidateImportErrorDto[] = [];
      const importedCandidates: string[] = [];
      let successCount = 0;

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const validation = await this.validateRow(row, i);

        if (!validation.valid || !validation.data) {
          errors.push({
            row: i + 2,
            name: row.name || undefined,
            email: row.email || undefined,
            errors: validation.errors,
          });
          continue;
        }

        try {
          // Check if candidate with this email already exists
          const existingCandidate = await this.databaseService.candidate.findUnique({
            where: { email: validation.data.email },
            include: {
              hiringProcesses: companyId
                ? {
                    where: { companyId },
                  }
                : true,
            },
          });

          if (existingCandidate && (!companyId || existingCandidate.hiringProcesses.length > 0)) {
            errors.push({
              row: i + 2,
              name: validation.data.name,
              email: validation.data.email,
              errors: [`Candidate with email ${validation.data.email} already exists`],
            });
            continue;
          }

          // Create candidate
          const candidate = await this.databaseService.candidate.create({
            data: {
              name: validation.data.name,
              email: validation.data.email,
              source: ApplicationSource.CSV_IMPORT,
              sourceDetails: validation.data.notes || 'Imported from CSV',
              sourceUrl: validation.data.linkedin,
            },
          });

          importedCandidates.push(candidate.uid);
          successCount++;
        } catch (error) {
          errors.push({
            row: i + 2,
            name: validation.data.name,
            email: validation.data.email,
            errors: [`Failed to create candidate: ${error.message}`],
          });
        }
      }

      return {
        totalRows: rows.length,
        successCount,
        errorCount: errors.length,
        errors,
        importedCandidates,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to import candidates: ${error.message}`);
    }
  }

  /**
   * Generate error CSV with failed rows
   */
  generateErrorCSV(errors: CandidateImportErrorDto[]): string {
    if (errors.length === 0) {
      return '';
    }

    const header = 'Row,Name,Email,Errors\n';
    const rows = errors
      .map((error) => {
        const errorMessages = error.errors.join('; ');
        return `${error.row},"${error.name || ''}","${error.email || ''}","${errorMessages}"`;
      })
      .join('\n');

    return header + rows;
  }

  /**
   * Generate template CSV for download
   */
  generateTemplateCSV(): string {
    const header = 'name,email,phone,linkedin,notes\n';
    const exampleRow = '"John Doe","john.doe@example.com","+1234567890","https://www.linkedin.com/in/johndoe","Referred by Jane Smith"\n';
    const exampleRow2 = '"Jane Smith","jane.smith@example.com","+0987654321","https://www.linkedin.com/in/janesmith","Applied through website"';

    return header + exampleRow + exampleRow2;
  }
}
