import toast from "react-hot-toast";
import { ValidationErrors } from "../types/api.types";

/**
 * Toast notification utilities with consistent styling
 */

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#4caf50",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#4caf50",
    },
  });
};

/**
 * Extract validation errors from error object
 */
interface ErrorWithResponse {
  response?: {
    data?: {
      errors?: ValidationErrors;
      message?: string | string[];
      error?: string;
    };
    statusText?: string;
  };
  message?: string;
}

function extractValidationErrors(error: unknown): ValidationErrors | null {
  if (!error || typeof error !== "object") return null;

  const err = error as ErrorWithResponse;
  // Check response.data.errors
  if (
    err.response?.data?.errors &&
    typeof err.response.data.errors === "object"
  ) {
    return err.response.data.errors;
  }

  return null;
}

/**
 * Format validation errors for display
 */
function formatValidationErrors(errors: ValidationErrors): string {
  const errorMessages: string[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages)) {
      errorMessages.push(`${field}: ${messages.join(", ")}`);
    }
  }

  return errorMessages.join("\n");
}

export const showErrorToast = (
  error: unknown,
  defaultMessage = "An error occurred",
) => {
  let errorMessage = defaultMessage;
  let validationErrors: ValidationErrors | null = null;

  // Extract error message from different error formats
  if (error && typeof error === "object") {
    // Extract validation errors first
    validationErrors = extractValidationErrors(error);

    if (
      "response" in error &&
      error.response &&
      typeof error.response === "object"
    ) {
      const response = error.response as ErrorWithResponse["response"];

      // Handle various error response formats
      if (response.data) {
        if (typeof response.data === "string") {
          errorMessage = response.data;
        } else if (response.data.message) {
          // Handle array of messages or single message
          if (Array.isArray(response.data.message)) {
            errorMessage = response.data.message.join(", ");
          } else {
            errorMessage = response.data.message;
          }
        } else if (response.data.error) {
          errorMessage = response.data.error;
        }
      } else if (response.statusText) {
        errorMessage = response.statusText;
      }
    } else if ("message" in error && typeof error.message === "string") {
      errorMessage = error.message;
    }
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // If we have validation errors, append them to the message
  if (validationErrors) {
    const validationErrorsText = formatValidationErrors(validationErrors);
    if (validationErrorsText) {
      errorMessage = `${errorMessage}\n\n${validationErrorsText}`;
    }
  }

  toast.error(errorMessage, {
    duration: 5000,
    position: "top-right",
    style: {
      background: "#f44336",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
      whiteSpace: "pre-line", // Preserve line breaks
    },
    iconTheme: {
      primary: "#fff",
      secondary: "#f44336",
    },
  });
};

export const showWarningToast = (message: string) => {
  toast(message, {
    duration: 4000,
    position: "top-right",
    icon: "⚠️",
    style: {
      background: "#ff9800",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
    },
  });
};

export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 3000,
    position: "top-right",
    icon: "ℹ️",
    style: {
      background: "#2196f3",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
    },
  });
};

export const showLoadingToast = (message: string) => {
  return toast.loading(message, {
    position: "top-right",
    style: {
      background: "#fff",
      color: "#333",
      padding: "16px",
      borderRadius: "8px",
    },
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const dismissAllToasts = () => {
  toast.dismiss();
};
