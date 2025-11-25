import React, { useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Button,
  Autocomplete,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SearchFilters, FilterOption } from '../../types/search';

export interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApply: () => void;
  onReset: () => void;
  statusOptions?: FilterOption[];
  skillsOptions?: string[];
  showExperience?: boolean;
  showSalary?: boolean;
  showSkills?: boolean;
  showLocation?: boolean;
  showDateRange?: boolean;
}

/**
 * FilterPanel Component
 *
 * Comprehensive filtering panel with multiple filter types:
 * - Status multi-select (checkboxes)
 * - Skills autocomplete/tags
 * - Location input
 * - Experience range slider
 * - Salary range slider
 * - Date range picker
 *
 * @param filters - Current filter state
 * @param onFiltersChange - Callback when filters change
 * @param onApply - Callback to apply filters
 * @param onReset - Callback to reset filters
 * @param statusOptions - Available status options
 * @param skillsOptions - Available skills for autocomplete
 * @param showExperience - Whether to show experience filter
 * @param showSalary - Whether to show salary filter
 * @param showSkills - Whether to show skills filter
 * @param showLocation - Whether to show location filter
 * @param showDateRange - Whether to show date range filter
 */
const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  statusOptions = [],
  skillsOptions = [],
  showExperience = false,
  showSalary = false,
  showSkills = false,
  showLocation = false,
  showDateRange = false,
}) => {
  const { t } = useTranslation();

  // Local state for sliders to prevent too many updates
  const [experienceRange, setExperienceRange] = useState<number[]>([
    filters.experience?.min ?? 0,
    filters.experience?.max ?? 20,
  ]);

  const [salaryRange, setSalaryRange] = useState<number[]>([
    filters.salary?.min ?? 0,
    filters.salary?.max ?? 200000,
  ]);

  const handleStatusToggle = (value: string) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(value)
      ? currentStatus.filter((s) => s !== value)
      : [...currentStatus, value];

    onFiltersChange({ ...filters, status: newStatus.length > 0 ? newStatus : undefined });
  };

  const handleSkillsChange = (_event: any, newValue: string[]) => {
    onFiltersChange({ ...filters, skills: newValue.length > 0 ? newValue : undefined });
  };

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onFiltersChange({ ...filters, location: value || undefined });
  };

  const handleExperienceChange = (_event: Event, newValue: number | number[]) => {
    const range = newValue as number[];
    setExperienceRange(range);
  };

  const handleExperienceCommit = () => {
    onFiltersChange({
      ...filters,
      experience: { min: experienceRange[0], max: experienceRange[1] },
    });
  };

  const handleSalaryChange = (_event: Event, newValue: number | number[]) => {
    const range = newValue as number[];
    setSalaryRange(range);
  };

  const handleSalaryCommit = () => {
    onFiltersChange({
      ...filters,
      salary: { min: salaryRange[0], max: salaryRange[1] },
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || { start: '', end: '' };
    const newRange = { ...currentRange, [field]: value };

    if (!newRange.start && !newRange.end) {
      onFiltersChange({ ...filters, dateRange: undefined });
    } else {
      onFiltersChange({ ...filters, dateRange: newRange });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
        mb: 2,
      }}
    >
      {/* Status Filter */}
      {statusOptions.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">{t('search.status')}</Typography>
            {filters.status && filters.status.length > 0 && (
              <Chip
                label={filters.status.length}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {statusOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      checked={filters.status?.includes(option.value) || false}
                      onChange={() => handleStatusToggle(option.value)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{option.label}</Typography>
                      {option.count !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          ({option.count})
                        </Typography>
                      )}
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Date Range Filter */}
      {showDateRange && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">{t('search.date_range')}</Typography>
            {filters.dateRange && (
              <Chip label="•" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label={t('search.start_date')}
                type="date"
                size="small"
                fullWidth
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label={t('search.end_date')}
                type="date"
                size="small"
                fullWidth
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Skills Filter */}
      {showSkills && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">{t('search.skills')}</Typography>
            {filters.skills && filters.skills.length > 0 && (
              <Chip
                label={filters.skills.length}
                size="small"
                color="primary"
                sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
              />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Autocomplete
              multiple
              freeSolo
              options={skillsOptions}
              value={filters.skills || []}
              onChange={handleSkillsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip {...getTagProps({ index })} key={option} label={option} size="small" />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={t('search.skills_placeholder')}
                  helperText={t('search.skills_helper')}
                />
              )}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Location Filter */}
      {showLocation && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">{t('search.location')}</Typography>
            {filters.location && (
              <Chip label="•" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              size="small"
              fullWidth
              placeholder={t('search.location_placeholder')}
              value={filters.location || ''}
              onChange={handleLocationChange}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Experience Range Filter */}
      {showExperience && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">{t('search.experience')}</Typography>
            {filters.experience && (
              <Chip label="•" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('search.experience_years', { min: experienceRange[0], max: experienceRange[1] })}
              </Typography>
              <Slider
                value={experienceRange}
                onChange={handleExperienceChange}
                onChangeCommitted={handleExperienceCommit}
                valueLabelDisplay="auto"
                min={0}
                max={20}
                marks={[
                  { value: 0, label: '0' },
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 20, label: '20+' },
                ]}
                sx={{ mt: 2 }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Salary Range Filter */}
      {showSalary && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="medium">{t('search.salary')}</Typography>
            {filters.salary && (
              <Chip label="•" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ px: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('search.salary_range', { min: salaryRange[0], max: salaryRange[1] })}
              </Typography>
              <Slider
                value={salaryRange}
                onChange={handleSalaryChange}
                onChangeCommitted={handleSalaryCommit}
                valueLabelDisplay="auto"
                min={0}
                max={200000}
                step={5000}
                marks={[
                  { value: 0, label: '$0' },
                  { value: 50000, label: '$50K' },
                  { value: 100000, label: '$100K' },
                  { value: 150000, label: '$150K' },
                  { value: 200000, label: '$200K+' },
                ]}
                sx={{ mt: 2 }}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button variant="outlined" onClick={onReset} fullWidth>
          {t('search.reset_filters')}
        </Button>
        <Button variant="contained" onClick={onApply} fullWidth>
          {t('search.apply_filters')}
        </Button>
      </Box>
    </Box>
  );
};

export default FilterPanel;
