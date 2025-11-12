import {Box, Pagination as MuiPagination, Typography, Select, MenuItem, FormControl, InputLabel} from '@mui/material';
import {PaginationMeta} from '../../types/pagination.types';

interface PaginationProps {
	meta: PaginationMeta;
	onPageChange: (page: number) => void;
	onLimitChange: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({meta, onPageChange, onLimitChange}) => {
	const {page, totalPages, total, limit} = meta;

	const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
		onPageChange(value);
	};

	const handleLimitChange = (event: any) => {
		onLimitChange(Number(event.target.value));
	};

	const startItem = (page - 1) * limit + 1;
	const endItem = Math.min(page * limit, total);

	return (
		<Box
			sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				mt: 3,
				flexWrap: 'wrap',
				gap: 2,
			}}
		>
			<Typography variant="body2" color="textSecondary">
				Showing {startItem} to {endItem} of {total} results
			</Typography>

			<Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
				<FormControl size="small" sx={{minWidth: 120}}>
					<InputLabel>Items per page</InputLabel>
					<Select value={limit} onChange={handleLimitChange} label="Items per page">
						<MenuItem value={10}>10</MenuItem>
						<MenuItem value={25}>25</MenuItem>
						<MenuItem value={50}>50</MenuItem>
						<MenuItem value={100}>100</MenuItem>
					</Select>
				</FormControl>

				<MuiPagination
					count={totalPages}
					page={page}
					onChange={handlePageChange}
					color="primary"
					shape="rounded"
					showFirstButton
					showLastButton
				/>
			</Box>
		</Box>
	);
};

export default Pagination;
