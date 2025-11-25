import {IsOptional, IsInt, Min, IsString} from 'class-validator';
import {Type} from 'class-transformer';
import {ApiPropertyOptional} from '@nestjs/swagger';

export class PaginationDto {
	@ApiPropertyOptional({
		description: 'Page number (starts at 1)',
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		description: 'Number of items per page',
		minimum: 1,
		default: 10,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	pageSize?: number = 10;

	@ApiPropertyOptional({
		description: 'Search term for filtering results',
	})
	@IsOptional()
	@IsString()
	search?: string;

	@ApiPropertyOptional({
		description: 'Field to sort by',
	})
	@IsOptional()
	@IsString()
	sortBy?: string;

	@ApiPropertyOptional({
		description: 'Sort order (asc or desc)',
		enum: ['asc', 'desc'],
		default: 'desc',
	})
	@IsOptional()
	@IsString()
	sortOrder?: 'asc' | 'desc' = 'desc';
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}
