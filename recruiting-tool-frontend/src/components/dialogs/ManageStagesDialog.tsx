// @ts-nocheck
import {useState} from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Box,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {useForm, Controller, useFieldArray} from 'react-hook-form';
import {useBulkCreateStages} from '../../hooks/api/useStages';
import {StageType} from '../../types/stage.types';

interface ManageStagesDialogProps {
	open: boolean;
	onClose: () => void;
	jobPositionUid: string;
	jobPositionTitle: string;
	existingStages?: Array<{
		uid: string;
		title: string;
		type: StageType;
		description: string;
		position: number;
	}>;
}

interface StageFormData {
	title: string;
	type: StageType;
	description: string;
	estimatedTime?: number;
}

interface StagesFormData {
	stages: StageFormData[];
}

const stageTypeLabels: Record<StageType, string> = {
	INTERVIEW: 'Interview',
	TECHNICAL_INTERVIEW: 'Technical Interview',
	FINAL_INTERVIEW: 'Final Interview',
	OFFER: 'Offer',
};

const ManageStagesDialog: React.FC<ManageStagesDialogProps> = ({
	open,
	onClose,
	jobPositionUid,
	jobPositionTitle,
	existingStages = [],
}) => {
	const {
		control,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm<StagesFormData>({
		defaultValues: {
			stages: [
				{
					title: '',
					type: 'INTERVIEW',
					description: '',
					estimatedTime: undefined,
				},
			],
		},
	});

	const {fields, append, remove} = useFieldArray({
		control,
		name: 'stages',
	});

	const {mutate: bulkCreateStages, isPending, isError} = useBulkCreateStages();

	const onSubmit = (data: StagesFormData) => {
		const stagesToCreate = data.stages.map((stage, index) => ({
			...stage,
			jobPositionUid,
			position: existingStages.length + index,
		}));

		bulkCreateStages(stagesToCreate, {
			onSuccess: () => {
				reset();
				onClose();
			},
		});
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const addNewStageField = () => {
		append({
			title: '',
			type: 'INTERVIEW',
			description: '',
			estimatedTime: undefined,
		});
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
			<DialogTitle>Manage Stages - {jobPositionTitle}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					{existingStages.length > 0 && (
						<Box sx={{mb: 3}}>
							<Typography variant="subtitle1" gutterBottom>
								Existing Stages:
							</Typography>
							<List dense>
								{existingStages
									.sort((a, b) => a.position - b.position)
									.map((stage, index) => (
										<ListItem key={stage.uid}>
											<ListItemText
												primary={`${index + 1}. ${stage.title}`}
												secondary={`${stageTypeLabels[stage.type]} - ${stage.description}`}
											/>
										</ListItem>
									))}
							</List>
							<Divider sx={{my: 2}} />
						</Box>
					)}

					<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
						<Typography variant="subtitle1">
							Add New Stages:
						</Typography>
						<Button
							size="small"
							startIcon={<AddIcon />}
							onClick={addNewStageField}
						>
							Add Stage
						</Button>
					</Box>

					{fields.map((field, index) => (
						<Box
							key={field.id}
							sx={{
								mb: 3,
								p: 2,
								border: '1px solid',
								borderColor: 'divider',
								borderRadius: 1,
							}}
						>
							<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
								<Typography variant="subtitle2">
									Stage {existingStages.length + index + 1}
								</Typography>
								{fields.length > 1 && (
									<IconButton
										size="small"
										onClick={() => remove(index)}
										color="error"
									>
										<DeleteIcon />
									</IconButton>
								)}
							</Box>

							<Controller
								name={`stages.${index}.title`}
								control={control}
								rules={{
									required: 'Stage title is required',
									minLength: {
										value: 3,
										message: 'Title must be at least 3 characters',
									},
								}}
								render={({field: controllerField}) => (
									<TextField
										{...controllerField}
										label="Stage Title"
										fullWidth
										margin="normal"
										error={!!errors.stages?.[index]?.title}
										helperText={errors.stages?.[index]?.title?.message}
									/>
								)}
							/>

							<FormControl fullWidth margin="normal">
								<InputLabel>Stage Type</InputLabel>
								<Controller
									name={`stages.${index}.type`}
									control={control}
									rules={{required: 'Stage type is required'}}
									render={({field: controllerField}) => (
										<Select
											{...controllerField}
											label="Stage Type"
											error={!!errors.stages?.[index]?.type}
										>
											<MenuItem value="INTERVIEW">Interview</MenuItem>
											<MenuItem value="TECHNICAL_INTERVIEW">
												Technical Interview
											</MenuItem>
											<MenuItem value="FINAL_INTERVIEW">
												Final Interview
											</MenuItem>
											<MenuItem value="OFFER">Offer</MenuItem>
										</Select>
									)}
								/>
								{errors.stages?.[index]?.type && (
									<Typography color="error" variant="caption">
										{errors.stages?.[index]?.type?.message}
									</Typography>
								)}
							</FormControl>

							<Controller
								name={`stages.${index}.description`}
								control={control}
								rules={{
									required: 'Description is required',
									maxLength: {
										value: 500,
										message: 'Description must be less than 500 characters',
									},
								}}
								render={({field: controllerField}) => (
									<TextField
										{...controllerField}
										label="Description"
										fullWidth
										multiline
										rows={2}
										margin="normal"
										error={!!errors.stages?.[index]?.description}
										helperText={errors.stages?.[index]?.description?.message}
									/>
								)}
							/>

							<Controller
								name={`stages.${index}.estimatedTime`}
								control={control}
								render={({field: controllerField}) => (
									<TextField
										{...controllerField}
										label="Estimated Time (minutes)"
										type="number"
										fullWidth
										margin="normal"
										onChange={(e) => {
											const value = e.target.value;
											controllerField.onChange(value ? parseInt(value) : undefined);
										}}
									/>
								)}
							/>
						</Box>
					))}

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							Failed to create stages. Please try again.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						Cancel
					</Button>
					<Button type="submit" variant="contained" disabled={isPending}>
						{isPending ? 'Creating...' : 'Create Stages'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default ManageStagesDialog;
