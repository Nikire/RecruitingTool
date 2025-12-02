import React from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Props for the EntitySelect component
 * @template T The type of entity being selected
 */
export interface EntitySelectProps<T> {
  /** Label for the select field (i18n key or translated string) */
  label: string;
  /** Current selected value (single entity, array of entities, or null) */
  value: T | T[] | null;
  /** Callback when selection changes */
  onChange: (value: T | T[] | null) => void;
  /** Array of available options to select from */
  options: T[];
  /** Function to extract display label from an option */
  getOptionLabel: (option: T) => string;
  /** Function to extract unique value/key from an option (defaults to getOptionLabel) */
  getOptionValue?: (option: T) => string;
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Error message to display (i18n key or translated string) */
  error?: string;
  /** Enable multi-select mode */
  multiple?: boolean;
  /** Disable the select field */
  disabled?: boolean;
  /** Mark field as required */
  required?: boolean;
  /** Helper text to display below the field (i18n key or translated string) */
  helperText?: string;
  /** Placeholder text when no option is selected (i18n key or translated string) */
  placeholder?: string;
  /** Whether to show clear button */
  clearable?: boolean;
  /** Maximum number of items that can be selected in multi-select mode */
  limitTags?: number;
  /** Full width mode */
  fullWidth?: boolean;
  /** Size variant */
  size?: 'small' | 'medium';
}

/**
 * EntitySelect - A reusable generic autocomplete component for selecting entities
 *
 * Supports single and multi-select modes with search/filter functionality.
 * Provides loading states, error handling, and full i18n support.
 *
 * @example
 * // Single select
 * <EntitySelect
 *   label={t('users.company_label')}
 *   value={selectedCompany}
 *   onChange={setSelectedCompany}
 *   options={companies}
 *   getOptionLabel={(c) => c.name}
 *   isLoading={isLoadingCompanies}
 * />
 *
 * @example
 * // Multi-select
 * <EntitySelect
 *   label={t('users.roles_label')}
 *   value={selectedRoles}
 *   onChange={setSelectedRoles}
 *   options={roles}
 *   getOptionLabel={(r) => r.name}
 *   multiple
 * />
 */
function EntitySelect<T>({
  label,
  value,
  onChange,
  options,
  getOptionLabel,
  getOptionValue,
  isLoading = false,
  error,
  multiple = false,
  disabled = false,
  required = false,
  helperText,
  placeholder,
  clearable = true,
  limitTags = 3,
  fullWidth = true,
  size = 'medium',
}: EntitySelectProps<T>): React.ReactElement {
  const { t } = useTranslation();

  // Use getOptionLabel as fallback for getOptionValue if not provided
  const getValueFn = getOptionValue || getOptionLabel;

  return (
    <Autocomplete
      multiple={multiple}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, value) =>
        getValueFn(option) === getValueFn(value)
      }
      loading={isLoading}
      disabled={disabled || isLoading}
      disableClearable={!clearable}
      limitTags={limitTags}
      fullWidth={fullWidth}
      size={size}
      noOptionsText={
        isLoading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="body2">{t('entitySelect.loading')}</Typography>
          </Box>
        ) : (
          t('entitySelect.no_options')
        )
      }
      loadingText={
        <Box display="flex" alignItems="center" gap={1}>
          <CircularProgress size={16} />
          <Typography variant="body2">{t('entitySelect.loading')}</Typography>
        </Box>
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder || t('entitySelect.placeholder')}
          required={required}
          error={!!error}
          helperText={error || helperText}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}

export default EntitySelect;
