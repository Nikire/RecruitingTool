import React from 'react';
import {
	Box,
	Paper,
	Typography,
	IconButton,
	Chip,
	Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import {Stage, StageType, STAGE_TYPE_LABELS, STAGE_TYPE_COLORS} from '../../types/stage.types';

interface StageItemProps {
	stage: Stage | Omit<Stage, 'uid' | 'status'>;
	index: number;
	onEdit?: () => void;
	onDelete?: () => void;
	isDraggable?: boolean;
	showActions?: boolean;
}

const StageTypeIcon: React.FC<{type: StageType}> = ({type}) => {
	const iconProps = {sx: {fontSize: 20}};

	switch (type) {
		case 'INTERVIEW':
			return <PersonIcon {...iconProps} />;
		case 'TECHNICAL_INTERVIEW':
			return <CodeIcon {...iconProps} />;
		case 'FINAL_INTERVIEW':
			return <GroupIcon {...iconProps} />;
		case 'OFFER':
			return <CheckCircleIcon {...iconProps} />;
		default:
			return <PersonIcon {...iconProps} />;
	}
};

/**
 * Component to display a single stage in a hiring process or job position.
 * Can be used in both edit mode (with actions) and view mode.
 */
const StageItem: React.FC<StageItemProps> = ({
	stage,
	index,
	onEdit,
	onDelete,
	isDraggable = false,
	showActions = true,
}) => {
	const stageColor = STAGE_TYPE_COLORS[stage.type];

	return (
		<Paper
			elevation={1}
			sx={{
				p: 2,
				mb: 2,
				border: '1px solid',
				borderColor: 'divider',
				borderLeft: 4,
				borderLeftColor: stageColor,
				transition: 'all 0.2s',
				'&:hover': {
					boxShadow: 3,
				},
			}}
		>
			<Stack spacing={1.5}>
				{/* Header Row */}
				<Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
					<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
						{isDraggable && (
							<DragIndicatorIcon sx={{color: 'text.secondary', cursor: 'grab'}} />
						)}
						<Typography variant="h6" component="div" sx={{fontWeight: 600}}>
							{index + 1}. {stage.title}
						</Typography>
					</Box>

					{showActions && (
						<Box sx={{display: 'flex', gap: 0.5}}>
							{onEdit && (
								<IconButton
									size="small"
									onClick={onEdit}
									aria-label="Edit stage"
									sx={{color: 'primary.main'}}
								>
									<EditIcon fontSize="small" />
								</IconButton>
							)}
							{onDelete && (
								<IconButton
									size="small"
									onClick={onDelete}
									aria-label="Delete stage"
									sx={{color: 'error.main'}}
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							)}
						</Box>
					)}
				</Box>

				{/* Type Chip */}
				<Box>
					<Chip
						icon={<StageTypeIcon type={stage.type} />}
						label={STAGE_TYPE_LABELS[stage.type]}
						size="small"
						sx={{
							bgcolor: `${stageColor}20`,
							color: stageColor,
							fontWeight: 500,
							'& .MuiChip-icon': {
								color: stageColor,
							},
						}}
					/>
				</Box>

				{/* Description */}
				{stage.description && (
					<Typography variant="body2" color="text.secondary">
						{stage.description}
					</Typography>
				)}

				{/* Estimated Time */}
				{stage.estimatedTime && (
					<Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
						<AccessTimeIcon sx={{fontSize: 16, color: 'text.secondary'}} />
						<Typography variant="caption" color="text.secondary">
							Estimated: {stage.estimatedTime} minutes
						</Typography>
					</Box>
				)}
			</Stack>
		</Paper>
	);
};

export default StageItem;
