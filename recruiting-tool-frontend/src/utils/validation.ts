import { useTranslation } from 'react-i18next';
import { RegisterOptions } from 'react-hook-form';

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
    required: (fieldName?: string): RegisterOptions => ({
      required: fieldName
        ? t('validation.field_required', { field: fieldName })
        : t('validation.required'),
    }),

    /**
     * Email validation with pattern matching
     */
    email: (): RegisterOptions => ({
      required: t('validation.email_required'),
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: t('validation.email_invalid'),
      },
    }),

    /**
     * Email validation (optional - no required)
     */
    emailOptional: (): RegisterOptions => ({
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: t('validation.email_invalid'),
      },
    }),

    /**
     * Minimum length validation
     * @param min - Minimum number of characters
     */
    minLength: (min: number): RegisterOptions => ({
      minLength: {
        value: min,
        message: t('validation.min_length', { min }),
      },
    }),

    /**
     * Maximum length validation
     * @param max - Maximum number of characters
     */
    maxLength: (max: number): RegisterOptions => ({
      maxLength: {
        value: max,
        message: t('validation.max_length', { max }),
      },
    }),

    /**
     * Phone number validation
     */
    phone: (): RegisterOptions => ({
      pattern: {
        value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        message: t('validation.phone_invalid'),
      },
    }),

    /**
     * URL validation (requires http:// or https://)
     */
    url: (): RegisterOptions => ({
      pattern: {
        value: /^https?:\/\/.+/,
        message: t('validation.url_invalid'),
      },
    }),

    /**
     * Positive number validation
     */
    positiveNumber: (): RegisterOptions => ({
      min: {
        value: 1,
        message: t('validation.positive_number'),
      },
      pattern: {
        value: /^[0-9]+$/,
        message: t('validation.numeric_only'),
      },
    }),

    /**
     * Combined validation rules
     * Merges multiple validation objects into one
     * @param rules - Array of validation rule objects
     */
    combine: (...rules: RegisterOptions[]): RegisterOptions => {
      return rules.reduce((acc, rule) => ({ ...acc, ...rule }), {});
    },
  };
};

/**
 * Validation helper to get error message from FieldError
 * @param error - FieldError object from react-hook-form
 * @returns Error message string or undefined
 */
export const getErrorMessage = (error?: { message?: string }): string | undefined => {
  return error?.message;
};
