import {useState, useEffect, useRef} from 'react';
import {TextField, InputAdornment, Box, SxProps, Theme} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {useTranslation} from 'react-i18next';

interface SearchBarProps {
	onSearch: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
	value?: string;
	containerSx?: SxProps<Theme>;
}

const SearchBar: React.FC<SearchBarProps> = ({onSearch, placeholder = 'Search...', debounceMs = 300, value = '', containerSx}) => {
	const {t} = useTranslation();
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
			onSearch(newValue);
		}, debounceMs);
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
		<Box sx={containerSx}>
			<TextField
				fullWidth
				size="small"
				placeholder={placeholder}
				value={localValue}
				onChange={handleChange}
				inputProps={{
					minLength: 0,
					style: {
						fontSize: 'clamp(0.9rem, 2vw, 1rem)',
					},
					'aria-label': t('aria.search'),
				}}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon sx={{fontSize: {xs: 20, sm: 24}}} aria-hidden="true" />
						</InputAdornment>
					),
				}}
				sx={{
					'& .MuiInputBase-root': {
						minHeight: {xs: 44, sm: 40},
					},
					'& .MuiOutlinedInput-input': {
						padding: {xs: '10px 14px', sm: '8px 14px'},
					},
				}}
			/>
		</Box>
	);
};

export default SearchBar;
