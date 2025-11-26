import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiErrorResponse } from '../types/api.types';

/**
 * Response Normalizer for Backend API
 *
 * The backend returns all responses in a standardized structure:
 * { data: {...}, success: boolean, statusCode: number }
 *
 * This interceptor automatically unwraps response.data.data to response.data
 * so that all API service functions can access data consistently.
 */

/**
 * Checks if a response follows the backend's normalized structure
 */
function isNormalizedResponse(data: any): data is ApiResponse {
	return (
		data !== null &&
		typeof data === 'object' &&
		'data' in data &&
		'success' in data &&
		'statusCode' in data
	);
}

/**
 * Response interceptor that unwraps the backend's normalized response structure
 */
export function responseNormalizerInterceptor(
	response: AxiosResponse
): AxiosResponse {
	// Check if the response data follows the normalized structure
	if (isNormalizedResponse(response.data)) {
		const apiResponse = response.data as ApiResponse;

		// Validate success field
		if (!apiResponse.success) {
			// If success is false, treat it as an error
			const error: any = new Error('API request failed');
			error.response = response;
			error.apiResponse = apiResponse;
			throw error;
		}

		// Unwrap: response.data.data → response.data
		// This makes all API calls consistent: they can use .then(res => res.data)
		response.data = apiResponse.data;
	}

	// If not normalized structure, return as-is (for edge cases like SSE, file uploads)
	return response;
}

/**
 * Error interceptor to handle API errors consistently
 */
export function errorNormalizerInterceptor(error: any): Promise<never> {
	// If the error has a response (HTTP error from server)
	if (error.response) {
		const data = error.response.data;

		// Check if it's a normalized error response
		if (isNormalizedResponse(data)) {
			const apiResponse = data as ApiResponse<ApiErrorResponse>;

			// Unwrap error data for consistent error handling
			error.response.data = apiResponse.data;
		}
	}

	// Re-throw the error for React Query and other error handlers
	return Promise.reject(error);
}

/**
 * List of endpoints that should not be normalized
 * (e.g., SSE endpoints, file downloads, streaming responses)
 */
const SKIP_NORMALIZATION_PATHS = [
	'/sse', // Server-Sent Events endpoint
	'/export', // Export endpoints might have different structure
	'/download', // File downloads
];

/**
 * Checks if the request should skip normalization
 */
export function shouldSkipNormalization(
	config: InternalAxiosRequestConfig
): boolean {
	if (!config.url) return false;

	return SKIP_NORMALIZATION_PATHS.some((path) =>
		config.url?.includes(path)
	);
}

/**
 * Enhanced response interceptor with skip logic
 */
export function enhancedResponseNormalizer(
	response: AxiosResponse
): AxiosResponse {
	// Skip normalization for specific endpoints
	if (shouldSkipNormalization(response.config)) {
		return response;
	}

	return responseNormalizerInterceptor(response);
}
