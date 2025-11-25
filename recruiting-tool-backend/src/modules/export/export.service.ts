import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/modules/database/prisma.service';
import { StorageService } from '../storage/storage.service';
import {
	ExportRequestDto,
	ExportEntity,
	ExportFormat,
} from './dto/export-request.dto';
import { ExportResponseDto } from './dto/export-response.dto';
import {
	ExportTemplatesResponseDto,
	ExportTemplateDto,
	ColumnDefinitionDto,
} from './dto/export-templates.dto';
import { stringify } from 'csv-stringify/sync';
import * as PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExportService {
	private readonly logger = new Logger(ExportService.name);

	constructor(
		private readonly prisma: PrismaService,
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
					{ key: 'phone', label: 'Phone', type: 'string' },
					{ key: 'status', label: 'Status', type: 'string' },
					{ key: 'experience', label: 'Experience (years)', type: 'number' },
					{ key: 'createdAt', label: 'Created At', type: 'date' },
				],
			},
			{
				entity: ExportEntity.COMPANIES,
				columns: [
					{ key: 'uid', label: 'UID', type: 'string' },
					{ key: 'name', label: 'Company Name', type: 'string' },
					{ key: 'industry', label: 'Industry', type: 'string' },
					{ key: 'size', label: 'Company Size', type: 'string' },
					{ key: 'location', label: 'Location', type: 'string' },
					{ key: 'createdAt', label: 'Created At', type: 'date' },
				],
			},
			{
				entity: ExportEntity.JOB_POSITIONS,
				columns: [
					{ key: 'uid', label: 'UID', type: 'string' },
					{ key: 'title', label: 'Job Title', type: 'string' },
					{ key: 'department', label: 'Department', type: 'string' },
					{ key: 'location', label: 'Location', type: 'string' },
					{ key: 'employmentType', label: 'Employment Type', type: 'string' },
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
	async export(
		dto: ExportRequestDto,
		companyId: number,
	): Promise<ExportResponseDto> {
		this.logger.log(
			`Exporting ${dto.entity} as ${dto.type} for company ${companyId}`,
		);

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
	private async fetchData(
		entity: ExportEntity,
		companyId: number,
		filters?: any,
	): Promise<any[]> {
		let where: any = { companyId };

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
				const company = await this.prisma.company.findUnique({
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
	private async exportCandidates(where: any): Promise<any[]> {
		return this.prisma.candidate.findMany({
			where,
			select: {
				uid: true,
				name: true,
				email: true,
				phone: true,
				status: true,
				experience: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	/**
	 * Export companies
	 */
	private async exportCompanies(where: any): Promise<any[]> {
		// Remove companyId filter for companies export (they don't have companyId)
		const { companyId, ...restWhere } = where;

		return this.prisma.company.findMany({
			where: restWhere,
			select: {
				uid: true,
				name: true,
				industry: true,
				size: true,
				location: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	/**
	 * Export job positions
	 */
	private async exportJobPositions(where: any): Promise<any[]> {
		return this.prisma.jobPosition.findMany({
			where,
			select: {
				uid: true,
				title: true,
				department: true,
				location: true,
				employmentType: true,
				status: true,
				createdAt: true,
			},
			orderBy: { createdAt: 'desc' },
		});
	}

	/**
	 * Export hiring processes
	 */
	private async exportHiringProcesses(where: any): Promise<any[]> {
		const processes = await this.prisma.hiringProcess.findMany({
			where,
			select: {
				uid: true,
				title: true,
				status: true,
				createdAt: true,
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
					where: { isActive: true },
					select: {
						name: true,
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
			candidateName: p.candidate.name,
			jobPositionTitle: p.jobPosition.title,
			status: p.status,
			currentStage: p.stages[0]?.name || 'N/A',
			createdAt: p.createdAt,
		}));
	}

	/**
	 * Transform data for export (filter columns, format dates)
	 */
	private transformData(
		data: any[],
		entity: ExportEntity,
		columns?: string[],
	): any[] {
		return data.map((record) => {
			let transformed: any = {};

			// If specific columns requested, only include those
			if (columns && columns.length > 0) {
				columns.forEach((col) => {
					if (record[col] !== undefined) {
						transformed[col] = this.formatValue(record[col]);
					}
				});
			} else {
				// Include all columns
				Object.keys(record).forEach((key) => {
					transformed[key] = this.formatValue(record[key]);
				});
			}

			return transformed;
		});
	}

	/**
	 * Format values for export (dates, booleans, etc.)
	 */
	private formatValue(value: any): any {
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
	private async generateCsv(data: any[]): Promise<Buffer> {
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
			this.logger.error(`Error generating CSV: ${error.message}`);
			throw new Error('Failed to generate CSV file');
		}
	}

	/**
	 * Generate PDF file
	 */
	private async generatePdf(data: any[], entity: ExportEntity): Promise<Buffer> {
		try {
			const fonts = {
				Roboto: {
					normal: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
					bold: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
					italics: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
					bolditalics: Buffer.from(require('pdfmake/build/vfs_fonts').pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64'),
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
							fillColor: (rowIndex) => (rowIndex === 0 ? '#4CAF50' : rowIndex % 2 === 0 ? '#f9f9f9' : null),
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

				pdfDoc.on('data', (chunk) => chunks.push(chunk));
				pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
				pdfDoc.on('error', reject);

				pdfDoc.end();
			});
		} catch (error) {
			this.logger.error(`Error generating PDF: ${error.message}`);
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
