import {Box, BoxProps} from '@mui/material';

interface CellLayoutProps extends Omit<BoxProps, 'display' | 'flexDirection'> {
	/**
	 * Gap between items (MUI spacing units or CSS value)
	 * @default 1
	 */
	gap?: number | string;
	children: React.ReactNode;
}

interface CellRowProps extends CellLayoutProps {
	/**
	 * Center content horizontally within the cell
	 * Use for chip columns (status, tags, etc.)
	 * @default false
	 */
	centered?: boolean;
}

/**
 * CellRow - Horizontal layout for DataGrid cell content
 *
 * Use for action buttons, chips, or any horizontal arrangement.
 * Items are vertically centered within the row.
 * Takes full cell height to ensure proper vertical centering.
 *
 * @example
 * // Action buttons (left-aligned)
 * renderCell: (params) => (
 *   <CellRow gap={1}>
 *     <Button>Edit</Button>
 *     <Button>Delete</Button>
 *   </CellRow>
 * )
 *
 * @example
 * // Status chip (centered in column)
 * renderCell: (params) => (
 *   <CellRow centered>
 *     <Chip label={params.value} />
 *   </CellRow>
 * )
 */
export const CellRow: React.FC<CellRowProps> = ({gap = 1, centered = false, children, ...boxProps}) => (
	<Box
		display="flex"
		flexDirection="row"
		alignItems="center"
		justifyContent={centered ? 'center' : undefined}
		height="100%"
		gap={gap}
		{...boxProps}
	>
		{children}
	</Box>
);

/**
 * CellColumn - Vertical layout for DataGrid cell content
 *
 * Use for stacked information like name + email, title + subtitle.
 * Items are left-aligned by default.
 * Takes full cell height to ensure proper vertical centering.
 *
 * @example
 * renderCell: (params) => (
 *   <CellColumn gap={0.5}>
 *     <Typography variant="body2">{params.row.name}</Typography>
 *     <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
 *   </CellColumn>
 * )
 */
export const CellColumn: React.FC<CellLayoutProps> = ({gap = 0.5, children, ...boxProps}) => (
	<Box
		display="flex"
		flexDirection="column"
		justifyContent="center"
		alignItems="flex-start"
		height="100%"
		gap={gap}
		{...boxProps}
	>
		{children}
	</Box>
);
