export interface PaginationParams {
  page?: number;
  /** Page size. Sent to the API as `pageSize` (see `toListQuery`). */
  limit?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Shape returned by every backend list endpoint built on `PaginationDto`
 * (`recruiting-tool-backend/src/dto/pagination.dto.ts`): `{ data, pagination }`.
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Normalises list params for the API: the backend `PaginationDto` binds the page
 * size as `pageSize`, so a caller-provided `limit` is renamed (a bare `limit`
 * would be silently ignored and every page pinned to the default of 10).
 */
export function toListQuery<P extends PaginationParams>(
  params: P,
): Omit<P, "limit" | "pageSize"> & { pageSize?: number } {
  const { limit, pageSize, ...rest } = params;
  const size = pageSize ?? limit;
  return size === undefined ? rest : { ...rest, pageSize: size };
}
