import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../shared/modules/database/database.service';
import { StorageService } from '../storage/storage.service';
import { ExportRequestDto, ExportEntity, ExportFormat, ExportFiltersDto } from './dto/export-request.dto';
import { ExportResponseDto } from './dto/export-response.dto';
import { ExportTemplatesResponseDto, ExportTemplateDto } from './dto/export-templates.dto';
import { stringify } from 'csv-stringify/sync';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Get available export templates with column definitions
   */
  async getTemplates(): Promise<ExportTemplatesResponseDto> {
    const templates: ExportTemplateDto[] = [
      {
        entity: ExportEntity.CANDIDATES,
        columns: [
          { key: 'uid', label: 'UID', type: 'string' },
          { key: 'name', label: 'Name', type: 'string' },
          { key: 'email', label: 'Email', type: 'string' },
          { key: 'source', label: 'Source', type: 'string' },
          { key: 'sourceDetails', label: 'Source Details', type: 'string' },
          { key: 'createdAt', label: 'Created At', type: 'date' },
        ],
      },
      {
        entity: ExportEntity.COMPANIES,
        columns: [
          { key: 'uid', label: 'UID', type: 'string' },
          { key: 'name', label: 'Company Name', type: 'string' },
          { key: 'description', label: 'Description', type: 'string' },
          { key: 'createdAt', label: 'Created At', type: 'date' },
        ],
      },
      {
        entity: ExportEntity.JOB_POSITIONS,
        columns: [
          { key: 'uid', label: 'UID', type: 'string' },
          { key: 'title', label: 'Job Title', type: 'string' },
          { key: 'description', label: 'Description', type: 'string' },
          { key: 'status', label: 'Status', type: 'string' },
          { key: 'createdAt', label: 'Created At', type: 'date' },
        ],
      },
      {
        entity: ExportEntity.HIRING_PROCESSES,
        columns: [
          { key: 'uid', label: 'UID', type: 'string' },
          { key: 'title', label: 'Process Title', type: 'string' },
          { key: 'candidateName', label: 'Candidate', type: 'string' },
          { key: 'jobPositionTitle', label: 'Job Position', type: 'string' },
          { key: 'status', label: 'Status', type: 'string' },
          { key: 'currentStage', label: 'Current Stage', type: 'string' },
          { key: 'createdAt', label: 'Created At', type: 'date' },
        ],
      },
    ];

    return { templates };
  }

  /**
   * Main export method
   */
  async export(dto: ExportRequestDto, companyId: number): Promise<ExportResponseDto> {
    this.logger.log(`Exporting ${dto.entity} as ${dto.type} for company ${companyId}`);

    // Fetch data based on entity
    const data = await this.fetchData(dto.entity, companyId, dto.filters);

    if (data.length === 0) {
      throw new BadRequestException('No data found to export');
    }

    // Transform data for export
    const exportData = this.transformData(data, dto.entity, dto.columns);

    // Generate file based on format
    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    if (dto.type === ExportFormat.CSV) {
      fileBuffer = await this.generateCsv(exportData);
      fileName = this.generateFileName(dto.entity, 'csv');
      mimeType = 'text/csv';
    } else if (dto.type === ExportFormat.PDF) {
      fileBuffer = await this.generatePdf(exportData, dto.entity);
      fileName = this.generateFileName(dto.entity, 'pdf');
      mimeType = 'application/pdf';
    } else {
      throw new BadRequestException('Unsupported export format');
    }

    // Upload to MinIO
    const s3Key = await this.storage.uploadFile(fileBuffer, fileName, mimeType);

    // Generate signed URL (expires in 24 hours)
    const fileUrl = await this.storage.getSignedUrl(s3Key, 86400);

    return {
      fileUrl,
      fileName,
      format: dto.type,
      recordCount: data.length,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Fetch data based on entity type and filters
   */
  private async fetchData(entity: ExportEntity, companyId: number, filters?: ExportFiltersDto): Promise<unknown[]> {
    const where: Record<string, unknown> = { companyId };

    // Apply filters if provided
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status };
      }

      if (filters.dateRange) {
        where.createdAt = {
          gte: new Date(filters.dateRange.start),
          lte: new Date(filters.dateRange.end),
        };
      }

      if (filters.companyUid) {
        // Convert companyUid to companyId
        const company = await this.databaseService.company.findUnique({
          where: { uid: filters.companyUid },
        });
        if (company) {
          where.companyId = company.id;
        }
      }
    }

    switch (entity) {
      case ExportEntity.CANDIDATES:
        return this.exportCandidates(where);

      case ExportEntity.COMPANIES:
        return this.exportCompanies(where);

      case ExportEntity.JOB_POSITIONS:
        return this.exportJobPositions(where);

      case ExportEntity.HIRING_PROCESSES:
        return this.exportHiringProcesses(where);

      default:
        throw new BadRequestException(`Unsupported entity: ${entity}`);
    }
  }

  /**
   * Export candidates
   */
  private async exportCandidates(where: Record<string, unknown>): Promise<unknown[]> {
    // Candidates don't have companyId directly - they're linked through hiringProcesses
    // For now, we'll export all candidates that have a hiring process with this company
    const companyId = where.companyId;
    delete where.companyId;

    return this.databaseService.candidate.findMany({
      where: {
        ...where,
        hiringProcesses: {
          some: {
            companyId: companyId as number,
          },
        },
      },
      select: {
        uid: true,
        name: true,
        email: true,
        source: true,
        sourceDetails: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Export companies
   */
  private async exportCompanies(where: Record<string, unknown>): Promise<unknown[]> {
    // Remove companyId filter for companies export (they don't have companyId)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { companyId, ...restWhere } = where;

    return this.databaseService.company.findMany({
      where: restWhere,
      select: {
        uid: true,
        name: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Export job positions
   */
  private async exportJobPositions(where: Record<string, unknown>): Promise<unknown[]> {
    return this.databaseService.jobPosition.findMany({
      where,
      select: {
        uid: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Export hiring processes
   */
  private async exportHiringProcesses(where: Record<string, unknown>): Promise<unknown[]> {
    const processes = await this.databaseService.hiringProcess.findMany({
      where,
      include: {
        candidate: {
          select: {
            name: true,
          },
        },
        jobPosition: {
          select: {
            title: true,
          },
        },
        stages: {
          where: { status: 'CURRENT' },
          select: {
            title: true,
          },
          orderBy: { position: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to flat structure
    return processes.map((p) => ({
      uid: p.uid,
      title: p.title,
      candidateName: p.candidate?.name || 'N/A',
      jobPositionTitle: p.jobPosition?.title || 'N/A',
      status: p.status,
      currentStage: p.stages[0]?.title || 'N/A',
      createdAt: p.createdAt,
    }));
  }

  /**
   * Transform data for export (filter columns, format dates)
   */
  private transformData(data: unknown[], entity: ExportEntity, columns?: string[]): Record<string, unknown>[] {
    return data.map((record) => {
      const rec = record as Record<string, unknown>;
      const transformed: Record<string, unknown> = {};

      // If specific columns requested, only include those
      if (columns && columns.length > 0) {
        columns.forEach((col) => {
          if (rec[col] !== undefined) {
            transformed[col] = this.formatValue(rec[col]);
          }
        });
      } else {
        // Include all columns
        Object.keys(rec).forEach((key) => {
          transformed[key] = this.formatValue(rec[key]);
        });
      }

      return transformed;
    });
  }

  /**
   * Format values for export (dates, booleans, etc.)
   */
  private formatValue(value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value === null || value === undefined) {
      return '';
    }
    return value;
  }

  /**
   * Generate CSV file
   */
  private async generateCsv(data: Record<string, unknown>[]): Promise<Buffer> {
    try {
      // Add UTF-8 BOM for Excel compatibility
      const BOM = '\uFEFF';
      const csv = stringify(data, {
        header: true,
        columns: Object.keys(data[0]),
        delimiter: ',',
        quoted: true,
        quoted_empty: true,
      });

      return Buffer.from(BOM + csv, 'utf-8');
    } catch (error) {
      this.logger.error(`Error generating CSV: ${(error as Error).message}`);
      throw new Error('Failed to generate CSV file');
    }
  }

  /**
   * Generate PDF file
   */
  private async generatePdf(data: Record<string, unknown>[], entity: ExportEntity): Promise<Buffer> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const vfs = require('pdfmake/build/vfs_fonts');
      const fonts = {
        Roboto: {
          normal: Buffer.from(vfs.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
          bold: Buffer.from(vfs.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
          italics: Buffer.from(vfs.pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
          bolditalics: Buffer.from(vfs.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64'),
        },
      };

      const printer = new PdfPrinter(fonts);

      // Extract columns from first record
      const columns = Object.keys(data[0]);

      // Prepare table body
      const tableBody = [
        // Header row
        columns.map((col) => ({
          text: this.formatColumnHeader(col),
          style: 'tableHeader',
          bold: true,
        })),
        // Data rows
        ...data.map((record) =>
          columns.map((col) => ({
            text: String(record[col] || ''),
            style: 'tableCell',
          })),
        ),
      ];

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageOrientation: columns.length > 5 ? 'landscape' : 'portrait',
        pageMargins: [40, 60, 40, 60],
        header: {
          margin: [40, 20, 40, 0],
          columns: [
            {
              text: `${this.formatEntityName(entity)} Export`,
              style: 'header',
            },
            {
              text: new Date().toLocaleDateString(),
              alignment: 'right',
              style: 'subheader',
            },
          ],
        },
        footer: (currentPage, pageCount) => ({
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          margin: [0, 20, 0, 0],
          fontSize: 9,
          color: '#666',
        }),
        content: [
          {
            text: `Total Records: ${data.length}`,
            style: 'subheader',
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              headerRows: 1,
              widths: Array(columns.length).fill('auto'),
              body: tableBody,
            },
            layout: {
              fillColor: (rowIndex: number) => (rowIndex === 0 ? '#4CAF50' : rowIndex % 2 === 0 ? '#f9f9f9' : null),
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#ddd',
              vLineColor: () => '#ddd',
              paddingLeft: () => 5,
              paddingRight: () => 5,
              paddingTop: () => 3,
              paddingBottom: () => 3,
            },
          },
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            color: '#333',
          },
          subheader: {
            fontSize: 12,
            color: '#666',
          },
          tableHeader: {
            fontSize: 10,
            color: 'white',
            fillColor: '#4CAF50',
          },
          tableCell: {
            fontSize: 9,
          },
        },
      };

      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);

        pdfDoc.end();
      });
    } catch (error) {
      this.logger.error(`Error generating PDF: ${(error as Error).message}`);
      throw new Error('Failed to generate PDF file');
    }
  }

  /**
   * Format column header for display
   */
  private formatColumnHeader(columnKey: string): string {
    return columnKey
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  }

  /**
   * Format entity name for display
   */
  private formatEntityName(entity: ExportEntity): string {
    return entity
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Generate unique filename
   */
  private generateFileName(entity: ExportEntity, extension: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const uniqueId = uuidv4().split('-')[0];
    return `${entity}-${timestamp}-${uniqueId}.${extension}`;
  }
}
