import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Divider,
	Alert,
} from '@mui/material';
import {useState} from 'react';
import {useBulkCreateStages} from '../../hooks/api/useStages';
import {Stage, StageType, STAGE_TYPE_LABELS} from '../../types/stage.types';
import StageItem from '../job-positions/StageItem';
import StageBuilder from '../job-positions/StageBuilder';

interface ManageStagesDialogProps {
	open: boolean;
	onClose: () => void;
	jobPositionUid: string;
	jobPositionTitle: string;
	existingStages?: Stage[];
}

/**
 * Enhanced dialog for managing stages of an existing job position.
 * Shows existing stages and allows adding new ones using the StageBuilder component.
 */
const ManageStagesDialog: React.FC<ManageStagesDialogProps> = ({
	open,
	onClose,
	jobPositionUid,
	jobPositionTitle,
	existingStages = [],
}) => {
	const [newStages, setNewStages] = useState<Omit<Stage, 'uid' | 'status'>[]>([]);
	const {mutate: bulkCreateStages, isPending, isError} = useBulkCreateStages();

	const onSubmit = () => {
		if (newStages.length === 0) {
			return;
		}

		const stagesToCreate = newStages.map((stage, index) => ({
			...stage,
			jobPositionUid,
			position: existingStages.length + index,
		}));

		bulkCreateStages(stagesToCreate, {
			onSuccess: () => {
				setNewStages([]);
				onClose();
			},
		});
	};

	const handleClose = () => {
		setNewStages([]);
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>
				<Typography variant="h6">Manage Stages - {jobPositionTitle}</Typography>
			</DialogTitle>
			<DialogContent>
				{/* Existing Stages Section */}
				{existingStages.length > 0 && (
					<Box sx={{mb: 4}}>
						<Typography variant="h6" gutterBottom>
							Current Stages ({existingStages.length})
						</Typography>
						<Typography variant="body2" color="text.secondary" gutterBottom sx={{mb: 2}}>
							These stages are already configured for this job position.
						</Typography>
						<Box>
							{existingStages
								.sort((a, b) => a.position - b.position)
								.map((stage, index) => (
									<StageItem
										key={stage.uid}
										stage={stage}
										index={index}
										showActions={false}
									/>
								))}
						</Box>
						<Divider sx={{my: 3}} />
					</Box>
				)}

				{/* Add New Stages Section */}
				<Box>
					<Typography variant="h6" gutterBottom>
						Add New Stages
					</Typography>
					<Typography variant="body2" color="text.secondary" gutterBottom sx={{mb: 2}}>
						Configure additional stages for this job position.
					</Typography>

					{newStages.length === 0 && existingStages.length === 0 && (
						<Alert severity="warning" sx={{mb: 2}}>
							This job position has no stages configured yet. Add at least one stage to continue.
						</Alert>
					)}

					<StageBuilder
						stages={newStages}
						onChange={setNewStages}
						minStages={0}
					/>

					{isError && (
						<Alert severity="error" sx={{mt: 2}}>
							Failed to create stages. Please try again.
						</Alert>
					)}
				</Box>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose} disabled={isPending}>
					Cancel
				</Button>
				<Button
					variant="contained"
					onClick={onSubmit}
					disabled={isPending || newStages.length === 0}
				>
					{isPending ? 'Adding Stages...' : `Add ${newStages.length} Stage${newStages.length !== 1 ? 's' : ''}`}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ManageStagesDialog;
