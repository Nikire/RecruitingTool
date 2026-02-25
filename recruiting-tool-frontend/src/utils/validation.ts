import { useTranslation } from "react-i18next";

/**
 * Type alias for loosely typed RegisterOptions.
 * Compatible with react-hook-form v7 strict generics.
 * We use `Parameters<UseFormRegister<FieldValues>>[1]` to get the exact type
 * that is always assignable to any specific form's register() second argument.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyRegisterOptions = Record<string, any>;

/**
 * Validation utilities hook providing reusable validation patterns
 * with i18n support for react-hook-form
 *
 * @returns Object with common validation rules and patterns
 */
export const useValidationRules = () => {
  const { t } = useTranslation();

  return {
    /**
     * Required field validation
     * @param fieldName - Name of the field for error message
     */
    required: (fieldName?: string): AnyRegisterOptions => ({
      required: fieldName
        ? t("validation.field_required", { field: fieldName })
        : t("validation.required"),
    }),

    /**
     * Email validation with pattern matching
     */
    email: (): AnyRegisterOptions => ({
      required: t("validation.email_required"),
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: t("validation.email_invalid"),
      },
    }),

    /**
     * Email validation (optional - no required)
     */
    emailOptional: (): AnyRegisterOptions => ({
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: t("validation.email_invalid"),
      },
    }),

    /**
     * Password validation
     * @param minLength - Minimum password length (default: 8)
     * @param requireSpecialChars - Require special characters (default: false)
     */
    password: (
      minLength = 8,
      requireSpecialChars = false,
    ): AnyRegisterOptions => {
      const rules: AnyRegisterOptions = {
        required: t("validation.password_required"),
        minLength: {
          value: minLength,
          message: t("validation.password_min_length", { min: minLength }),
        },
      };

      if (requireSpecialChars) {
        rules.pattern = {
          value:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          message: t("validation.password_complexity"),
        };
      }

      return rules;
    },

    /**
     * Confirm password validation (matches another field)
     * @param passwordFieldValue - The value of the password field to match against
     */
    confirmPassword: (passwordFieldValue: string): AnyRegisterOptions => ({
      required: t("validation.confirm_password_required"),
      validate: (value: unknown) =>
        value === passwordFieldValue || t("validation.passwords_must_match"),
    }),

    /**
     * Minimum length validation
     * @param min - Minimum number of characters
     */
    minLength: (min: number): AnyRegisterOptions => ({
      minLength: {
        value: min,
        message: t("validation.min_length", { min }),
      },
    }),

    /**
     * Maximum length validation
     * @param max - Maximum number of characters
     */
    maxLength: (max: number): AnyRegisterOptions => ({
      maxLength: {
        value: max,
        message: t("validation.max_length", { max }),
      },
    }),

    /**
     * Phone number validation
     */
    phone: (): AnyRegisterOptions => ({
      pattern: {
        value:
          /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        message: t("validation.phone_invalid"),
      },
    }),

    /**
     * URL validation (requires http:// or https://)
     */
    url: (): AnyRegisterOptions => ({
      pattern: {
        value: /^https?:\/\/.+/,
        message: t("validation.url_invalid"),
      },
    }),

    /**
     * LinkedIn URL validation (optional)
     */
    linkedinUrl: (): AnyRegisterOptions => ({
      pattern: {
        value: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
        message: t("validation.linkedin_invalid"),
      },
    }),

    /**
     * Positive number validation
     */
    positiveNumber: (): AnyRegisterOptions => ({
      min: {
        value: 1,
        message: t("validation.positive_number"),
      },
      pattern: {
        value: /^[0-9]+$/,
        message: t("validation.numeric_only"),
      },
    }),

    /**
     * Combined validation rules
     * Merges multiple validation objects into one
     * @param rules - Array of validation rule objects
     */
    combine: (...rules: AnyRegisterOptions[]): AnyRegisterOptions => {
      return Object.assign(
        {} as AnyRegisterOptions,
        ...rules,
      ) as AnyRegisterOptions;
    },
  };
};

/**
 * Validation helper to get error message from FieldError
 * @param error - FieldError object from react-hook-form
 * @returns Error message string or undefined
 */
export const getErrorMessage = (error?: {
  message?: string;
}): string | undefined => {
  return error?.message;
};
