import { useState, useEffect, useRef } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  fullWidth?: boolean;
  size?: "small" | "medium";
}

/**
 * SearchInput - Debounced search input component
 *
 * Features:
 * - 300ms debounce by default (configurable)
 * - Clear button when input has value
 * - Syncs with external value prop
 * - Accessible with ARIA labels
 * - Responsive design
 */
const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder,
  debounceMs = 300,
  fullWidth = true,
  size = "small",
}) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer for debounced search
    timerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  // Sync local value with external value prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <TextField
      fullWidth={fullWidth}
      size={size}
      placeholder={placeholder || t("search.search_placeholder")}
      value={localValue}
      onChange={handleChange}
      inputProps={{
        "aria-label": t("aria.search"),
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon
              sx={{ fontSize: { xs: 20, sm: 24 } }}
              aria-hidden="true"
            />
          </InputAdornment>
        ),
        endAdornment: localValue && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              aria-label={t("search.clear_search")}
              edge="end"
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiInputBase-root": {
          minHeight: { xs: 44, sm: 40 },
        },
      }}
    />
  );
};

export default SearchInput;
