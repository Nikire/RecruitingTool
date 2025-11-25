import { ApiProperty } from '@nestjs/swagger';
import { ExportEntity } from './export-request.dto';

export class ColumnDefinitionDto {
	@ApiProperty({
		description: 'Column key/field name',
		example: 'name',
	})
	key: string;

	@ApiProperty({
		description: 'Display label for the column',
		example: 'Full Name',
	})
	label: string;

	@ApiProperty({
		description: 'Data type of the column',
		example: 'string',
	})
	type: 'string' | 'number' | 'date' | 'boolean';
}

export class ExportTemplateDto {
	@ApiProperty({
		description: 'Entity type',
		enum: ExportEntity,
		example: ExportEntity.CANDIDATES,
	})
	entity: ExportEntity;

	@ApiProperty({
		description: 'Available columns for this entity',
		type: [ColumnDefinitionDto],
	})
	columns: ColumnDefinitionDto[];
}

export class ExportTemplatesResponseDto {
	@ApiProperty({
		description: 'Available export templates',
		type: [ExportTemplateDto],
	})
	templates: ExportTemplateDto[];
}
