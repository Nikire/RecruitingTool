import { PaginatedResponse } from '../dto/pagination.dto';

export function calculatePagination(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { skip, take };
}

export function createPaginatedResponse<T>(data: T[], total: number, page: number, pageSize: number): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
