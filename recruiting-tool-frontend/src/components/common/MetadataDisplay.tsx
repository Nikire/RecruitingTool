import React from 'react';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';

/**
 * Represents a single metadata item to display
 */
export interface MetadataItem {
	/** Label text or i18n key */
	label: string;
	/** Value to display (string, number, or custom React node) */
	value: string | number | React.ReactNode;
	/** Optional secondary value (e.g., email below name) */
	subValue?: string;
}

/**
 * Props for MetadataDisplay component
 */
export interface MetadataDisplayProps {
	/** Array of metadata items to display */
	items: MetadataItem[];
	/** Layout direction - row (horizontal) or column (vertical) */
	direction?: 'row' | 'column';
	/** Whether to translate labels using i18n */
	translate?: boolean;
	/** Number of columns in the grid (2, 3, or 4) - only applies when direction is 'row' */
	columns?: 2 | 3 | 4;
}

/**
 * MetadataDisplay - Reusable component for displaying entity metadata
 *
 * Displays key-value pairs in a consistent layout with optional translation support.
 * Perfect for entity detail pages showing creation date, author, statistics, etc.
 *
 * @example
 * ```tsx
 * <MetadataDisplay
 *   items={[
 *     { label: 'job_position_detail.company', value: companyName },
 *     { label: 'careers.posted_date', value: new Date(createdAt).toLocaleDateString() },
 *     { label: 'job_position_detail.created_by_hr', value: createdBy.name, subValue: createdBy.email }
 *   ]}
 *   translate
 * />
 * ```
 */
const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
	items,
	direction = 'row',
	translate = false,
	columns = 4,
}) => {
	const {t} = useTranslation();

	return (
		<Box
			sx={{
				display: 'flex',
				gap: {xs: 2, sm: 4},
				flexDirection: {xs: 'column', sm: direction},
				flexWrap: {sm: 'wrap'},
			}}
		>
			{items.map((item, index) => (
				<Box key={index}>
					<Typography variant="body2" color="textSecondary">
						{translate ? t(item.label) : item.label}
					</Typography>
					<Typography variant="body1" sx={{fontWeight: 500}}>
						{item.value}
					</Typography>
					{item.subValue && (
						<Typography variant="caption" color="textSecondary">
							{item.subValue}
						</Typography>
					)}
				</Box>
			))}
		</Box>
	);
};

export default MetadataDisplay;
