/**
 * Backend API Response Types
 *
 * The backend returns all responses in a standardized structure.
 * These types define that structure for proper type safety.
 */

/**
 * Standard API response wrapper from the backend
 */
export interface ApiResponse<T = any> {
	data: T;
	success: boolean;
	statusCode: number;
}

/**
 * Error response structure from the backend
 */
export interface ApiErrorResponse {
	message: string | string[];
	error?: string;
	statusCode: number;
}

/**
 * Utility type for unwrapped API response
 * Use this when you want to type the actual data after the interceptor unwraps it
 */
export type UnwrappedResponse<T> = T;
