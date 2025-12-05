import React from 'react';
import { Box, Typography, TextField, Button, Checkbox, FormControlLabel, Link } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { RegistrationFormData } from '../RegistrationWizard';

interface AccountCreationStepProps {
	formData: RegistrationFormData;
	onNext: (data: Partial<RegistrationFormData>) => void;
	onBack: () => void;
}

interface AccountFormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
	termsAccepted: boolean;
}

const AccountCreationStep: React.FC<AccountCreationStepProps> = ({ formData, onNext, onBack }) => {
	const { t } = useTranslation();
	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors },
	} = useForm<AccountFormData>({
		defaultValues: {
			name: formData.name,
			email: formData.email,
			password: formData.password,
			confirmPassword: '',
			termsAccepted: formData.termsAccepted,
		},
	});

	const password = watch('password');

	const onSubmit = (data: AccountFormData) => {
		onNext({
			name: data.name,
			email: data.email,
			password: data.password,
			termsAccepted: data.termsAccepted,
		});
	};

	return (
		<Box>
			<Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
				{t('registration_wizard.account_creation.title')}
			</Typography>
			<Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
				{t('registration_wizard.account_creation.subtitle')}
			</Typography>

			<form onSubmit={handleSubmit(onSubmit)}>
				<TextField
					label={t('auth.name')}
					fullWidth
					margin="normal"
					{...register('name', {
						required: t('validation.name_required'),
						minLength: {
							value: 2,
							message: t('validation.name_min_length', { min: 2 }),
						},
					})}
					error={!!errors.name}
					helperText={errors.name?.message}
				/>

				<TextField
					label={t('auth.email')}
					type="email"
					fullWidth
					margin="normal"
					{...register('email', {
						required: t('validation.email_required'),
						pattern: {
							value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
							message: t('validation.email_invalid'),
						},
					})}
					error={!!errors.email}
					helperText={errors.email?.message}
				/>

				<TextField
					label={t('auth.password')}
					type="password"
					fullWidth
					margin="normal"
					{...register('password', {
						required: t('validation.password_required'),
						minLength: {
							value: 8,
							message: t('validation.password_min_length', { min: 8 }),
						},
					})}
					error={!!errors.password}
					helperText={errors.password?.message}
				/>

				<TextField
					label={t('registration_wizard.account_creation.confirm_password')}
					type="password"
					fullWidth
					margin="normal"
					{...register('confirmPassword', {
						required: t('registration_wizard.account_creation.confirm_password_required'),
						validate: (value) =>
							value === password || t('registration_wizard.account_creation.passwords_must_match'),
					})}
					error={!!errors.confirmPassword}
					helperText={errors.confirmPassword?.message}
				/>

				<Controller
					name="termsAccepted"
					control={control}
					rules={{
						required: t('registration_wizard.account_creation.terms_required'),
					}}
					render={({ field }) => (
						<FormControlLabel
							control={<Checkbox {...field} checked={field.value} />}
							label={
								<Typography variant="body2">
									{t('registration_wizard.account_creation.accept_terms')}{' '}
									<Link href="/terms" target="_blank">
										{t('registration_wizard.account_creation.terms_of_service')}
									</Link>
								</Typography>
							}
							sx={{ mt: 2 }}
						/>
					)}
				/>
				{errors.termsAccepted && (
					<Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
						{errors.termsAccepted.message}
					</Typography>
				)}

				<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
					<Button onClick={onBack}>{t('common.back')}</Button>
					<Button type="submit" variant="contained">
						{t('common.next')}
					</Button>
				</Box>
			</form>
		</Box>
	);
};

export default AccountCreationStep;
