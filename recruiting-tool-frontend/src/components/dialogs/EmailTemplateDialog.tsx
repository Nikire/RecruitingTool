import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	FormControlLabel,
	Checkbox,
	Box,
	Chip,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useCreateEmailTemplate, useUpdateEmailTemplate} from '../../hooks/api/useEmailTemplates';
import {useValidationRules} from '../../utils/validation';
import FormErrorSummary from '../common/FormErrorSummary';
import {EmailTemplate, CreateEmailTemplateDto, UpdateEmailTemplateDto} from '../../types/emailTemplate.types';
import {useEffect} from 'react';

interface EmailTemplateDialogProps {
	open: boolean;
	onClose: () => void;
	template?: EmailTemplate; // If provided, it's an update dialog
}

interface EmailTemplateFormData {
	name: string;
	subject: string;
	body: string;
	isDefault: boolean;
}

const AVAILABLE_VARIABLES = [
	{key: '{{candidateName}}', label: 'candidateName'},
	{key: '{{positionTitle}}', label: 'positionTitle'},
	{key: '{{companyName}}', label: 'companyName'},
	{key: '{{hrName}}', label: 'hrName'},
	{key: '{{interviewDate}}', label: 'interviewDate'},
	{key: '{{interviewTime}}', label: 'interviewTime'},
	{key: '{{meetingLink}}', label: 'meetingLink'},
];

const EmailTemplateDialog: React.FC<EmailTemplateDialogProps> = ({
	open,
	onClose,
	template,
}) => {
	const {t} = useTranslation();
	const validationRules = useValidationRules();
	const isUpdate = !!template;

	const {
		register,
		handleSubmit,
		reset,
		setValue,
		formState: {errors},
	} = useForm<EmailTemplateFormData>({
		defaultValues: {
			name: '',
			subject: '',
			body: '',
			isDefault: false,
		},
	});

	const {mutate: createTemplate, isPending: isCreating} = useCreateEmailTemplate();
	const {mutate: updateTemplate, isPending: isUpdating} = useUpdateEmailTemplate();
	const isPending = isCreating || isUpdating;

	useEffect(() => {
		if (template) {
			reset({
				name: template.name,
				subject: template.subject,
				body: template.body,
				isDefault: template.isDefault,
			});
		} else {
			reset({
				name: '',
				subject: '',
				body: '',
				isDefault: false,
			});
		}
	}, [template, reset]);

	const onSubmit = (data: EmailTemplateFormData) => {
		if (isUpdate) {
			const updateData: UpdateEmailTemplateDto = {
				name: data.name,
				subject: data.subject,
				body: data.body,
				isDefault: data.isDefault,
			};
			updateTemplate({uid: template!.uid, data: updateData}, {
				onSuccess: () => {
					reset();
					onClose();
				},
			});
		} else {
			const createData: CreateEmailTemplateDto = {
				name: data.name,
				subject: data.subject,
				body: data.body,
				isDefault: data.isDefault,
			};
			createTemplate(createData, {
				onSuccess: () => {
					reset();
					onClose();
				},
			});
		}
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const insertVariable = (variable: string) => {
		// Get current body value and append variable
		const bodyField = document.querySelector<HTMLTextAreaElement>('[name="body"]');
		if (bodyField) {
			const cursorPos = bodyField.selectionStart;
			const currentValue = bodyField.value;
			const newValue =
				currentValue.substring(0, cursorPos) +
				variable +
				currentValue.substring(cursorPos);
			setValue('body', newValue);
			// Re-focus and set cursor position after the inserted variable
			setTimeout(() => {
				bodyField.focus();
				bodyField.setSelectionRange(cursorPos + variable.length, cursorPos + variable.length);
			}, 0);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
			aria-labelledby="email-template-dialog-title"
		>
			<DialogTitle id="email-template-dialog-title">
				{isUpdate ? t('email_templates.update_title') : t('email_templates.create_title')}
			</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<FormErrorSummary errors={errors} />

					<TextField
						label={t('email_templates.name_label')}
						placeholder={t('email_templates.name_placeholder')}
						fullWidth
						margin="normal"
						{...register(
							'name',
							validationRules.combine(
								validationRules.required(t('email_templates.name_label')),
								validationRules.minLength(3),
								validationRules.maxLength(200)
							)
						)}
						error={!!errors.name}
						helperText={errors.name?.message}
					/>

					<TextField
						label={t('email_templates.subject_label')}
						placeholder={t('email_templates.subject_placeholder')}
						fullWidth
						margin="normal"
						{...register(
							'subject',
							validationRules.combine(
								validationRules.required(t('email_templates.subject_label')),
								validationRules.minLength(3),
								validationRules.maxLength(500)
							)
						)}
						error={!!errors.subject}
						helperText={errors.subject?.message}
					/>

					<Box sx={{my: 2}}>
						<Typography variant="body2" color="textSecondary" sx={{mb: 1}}>
							{t('email_templates.variable_helper')}
						</Typography>
						<Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
							{AVAILABLE_VARIABLES.map((variable) => (
								<Chip
									key={variable.key}
									label={variable.key}
									size="small"
									onClick={() => insertVariable(variable.key)}
									sx={{cursor: 'pointer'}}
								/>
							))}
						</Box>
					</Box>

					<TextField
						label={t('email_templates.body_label')}
						placeholder={t('email_templates.body_placeholder')}
						fullWidth
						margin="normal"
						multiline
						rows={8}
						{...register(
							'body',
							validationRules.required(t('email_templates.body_label'))
						)}
						error={!!errors.body}
						helperText={errors.body?.message}
					/>

					<FormControlLabel
						control={
							<Checkbox
								{...register('isDefault')}
							/>
						}
						label={
							<Box>
								<Typography variant="body2">{t('email_templates.is_default_label')}</Typography>
								<Typography variant="caption" color="textSecondary">
									{t('email_templates.is_default_hint')}
								</Typography>
							</Box>
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						{t('common.cancel')}
					</Button>
					<Button type="submit" variant="contained" disabled={isPending}>
						{isPending
							? isUpdate
								? t('common.updating')
								: t('common.creating')
							: isUpdate
								? t('common.update')
								: t('common.create')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default EmailTemplateDialog;
