import { Box, TextField, InputAdornment, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useState, useCallback, useEffect, useRef } from "react";

interface JobSearchFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const SEARCH_DEBOUNCE_MS = 300;

const JobSearchFilters: React.FC<JobSearchFiltersProps> = ({
  search,
  onSearchChange,
}) => {
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState(search);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingCommit = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  // Cancel any in-flight debounce when the component unmounts.
  useEffect(() => clearPendingCommit, [clearPendingCommit]);

  // Keep the box in step with the URL (Clear all, back button, pasted link)
  // without clobbering text the visitor is still typing.
  useEffect(() => {
    if (debounceTimer.current) return;
    setLocalSearch(search);
  }, [search]);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      clearPendingCommit();
      debounceTimer.current = setTimeout(() => {
        debounceTimer.current = null;
        onSearchChange(value);
      }, SEARCH_DEBOUNCE_MS);
    },
    [clearPendingCommit, onSearchChange],
  );

  // Enter commits immediately instead of waiting out the debounce.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    clearPendingCommit();
    onSearchChange(localSearch);
  };

  const handleClearSearch = () => {
    clearPendingCommit();
    setLocalSearch("");
    onSearchChange("");
  };

  return (
    <Box>
      {/* Search bar */}
      <TextField
        fullWidth
        placeholder={t("careers.search_placeholder")}
        value={localSearch}
        onChange={(e) => handleSearchChange(e.target.value)}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} />
            </InputAdornment>
          ),
          endAdornment: localSearch && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                edge="end"
                aria-label={t("search.clear_search")}
                onClick={handleClearSearch}
                sx={{
                  color: "text.secondary",
                  "&:hover": { color: "text.primary" },
                }}
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            bgcolor: "background.paper",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "divider",
              borderWidth: 2,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "primary.main",
            },
          },
        }}
        sx={{
          "& .MuiInputBase-input": {
            py: 1.25,
            fontSize: "0.875rem",
          },
          "& .MuiInputBase-input::placeholder": {
            fontSize: "0.875rem",
          },
        }}
      />

      {/* Filter chips - for future expansion */}
      {/*
			<Stack direction="row" spacing={1} sx={{mt: 2, flexWrap: 'wrap', gap: 1}}>
				<Chip
					label={t('job_position_filters.all_departments')}
					variant="outlined"
					sx={{borderRadius: 2}}
				/>
				<Chip
					label={t('job_position_filters.engineering')}
					variant="outlined"
					sx={{borderRadius: 2}}
				/>
				<Chip
					label={t('job_position_card.remote')}
					variant="outlined"
					sx={{borderRadius: 2}}
				/>
			</Stack>
			*/}
    </Box>
  );
};

export default JobSearchFilters;
