import React from 'react';
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
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {StageType, STAGE_TYPE_LABELS} from '../../types/stage.types';

interface AddStageDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (stage: StageFormData) => void;
	initialData?: Partial<StageFormData>;
	isEdit?: boolean;
}

export interface StageFormData {
	title: string;
	type: StageType;
	description: string;
	estimatedTime?: number;
}

/**
 * Dialog for adding or editing a single stage.
 * Used within the StageBuilder component for inline stage management.
 */
const AddStageDialog: React.FC<AddStageDialogProps> = ({
	open,
	onClose,
	onSave,
	initialData,
	isEdit = false,
}) => {
	const {
		control,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm<StageFormData>({
		defaultValues: initialData || {
			title: '',
			type: 'INTERVIEW',
			description: '',
			estimatedTime: undefined,
		},
	});

	const onSubmit = (data: StageFormData) => {
		onSave(data);
		reset();
		onClose();
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	React.useEffect(() => {
		if (open && initialData) {
			reset(initialData);
		}
	}, [open, initialData, reset]);

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>{isEdit ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Controller
						name="title"
						control={control}
						rules={{
							required: 'Stage title is required',
							minLength: {
								value: 2,
								message: 'Title must be at least 2 characters',
							},
							maxLength: {
								value: 100,
								message: 'Title must be less than 100 characters',
							},
						}}
						render={({field}) => (
							<TextField
								{...field}
								label="Stage Title"
								fullWidth
								margin="normal"
								error={!!errors.title}
								helperText={errors.title?.message}
								placeholder="e.g., Initial Screening"
							/>
						)}
					/>

					<FormControl fullWidth margin="normal">
						<InputLabel>Stage Type</InputLabel>
						<Controller
							name="type"
							control={control}
							rules={{required: 'Stage type is required'}}
							render={({field}) => (
								<Select
									{...field}
									label="Stage Type"
									error={!!errors.type}
								>
									{Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
										<MenuItem key={value} value={value}>
											{label}
										</MenuItem>
									))}
								</Select>
							)}
						/>
						{errors.type && (
							<Typography color="error" variant="caption" sx={{mt: 0.5, ml: 2}}>
								{errors.type.message}
							</Typography>
						)}
					</FormControl>

					<Controller
						name="description"
						control={control}
						rules={{
							required: 'Description is required',
							minLength: {
								value: 10,
								message: 'Description must be at least 10 characters',
							},
							maxLength: {
								value: 500,
								message: 'Description must be less than 500 characters',
							},
						}}
						render={({field}) => (
							<TextField
								{...field}
								label="Description"
								fullWidth
								multiline
								rows={3}
								margin="normal"
								error={!!errors.description}
								helperText={errors.description?.message}
								placeholder="Describe what happens in this stage..."
							/>
						)}
					/>

					<Controller
						name="estimatedTime"
						control={control}
						rules={{
							min: {
								value: 1,
								message: 'Estimated time must be at least 1 minute',
							},
							max: {
								value: 10080,
								message: 'Estimated time must be less than 10080 minutes (1 week)',
							},
						}}
						render={({field}) => (
							<TextField
								{...field}
								label="Estimated Time (minutes)"
								type="number"
								fullWidth
								margin="normal"
								error={!!errors.estimatedTime}
								helperText={
									errors.estimatedTime?.message ||
									'Optional: Approximate time to complete this stage'
								}
								onChange={(e) => {
									const value = e.target.value;
									field.onChange(value ? parseInt(value) : undefined);
								}}
								value={field.value || ''}
							/>
						)}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button type="submit" variant="contained">
						{isEdit ? 'Update Stage' : 'Add Stage'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default AddStageDialog;
