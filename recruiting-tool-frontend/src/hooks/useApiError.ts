import { useCallback } from "react";
import { NormalizedError } from "../types/api.types";
import { showErrorToast } from "../utils/toast";

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
  const handleError = useCallback(
    (error: unknown, defaultMessage?: string): NormalizedError => {
      // Extract normalized error from interceptor
      const normalized: NormalizedError = normalizeErrorObject(
        error,
        defaultMessage,
      );

      // Display error toast
      showErrorToast(error, normalized.message);

      // Log to console in development
      if (import.meta.env.DEV) {
        console.error("[API Error]", {
          message: normalized.message,
          statusCode: normalized.statusCode,
          validationErrors: normalized.errors,
          originalError: normalized.originalError,
        });
      }

      return normalized;
    },
    [],
  );

  /**
   * Silent error handler that doesn't show toast notifications
   * Useful for background operations or when you want to handle errors manually
   */
  const handleErrorSilently = useCallback(
    (error: unknown, defaultMessage?: string): NormalizedError => {
      const normalized: NormalizedError = normalizeErrorObject(
        error,
        defaultMessage,
      );

      // Log to console in development
      if (import.meta.env.DEV) {
        console.error("[API Error - Silent]", {
          message: normalized.message,
          statusCode: normalized.statusCode,
          validationErrors: normalized.errors,
        });
      }

      return normalized;
    },
    [],
  );

  return { handleError, handleErrorSilently };
};

/**
 * Normalizes error objects from various sources into a consistent structure
 */
function normalizeErrorObject(
  error: unknown,
  defaultMessage?: string,
): NormalizedError {
  // Default normalized error
  const normalized: NormalizedError = {
    message: defaultMessage || "An unexpected error occurred",
    statusCode: -1,
    originalError: error,
  };

  if (!error) {
    return normalized;
  }

  // If error has response (Axios error)
  const errorWithResponse = error as {
    response?: { data?: unknown; status?: number };
  };
  if (errorWithResponse.response) {
    const { data, status } = errorWithResponse.response;

    normalized.statusCode = status || -1;

    // Extract message
    if (data) {
      if (typeof data === "string") {
        normalized.message = data;
      } else if (
        typeof data === "object" &&
        data !== null &&
        "message" in data
      ) {
        const dataObj = data as { message?: unknown };
        if (dataObj.message) {
          // Handle array of messages or single message
          if (Array.isArray(dataObj.message)) {
            normalized.message = (dataObj.message as string[]).join(", ");
          } else if (typeof dataObj.message === "string") {
            normalized.message = dataObj.message;
          }
        }
      } else if (typeof data === "object" && data !== null && "error" in data) {
        const dataWithError = data as { error?: string };
        if (dataWithError.error) {
          normalized.message = dataWithError.error;
        }
      }

      // Extract validation errors
      if (typeof data === "object" && data !== null && "errors" in data) {
        const dataWithErrors = data as { errors?: unknown };
        if (
          dataWithErrors.errors &&
          typeof dataWithErrors.errors === "object"
        ) {
          normalized.errors = dataWithErrors.errors;
        }
      }
    }

    return normalized;
  }

  // If error has request but no response (network error)
  const errorWithRequest = error as { request?: unknown };
  if (errorWithRequest.request) {
    normalized.message = "Network error - unable to reach server";
    normalized.statusCode = 0;
    return normalized;
  }

  // If error is a string
  if (typeof error === "string") {
    normalized.message = error;
    return normalized;
  }

  // If error has message property
  const errorWithMessage = error as { message?: unknown };
  if (
    errorWithMessage.message &&
    typeof errorWithMessage.message === "string"
  ) {
    normalized.message = errorWithMessage.message;
    return normalized;
  }

  return normalized;
}
