import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Button,
	Typography,
	Box,
} from '@mui/material';
import {useForm} from 'react-hook-form';
import {useUpdateUser} from '../../hooks/api/useUsers';
import {User} from '../../types/user.types';
import {useEffect} from 'react';

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
}

const UpdateUserDialog: React.FC<UpdateUserDialogProps> = ({
	open,
	onClose,
	user,
}) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm<UserFormData>({
		defaultValues: {
			name: '',
			email: '',
			password: '',
			companyUid: '',
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
			});
		}
	}, [user, reset]);

	const onSubmit = (data: UserFormData) => {
		if (!user) return;

		// Don't send password if it's empty
		const updateData: any = {
			name: data.name,
			email: data.email,
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
			<DialogTitle>Update User</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
						<TextField
							label="User Name"
							fullWidth
							{...register('name', {
								required: 'Name is required',
								minLength: {
									value: 2,
									message: 'Name must be at least 2 characters',
								},
								maxLength: {
									value: 100,
									message: 'Name must be less than 100 characters',
								},
							})}
							error={!!errors.name}
							helperText={errors.name?.message}
						/>

						<TextField
							label="Email"
							type="email"
							fullWidth
							{...register('email', {
								required: 'Email is required',
								pattern: {
									value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
									message: 'Invalid email address',
								},
							})}
							error={!!errors.email}
							helperText={errors.email?.message}
						/>

						<TextField
							label="Password (leave empty to keep current)"
							type="password"
							fullWidth
							{...register('password', {
								minLength: {
									value: 3,
									message: 'Password must be at least 3 characters',
								},
								maxLength: {
									value: 20,
									message: 'Password must be less than 20 characters',
								},
							})}
							error={!!errors.password}
							helperText={errors.password?.message || 'Leave empty to keep current password'}
						/>

						<TextField
							label="Company UID (optional)"
							fullWidth
							{...register('companyUid')}
							helperText="Enter company UID to assign user to a company"
						/>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							Failed to update user. Please try again.
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} disabled={isPending}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isPending}
					>
						{isPending ? 'Updating...' : 'Update'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateUserDialog;
