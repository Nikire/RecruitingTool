import { useCallback } from 'react';
import { NormalizedError } from '../types/api.types';
import { showErrorToast } from '../utils/toast';

/**
 * Hook for consistent API error handling across the application
 *
 * Usage:
 * ```typescript
 * const { handleError } = useApiError();
 *
 * useMutation({
 *   mutationFn: createUser,
 *   onError: (error) => {
 *     handleError(error);
 *   }
 * });
 * ```
 */
export const useApiError = () => {
	/**
	 * Normalizes and handles API errors
	 * - Displays error toast notifications
	 * - Logs errors in development mode
	 * - Returns normalized error structure
	 */
	const handleError = useCallback((error: any, defaultMessage?: string): NormalizedError => {
		// Extract normalized error from interceptor
		const normalized: NormalizedError = normalizeErrorObject(error, defaultMessage);

		// Display error toast
		showErrorToast(error, normalized.message);

		// Log to console in development
		if (import.meta.env.DEV) {
			console.error('[API Error]', {
				message: normalized.message,
				statusCode: normalized.statusCode,
				validationErrors: normalized.errors,
				originalError: normalized.originalError,
			});
		}

		return normalized;
	}, []);

	/**
	 * Silent error handler that doesn't show toast notifications
	 * Useful for background operations or when you want to handle errors manually
	 */
	const handleErrorSilently = useCallback((error: any, defaultMessage?: string): NormalizedError => {
		const normalized: NormalizedError = normalizeErrorObject(error, defaultMessage);

		// Log to console in development
		if (import.meta.env.DEV) {
			console.error('[API Error - Silent]', {
				message: normalized.message,
				statusCode: normalized.statusCode,
				validationErrors: normalized.errors,
			});
		}

		return normalized;
	}, []);

	return { handleError, handleErrorSilently };
};

/**
 * Normalizes error objects from various sources into a consistent structure
 */
function normalizeErrorObject(error: any, defaultMessage?: string): NormalizedError {
	// Default normalized error
	const normalized: NormalizedError = {
		message: defaultMessage || 'An unexpected error occurred',
		statusCode: -1,
		originalError: error,
	};

	if (!error) {
		return normalized;
	}

	// If error has response (Axios error)
	if (error.response) {
		const { data, status } = error.response;

		normalized.statusCode = status;

		// Extract message
		if (data) {
			if (typeof data === 'string') {
				normalized.message = data;
			} else if (data.message) {
				// Handle array of messages or single message
				if (Array.isArray(data.message)) {
					normalized.message = data.message.join(', ');
				} else {
					normalized.message = data.message;
				}
			} else if (data.error) {
				normalized.message = data.error;
			}

			// Extract validation errors
			if (data.errors && typeof data.errors === 'object') {
				normalized.errors = data.errors;
			}
		}

		return normalized;
	}

	// If error has request but no response (network error)
	if (error.request) {
		normalized.message = 'Network error - unable to reach server';
		normalized.statusCode = 0;
		return normalized;
	}

	// If error is a string
	if (typeof error === 'string') {
		normalized.message = error;
		return normalized;
	}

	// If error has message property
	if (error.message && typeof error.message === 'string') {
		normalized.message = error.message;
		return normalized;
	}

	return normalized;
}
