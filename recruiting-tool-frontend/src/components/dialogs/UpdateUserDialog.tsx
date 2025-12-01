import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	Box,
	CircularProgress,
	Checkbox,
	FormControl,
	FormLabel,
	FormGroup,
	FormControlLabel,
	FormHelperText,
} from '@mui/material';
import {useForm, Controller} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useUpdateUser} from '../../hooks/api/useUsers';
import {User, UserRoles} from '../../types/user.types';
import {useEffect} from 'react';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {hasRole} from '../../utils/permissions';

interface UpdateUserDialogProps {
	open: boolean;
	onClose: () => void;
	user: User | null;
}

interface UserFormData {
	name: string;
	email: string;
	password?: string;
	companyUid?: string;
	roles: UserRoles[];
}

const UpdateUserDialog: React.FC<UpdateUserDialogProps> = ({
	open,
	onClose,
	user,
}) => {
	const {t} = useTranslation();
	const {user: currentUser} = useUserAtom();
	const isSuperAdmin = hasRole(currentUser, UserRoles.SUPER_ADMIN);

	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: {errors},
	} = useForm<UserFormData>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			companyUid: '',
			roles: [UserRoles.USER],
		},
	});

	const {mutate: updateUser, isPending, isError} = useUpdateUser();

	// Update form values when user changes
	useEffect(() => {
		if (user) {
			reset({
				name: user.name,
				email: user.email,
				password: '',
				companyUid: user.company?.uid || '',
				roles: user.roles || [UserRoles.USER],
			});
		}
	}, [user, reset]);

	const availableRoles = [
		{value: UserRoles.USER, label: t('user_roles.user')},
		{value: UserRoles.HR, label: t('user_roles.hr')},
		{value: UserRoles.ADMIN, label: t('user_roles.admin')},
	];

	// Only SUPER_ADMIN can assign SUPER_ADMIN role
	if (isSuperAdmin) {
		availableRoles.push({value: UserRoles.SUPER_ADMIN, label: t('user_roles.super_admin')});
	}

	const onSubmit = (data: UserFormData) => {
		if (!user) return;

		// Don't send password if it's empty
		const updateData: any = {
			name: data.name,
			email: data.email,
			roles: data.roles,
		};

		if (data.password && data.password.trim() !== '') {
			updateData.password = data.password;
		}

		if (data.companyUid && data.companyUid.trim() !== '') {
			updateData.companyUid = data.companyUid;
		}

		updateUser(
			{uid: user.uid, data: updateData},
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
			<DialogTitle>{t('users.update_title')}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
						<TextField
							label={t('users.name_label')}
							fullWidth
							{...register('name', {
								required: t('validation.name_required'),
								minLength: {
									value: 2,
									message: t('validation.name_min_length', {min: 2}),
								},
								maxLength: {
									value: 100,
									message: t('validation.name_max_length', {max: 100}),
								},
							})}
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<TextField
							label={t('users.email_label')}
							type="email"
							fullWidth
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
							label={t('users.password_optional')}
							type="password"
							fullWidth
							{...register('password', {
								minLength: {
									value: 3,
									message: t('validation.password_min_length', {min: 3}),
								},
								maxLength: {
									value: 20,
									message: t('validation.password_max_length', {max: 20}),
								},
							})}
							error={!!errors.password}
							helperText={errors.password?.message || t('users.password_helper')}
						/>

						<FormControl component="fieldset" error={!!errors.roles}>
							<FormLabel component="legend">{t('users.roles_label')}</FormLabel>
							<FormGroup>
								{availableRoles.map((role) => (
									<Controller
										key={role.value}
										name="roles"
										control={control}
										rules={{
											validate: (value) =>
												value.length > 0 || t('users.roles_required'),
										}}
										render={({field}) => (
											<FormControlLabel
												control={
													<Checkbox
														checked={field.value?.includes(role.value)}
														onChange={(e) => {
															const newValue = e.target.checked
																? [...(field.value || []), role.value]
																: field.value?.filter((r) => r !== role.value);
															field.onChange(newValue);
														}}
													/>
												}
												label={role.label}
											/>
										)}
									/>
								))}
							</FormGroup>
							{errors.roles && <FormHelperText>{errors.roles.message}</FormHelperText>}
						</FormControl>

						<TextField
							label={t('users.company_uid_label')}
							fullWidth
							{...register('companyUid')}
							helperText={t('users.company_uid_helper')}
						/>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							{t('errors.update_failed', {entity: t('users.title').toLowerCase()})}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						{t('common.cancel')}
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isPending}
						startIcon={isPending ? <CircularProgress size={20} color="inherit" /> : undefined}
					>
						{isPending ? t('common.updating') : t('common.update')}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateUserDialog;
