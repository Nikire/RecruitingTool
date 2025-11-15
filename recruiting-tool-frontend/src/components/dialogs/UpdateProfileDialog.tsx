import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Divider, Grid} from '@mui/material';
import {useForm} from 'react-hook-form';
import {User, UpdateUserDto} from '../../types/user.types';
import {useUpdateUser} from '../../hooks/api/useUsers';

interface UpdateProfileDialogProps {
	open: boolean;
	onClose: () => void;
	user: User;
}

const UpdateProfileDialog: React.FC<UpdateProfileDialogProps> = ({open, onClose, user}) => {
	const {mutate: updateUser, isPending} = useUpdateUser();

	const {
		register,
		handleSubmit,
		formState: {errors},
		reset,
	} = useForm<UpdateUserDto>({
		defaultValues: {
			name: user.name,
			email: user.email,
			phoneNumber: user.phoneNumber || '',
			position: user.position || '',
			department: user.department || '',
			bio: user.bio || '',
			linkedinUrl: user.linkedinUrl || '',
			timezone: user.timezone || '',
			profilePicture: user.profilePicture || '',
		},
	});

	const onSubmit = (data: UpdateUserDto) => {
		// Remove empty strings and convert to undefined
		const cleanedData: UpdateUserDto = Object.entries(data).reduce((acc, [key, value]) => {
			if (value !== '' && value !== undefined) {
				acc[key as keyof UpdateUserDto] = value;
			}
			return acc;
		}, {} as UpdateUserDto);

		updateUser(
			{uid: user.uid, data: cleanedData},
			{
				onSuccess: () => {
					// Cache invalidation in useUpdateUser will automatically refresh user data
					handleClose();
				},
			}
		);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{sx: {borderRadius: 2}}}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogTitle sx={{pb: 1}}>
					<Typography variant="h5" component="div" sx={{fontWeight: 600}}>
						Edit Profile
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{mt: 0.5}}>
						Update your personal and professional information
					</Typography>
				</DialogTitle>
				<Divider />
				<DialogContent sx={{pt: 3, pb: 2}}>
					{/* Basic Information Section */}
					<Box sx={{mb: 4}}>
						<Typography variant="h6" sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}>
							Basic Information
						</Typography>
						<Grid container spacing={2.5}>
							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="Full Name"
									{...register('name', {required: 'Name is required'})}
									error={!!errors.name}
									helperText={errors.name?.message}
									variant="outlined"
								/>
							</Grid>

							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="Email Address"
									type="email"
									{...register('email', {
										required: 'Email is required',
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: 'Invalid email address',
										},
									})}
									error={!!errors.email}
									helperText={errors.email?.message}
									variant="outlined"
								/>
							</Grid>

							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="Phone Number"
									placeholder="+1-555-0123"
									{...register('phoneNumber')}
									variant="outlined"
								/>
							</Grid>

							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="Profile Picture URL"
									placeholder="https://example.com/avatar.jpg"
									{...register('profilePicture')}
									variant="outlined"
								/>
							</Grid>
						</Grid>
					</Box>

					{/* Professional Information Section */}
					<Box sx={{mb: 4}}>
						<Typography variant="h6" sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}>
							Professional Information
						</Typography>
						<Grid container spacing={2.5}>
							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="Position"
									placeholder="e.g., Senior HR Manager"
									{...register('position')}
									variant="outlined"
								/>
							</Grid>

							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="Department"
									placeholder="e.g., Human Resources"
									{...register('department')}
									variant="outlined"
								/>
							</Grid>
						</Grid>
					</Box>

					{/* Additional Information Section */}
					<Box sx={{mb: 4}}>
						<Typography variant="h6" sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}>
							Additional Information
						</Typography>
						<Grid container spacing={2.5}>
							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="Timezone"
									placeholder="e.g., America/New_York"
									{...register('timezone')}
									variant="outlined"
								/>
							</Grid>

							<Grid size={{xs: 12, sm: 6}}>
								<TextField
									fullWidth
									label="LinkedIn Profile"
									placeholder="https://linkedin.com/in/username"
									{...register('linkedinUrl')}
									variant="outlined"
								/>
							</Grid>
						</Grid>
					</Box>

					{/* Bio Section - Separated */}
					<Box>
						<Typography variant="h6" sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}>
							About You
						</Typography>
						<TextField
							fullWidth
							label="Bio"
							placeholder="Tell us about yourself, your experience, and what you're passionate about..."
							multiline
							rows={6}
							{...register('bio')}
							variant="outlined"
						/>
					</Box>
				</DialogContent>
				<Divider />
				<DialogActions sx={{px: 3, py: 2}}>
					<Button onClick={handleClose} disabled={isPending} size="large">
						Cancel
					</Button>
					<Button type="submit" variant="contained" disabled={isPending} size="large">
						{isPending ? 'Saving...' : 'Save Changes'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default UpdateProfileDialog;
