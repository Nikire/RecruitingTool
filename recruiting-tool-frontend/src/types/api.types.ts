/**
 * Backend API Response Types
 *
 * The backend returns all responses in a standardized structure.
 * These types define that structure for proper type safety.
 */

/**
 * Standard API response wrapper from the backend
 */
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  statusCode: number;
  message?: string; // Optional success message
}

/**
 * Error response structure from the backend
 */
export interface ApiErrorResponse {
  message: string | string[];
  error?: string;
  statusCode: number;
  errors?: ValidationErrors; // Field-level validation errors
}

/**
 * Validation errors structure
 * Maps field names to arrays of error messages
 *
 * Example:
 * {
 *   email: ['Invalid email format', 'Email already exists'],
 *   password: ['Password must be at least 8 characters']
 * }
 */
export interface ValidationErrors {
  [field: string]: string[];
}

/**
 * Normalized error structure for frontend consumption
 * This is what the error interceptor provides to components
 */
export interface NormalizedError {
  message: string;
  statusCode: number;
  errors?: ValidationErrors;
  originalError?: unknown;
}

/**
 * Utility type for unwrapped API response
 * Use this when you want to type the actual data after the interceptor unwraps it
 */
export type UnwrappedResponse<T> = T;
