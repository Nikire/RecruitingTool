import React from 'react';
import { Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export interface FilterChipProps {
  label: string;
  onDelete: () => void;
  color?: 'primary' | 'secondary' | 'default';
}

/**
 * FilterChip Component
 *
 * Displays an active filter as a removable chip.
 * Used to show currently applied filters with a delete action.
 *
 * @param label - Display text for the filter
 * @param onDelete - Callback when filter is removed
 * @param color - Chip color variant
 */
const FilterChip: React.FC<FilterChipProps> = ({ label, onDelete, color = 'primary' }) => {
  return (
    <Chip
      label={label}
      onDelete={onDelete}
      deleteIcon={<CloseIcon />}
      color={color}
      size="small"
      sx={{
        m: 0.5,
        '& .MuiChip-deleteIcon': {
          color: 'inherit',
          '&:hover': {
            color: 'inherit',
            opacity: 0.7,
          },
        },
      }}
    />
  );
};

export default FilterChip;
