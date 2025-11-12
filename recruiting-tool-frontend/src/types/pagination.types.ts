export interface PaginationParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}
