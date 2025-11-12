import {useState, useEffect} from 'react';
import {TextField, InputAdornment} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
	onSearch: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({onSearch, placeholder = 'Search...', debounceMs = 300}) => {
	const [searchValue, setSearchValue] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => {
			onSearch(searchValue);
		}, debounceMs);

		return () => clearTimeout(timer);
	}, [searchValue, debounceMs, onSearch]);

	return (
		<TextField
			fullWidth
			size="small"
			placeholder={placeholder}
			value={searchValue}
			onChange={(e) => setSearchValue(e.target.value)}
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
