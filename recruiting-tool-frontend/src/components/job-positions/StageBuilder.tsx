import React, {useState} from 'react';
import {
	Box,
	Button,
	Typography,
	Alert,
	Stack,
	Divider,
	Menu,
	MenuItem,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import EngineeringIcon from '@mui/icons-material/Engineering';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import StageItem from './StageItem';
import AddStageDialog, {StageFormData} from './AddStageDialog';
import ConfirmDeleteDialog from '../dialogs/ConfirmDeleteDialog';
import {Stage, StageType} from '../../types/stage.types';

interface StageBuilderProps {
	stages: Omit<Stage, 'uid' | 'status'>[];
	onChange: (stages: Omit<Stage, 'uid' | 'status'>[]) => void;
	minStages?: number;
	maxStages?: number;
	error?: string;
}

interface StageTemplate {
	name: string;
	icon: React.ReactNode;
	stages: Omit<Stage, 'uid' | 'status'>[];
}

const STAGE_TEMPLATES: StageTemplate[] = [
	{
		name: 'Basic (3 stages)',
		icon: <PersonSearchIcon />,
		stages: [
			{
				title: 'Initial Screening',
				type: 'INTERVIEW' as StageType,
				description: 'Review application and conduct initial phone screening',
				position: 0,
				estimatedTime: 30,
			},
			{
				title: 'Interview',
				type: 'INTERVIEW' as StageType,
				description: 'In-depth interview with hiring manager',
				position: 1,
				estimatedTime: 60,
			},
			{
				title: 'Offer',
				type: 'OFFER' as StageType,
				description: 'Extend job offer to candidate',
				position: 2,
				estimatedTime: 15,
			},
		],
	},
	{
		name: 'Technical (4 stages)',
		icon: <EngineeringIcon />,
		stages: [
			{
				title: 'Application Review',
				type: 'INTERVIEW' as StageType,
				description: 'Review resume and portfolio',
				position: 0,
				estimatedTime: 20,
			},
			{
				title: 'Technical Interview',
				type: 'TECHNICAL_INTERVIEW' as StageType,
				description: 'Coding challenge and technical assessment',
				position: 1,
				estimatedTime: 90,
			},
			{
				title: 'Final Interview',
				type: 'FINAL_INTERVIEW' as StageType,
				description: 'Cultural fit and team interview',
				position: 2,
				estimatedTime: 60,
			},
			{
				title: 'Offer',
				type: 'OFFER' as StageType,
				description: 'Extend job offer to candidate',
				position: 3,
				estimatedTime: 15,
			},
		],
	},
	{
		name: 'Comprehensive (5 stages)',
		icon: <BusinessCenterIcon />,
		stages: [
			{
				title: 'Application Review',
				type: 'INTERVIEW' as StageType,
				description: 'Initial review of application materials',
				position: 0,
				estimatedTime: 15,
			},
			{
				title: 'Phone Screen',
				type: 'INTERVIEW' as StageType,
				description: 'Brief phone conversation to assess basic fit',
				position: 1,
				estimatedTime: 30,
			},
			{
				title: 'Technical Assessment',
				type: 'TECHNICAL_INTERVIEW' as StageType,
				description: 'In-depth technical evaluation with coding exercises',
				position: 2,
				estimatedTime: 120,
			},
			{
				title: 'Onsite Interview',
				type: 'FINAL_INTERVIEW' as StageType,
				description: 'Full-day onsite interviews with team members',
				position: 3,
				estimatedTime: 240,
			},
			{
				title: 'Offer',
				type: 'OFFER' as StageType,
				description: 'Extend final offer and negotiate terms',
				position: 4,
				estimatedTime: 30,
			},
		],
	},
];

/**
 * Reusable component for building and managing stages in a job position.
 * Supports adding, editing, deleting, and reordering stages.
 * Includes templates for quick setup.
 */
const StageBuilder: React.FC<StageBuilderProps> = ({
	stages,
	onChange,
	minStages = 1,
	maxStages,
	error,
}) => {
	const {t} = useTranslation();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
	const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);

	const handleAddStage = (stageData: StageFormData) => {
		const newStage: Omit<Stage, 'uid' | 'status'> = {
			...stageData,
			position: stages.length,
		};
		onChange([...stages, newStage]);
	};

	const handleEditStage = (stageData: StageFormData) => {
		if (editingIndex === null) return;

		const updatedStages = [...stages];
		updatedStages[editingIndex] = {
			...updatedStages[editingIndex],
			...stageData,
		};
		onChange(updatedStages);
		setEditingIndex(null);
	};

	const handleDeleteStage = () => {
		if (deleteIndex === null) return;

		const updatedStages = stages
			.filter((_, index) => index !== deleteIndex)
			.map((stage, index) => ({...stage, position: index}));

		onChange(updatedStages);
		setDeleteIndex(null);
	};

	const handleMoveUp = (index: number) => {
		if (index === 0) return;

		const updatedStages = [...stages];
		[updatedStages[index - 1], updatedStages[index]] = [
			updatedStages[index],
			updatedStages[index - 1],
		];

		onChange(updatedStages.map((stage, i) => ({...stage, position: i})));
	};

	const handleMoveDown = (index: number) => {
		if (index === stages.length - 1) return;

		const updatedStages = [...stages];
		[updatedStages[index], updatedStages[index + 1]] = [
			updatedStages[index + 1],
			updatedStages[index],
		];

		onChange(updatedStages.map((stage, i) => ({...stage, position: i})));
	};

	const handleLoadTemplate = (template: StageTemplate) => {
		onChange(template.stages);
		setTemplateMenuAnchor(null);
	};

	const getTotalEstimatedTime = () => {
		return stages.reduce((total, stage) => total + (stage.estimatedTime || 0), 0);
	};

	const canAddMore = !maxStages || stages.length < maxStages;
	const canDeleteMore = stages.length > minStages;

	return (
		<Box>
			{/* Header with Actions */}
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
				<Box>
					<Typography variant="h6" component="div" gutterBottom>
						{t('stages.builder_title')} {minStages > 0 && <Typography component="span" color="error">*</Typography>}
					</Typography>
					<Typography variant="caption" color="text.secondary">
						{t(stages.length === 1 ? 'stages.stages_configured' : 'stages.stages_configured_plural', {count: stages.length})}
						{stages.length > 0 && ` • ${t('stages.total_time_minutes', {time: getTotalEstimatedTime()})}`}
					</Typography>
				</Box>

				<Stack direction="row" spacing={1}>
					<Button
						size="small"
						startIcon={<AutoFixHighIcon />}
						onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
						disabled={stages.length > 0}
					>
						{t('stages.templates')}
					</Button>
					<Button
						size="small"
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => {
							setEditingIndex(null);
							setDialogOpen(true);
						}}
						disabled={!canAddMore}
					>
						{t('stages.add_stage')}
					</Button>
				</Stack>
			</Box>

			{/* Template Menu */}
			<Menu
				anchorEl={templateMenuAnchor}
				open={Boolean(templateMenuAnchor)}
				onClose={() => setTemplateMenuAnchor(null)}
			>
				{STAGE_TEMPLATES.map((template, index) => (
					<MenuItem key={template.name} onClick={() => handleLoadTemplate(template)}>
						<ListItemIcon>{template.icon}</ListItemIcon>
						<ListItemText>{t(`stages.template_${index === 0 ? 'basic' : index === 1 ? 'technical' : 'comprehensive'}`)}</ListItemText>
					</MenuItem>
				))}
			</Menu>

			<Divider sx={{mb: 2}} />

			{/* Validation Error */}
			{error && (
				<Alert severity="error" sx={{mb: 2}}>
					{error}
				</Alert>
			)}

			{/* Empty State */}
			{stages.length === 0 && (
				<Alert severity="info" sx={{mb: 2}}>
					{t(minStages === 1 ? 'stages.no_stages_message' : 'stages.no_stages_message_plural', {count: minStages})}
				</Alert>
			)}

			{/* Stages List */}
			<Box>
				{stages.map((stage, index) => (
					<Box key={index} sx={{position: 'relative'}}>
						<StageItem
							stage={stage}
							index={index}
							onEdit={() => {
								setEditingIndex(index);
								setDialogOpen(true);
							}}
							onDelete={canDeleteMore ? () => setDeleteIndex(index) : undefined}
							showActions={true}
						/>

						{/* Reorder Buttons */}
						{stages.length > 1 && (
							<Box
								sx={{
									position: 'absolute',
									right: -60,
									top: '50%',
									transform: 'translateY(-50%)',
									display: 'flex',
									flexDirection: 'column',
									gap: 0.5,
								}}
							>
								<Button
									size="small"
									variant="outlined"
									onClick={() => handleMoveUp(index)}
									disabled={index === 0}
									sx={{minWidth: 40, px: 0}}
								>
									↑
								</Button>
								<Button
									size="small"
									variant="outlined"
									onClick={() => handleMoveDown(index)}
									disabled={index === stages.length - 1}
									sx={{minWidth: 40, px: 0}}
								>
									↓
								</Button>
							</Box>
						)}
					</Box>
				))}
			</Box>

			{/* Info about minimum stages */}
			{stages.length < minStages && (
				<Alert severity="warning" sx={{mt: 2}}>
					{t((minStages - stages.length) === 1 ? 'stages.add_more_stages' : 'stages.add_more_stages_plural', {count: minStages - stages.length})}
				</Alert>
			)}

			{/* Add/Edit Stage Dialog */}
			<AddStageDialog
				open={dialogOpen}
				onClose={() => {
					setDialogOpen(false);
					setEditingIndex(null);
				}}
				onSave={editingIndex !== null ? handleEditStage : handleAddStage}
				initialData={editingIndex !== null ? stages[editingIndex] : undefined}
				isEdit={editingIndex !== null}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDeleteDialog
				open={deleteIndex !== null}
				onClose={() => setDeleteIndex(null)}
				onConfirm={handleDeleteStage}
				title={t('stages.delete_stage_title')}
				message={
					deleteIndex !== null
						? t('stages.delete_stage_message', {title: stages[deleteIndex]?.title})
						: ''
				}
			/>
		</Box>
	);
};

export default StageBuilder;
