import React, {useState} from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	List,
	ListItem,
	ListItemButton,
	ListItemText,
	Radio,
	CircularProgress,
	Alert,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {Stage, StageStatus} from '../../types/stage.types';
import {useProgressStage, useMoveToStage} from '../../hooks/api/useHiringProcess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface StageProgressionDialogProps {
	open: boolean;
	onClose: () => void;
	hiringProcessUid: string;
	stages: Stage[];
	currentStageUid?: string;
}

const StageProgressionDialog: React.FC<StageProgressionDialogProps> = ({
	open,
	onClose,
	hiringProcessUid,
	stages,
	currentStageUid,
}) => {
	const {t} = useTranslation();
	const [selectedStageUid, setSelectedStageUid] = useState<string | null>(null);
	const progressStageMutation = useProgressStage();
	const moveToStageMutation = useMoveToStage();
	const isLoading = progressStageMutation.isPending || moveToStageMutation.isPending;

	const getStageStatusColor = (status: StageStatus): string => {
		switch (status) {
			case 'DONE':
				return '#4caf50';
			case 'CURRENT':
				return '#2196f3';
			case 'OPEN':
				return '#9e9e9e';
			case 'CANCELLED':
				return '#f44336';
			default:
				return '#757575';
		}
	};

	const handleProgressToNext = async () => {
		await progressStageMutation.mutateAsync(hiringProcessUid);
		onClose();
	};

	const handleMoveToStage = async () => {
		if (selectedStageUid) {
			await moveToStageMutation.mutateAsync({uid: hiringProcessUid, stageUid: selectedStageUid});
			onClose();
		}
	};

	const currentStage = stages.find((s) => s.uid === currentStageUid);
	const nextStageIndex = currentStage ? stages.findIndex((s) => s.uid === currentStageUid) + 1 : -1;
	const hasNextStage = nextStageIndex >= 0 && nextStageIndex < stages.length;

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle>
				<Typography variant="h6" sx={{fontWeight: 600}}>
					{t('progress.title')}
				</Typography>
			</DialogTitle>

			<DialogContent sx={{pt: 2}}>
				{progressStageMutation.error || moveToStageMutation.error ? (
					<Alert severity="error" sx={{mb: 2}}>
						{progressStageMutation.error?.message || moveToStageMutation.error?.message}
					</Alert>
				) : null}

				<Box sx={{mb: 3}}>
					<Typography variant="subtitle2" sx={{mb: 1.5, fontWeight: 600}}>
						{t('progress.current_stage_progress')}
					</Typography>
					<Typography variant="body2" color="textSecondary" sx={{mb: 2}}>
						{t('progress.move_stage_help')}
					</Typography>

					{hasNextStage && (
						<Button
							fullWidth
							variant="contained"
							onClick={handleProgressToNext}
							disabled={isLoading}
							sx={{mb: 2}}
						>
							{isLoading ? <CircularProgress size={20} sx={{mr: 1}} /> : null}
							{t('progress.progress_to_next')}
						</Button>
					)}

					{!hasNextStage && currentStage?.status === 'CURRENT' && (
						<Alert severity="info">
							{t('progress.final_stage_notice')}
						</Alert>
					)}
				</Box>

				<Box sx={{mb: 2}}>
					<Typography variant="subtitle2" sx={{mb: 1.5, fontWeight: 600}}>
						{t('progress.jump_to_stage')}
					</Typography>

					<List sx={{maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1}}>
						{stages.map((stage) => (
							<ListItem
								key={stage.uid}
								disablePadding
								sx={{
									backgroundColor: selectedStageUid === stage.uid ? '#f5f5f5' : 'transparent',
								}}
							>
								<ListItemButton
									onClick={() => setSelectedStageUid(stage.uid)}
									sx={{py: 1.5}}
								>
									<Radio
										checked={selectedStageUid === stage.uid}
										tabIndex={-1}
										disableRipple
										size="small"
										sx={{mr: 1}}
									/>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1, width: '100%'}}>
										{stage.status === 'DONE' ? (
											<CheckCircleIcon sx={{fontSize: 20, color: '#4caf50'}} />
										) : stage.status === 'CURRENT' ? (
											<RadioButtonUncheckedIcon sx={{fontSize: 20, color: '#2196f3'}} />
										) : (
											<RadioButtonUncheckedIcon sx={{fontSize: 20, color: '#9e9e9e'}} />
										)}
										<Box>
											<ListItemText
												primary={
													<Typography
														variant="body2"
														sx={{
															fontWeight: stage.status === 'CURRENT' ? 600 : 400,
														}}
													>
														{stage.title}
													</Typography>
												}
												secondary={
													<Typography variant="caption" color="textSecondary">
														{t('progress.position')} {stage.position + 1} - {stage.status}
													</Typography>
												}
											/>
										</Box>
									</Box>
								</ListItemButton>
							</ListItem>
						))}
					</List>
				</Box>
			</DialogContent>

			<DialogActions sx={{p: 2}}>
				<Button onClick={onClose} disabled={isLoading}>
					{t('common.cancel')}
				</Button>
				<Button
					onClick={handleMoveToStage}
					variant="contained"
					disabled={!selectedStageUid || isLoading}
				>
					{isLoading ? <CircularProgress size={20} sx={{mr: 1}} /> : null}
					{t('progress.move_to_stage')}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default StageProgressionDialog;
