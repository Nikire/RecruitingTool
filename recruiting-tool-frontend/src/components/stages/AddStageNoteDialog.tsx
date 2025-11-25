import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Typography,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useCreateStageNote} from '../../hooks/api/useStages';
import {CreateStageNoteDto} from '../../types/stage.types';

interface AddStageNoteDialogProps {
	open: boolean;
	onClose: () => void;
	stageUid: string;
}

const AddStageNoteDialog: React.FC<AddStageNoteDialogProps> = ({
	open,
	onClose,
	stageUid,
}) => {
	const {t} = useTranslation();
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm<CreateStageNoteDto>();

	const {mutate: createNote, isPending, isError} = useCreateStageNote();

	const onSubmit = (data: CreateStageNoteDto) => {
		createNote(
			{stageUid, data},
			{
				onSuccess: () => {
					reset();
					onClose();
				},
			}
		);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>{t('stage_notes.add_note')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<TextField
						label={t('stage_notes.note_content')}
						placeholder={t('stage_notes.note_placeholder')}
						fullWidth
						multiline
						rows={6}
						margin="normal"
						{...register('content', {
							required: t('stage_notes.validation_required'),
							minLength: {
								value: 10,
								message: t('stage_notes.validation_min_length', {min: 10}),
							},
							maxLength: {
								value: 2000,
								message: t('stage_notes.validation_max_length', {max: 2000}),
							},
						})}
						error={!!errors.content}
						helperText={errors.content?.message}
					/>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							{t('errors.create_failed', {entity: 'note'})}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						{t('stage_notes.cancel')}
					</Button>
					<Button type="submit" variant="contained" disabled={isPending}>
						{isPending ? t('common.creating') : t('stage_notes.save_note')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default AddStageNoteDialog;
