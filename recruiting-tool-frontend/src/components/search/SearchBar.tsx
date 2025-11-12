import {useState, useEffect, useRef} from 'react';
import {TextField, InputAdornment} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
	onSearch: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
	value?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({onSearch, placeholder = 'Search...', debounceMs = 300, value = ''}) => {
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
		<TextField
			fullWidth
			size="small"
			placeholder={placeholder}
			value={localValue}
			onChange={handleChange}
			InputProps={{
				startAdornment: (
					<InputAdornment position="start">
						<SearchIcon />
					</InputAdornment>
				),
			}}
		/>
	);
};

export default SearchBar;
