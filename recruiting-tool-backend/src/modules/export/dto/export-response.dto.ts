import { ApiProperty } from '@nestjs/swagger';
import { ExportFormat } from './export-request.dto';

export class ExportResponseDto {
  @ApiProperty({
    description: 'URL to download the exported file',
    example: 'https://minio.example.com/exports/candidates-2024-11-25.csv',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'Name of the generated file',
    example: 'candidates-2024-11-25.csv',
  })
  fileName: string;

  @ApiProperty({
    description: 'Format of the exported file',
    enum: ExportFormat,
    example: ExportFormat.CSV,
  })
  format: ExportFormat;

  @ApiProperty({
    description: 'Number of records exported',
    example: 150,
  })
  recordCount: number;

  @ApiProperty({
    description: 'Timestamp when the file was generated',
    example: '2024-11-25T10:30:00.000Z',
  })
  generatedAt: string;
}
