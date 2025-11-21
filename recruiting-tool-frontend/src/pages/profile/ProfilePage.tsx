import {
	Box,
	Typography,
	Card,
	CardContent,
	Button,
	Chip,
	TextField,
	Divider,
	Grid,
} from '@mui/material';
import {Save as SaveIcon, Refresh as RefreshIcon} from '@mui/icons-material';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useForm} from 'react-hook-form';
import {UpdateUserDto} from '../../types/user.types';
import {useUpdateUser} from '../../hooks/api/useUsers';
import {useEffect} from 'react';
import ProfilePictureUpload from '../../components/user/ProfilePictureUpload';

const ProfilePage: React.FC = () => {
	const {user} = useUserAtom();
	const {mutate: updateUser, isPending} = useUpdateUser();

	const {
		register,
		handleSubmit,
		formState: {errors, isDirty},
		reset,
		watch,
	} = useForm<UpdateUserDto>({
		defaultValues: {
			name: user?.name || '',
			email: user?.email || '',
			phoneNumber: user?.phoneNumber || '',
			position: user?.position || '',
			department: user?.department || '',
			bio: user?.bio || '',
			linkedinUrl: user?.linkedinUrl || '',
			timezone: user?.timezone || '',
			profilePicture: user?.profilePicture || '',
		},
	});

	// Reset form when user data changes (e.g., after successful update)
	useEffect(() => {
		if (user) {
			reset({
				name: user.name,
				email: user.email,
				phoneNumber: user.phoneNumber || '',
				position: user.position || '',
				department: user.department || '',
				bio: user.bio || '',
				linkedinUrl: user.linkedinUrl || '',
				timezone: user.timezone || '',
				profilePicture: user.profilePicture || '',
			});
		}
	}, [user, reset]);

	const watchedName = watch('name');

	const onSubmit = (data: UpdateUserDto) => {
		if (!user) return;

		// Remove empty strings and convert to undefined
		const cleanedData: UpdateUserDto = Object.entries(data).reduce(
			(acc, [key, value]) => {
				if (value !== '' && value !== undefined) {
					acc[key as keyof UpdateUserDto] = value;
				}
				return acc;
			},
			{} as UpdateUserDto
		);

		updateUser({uid: user.uid, data: cleanedData});
	};

	const handleReset = () => {
		if (user) {
			reset({
				name: user.name,
				email: user.email,
				phoneNumber: user.phoneNumber || '',
				position: user.position || '',
				department: user.department || '',
				bio: user.bio || '',
				linkedinUrl: user.linkedinUrl || '',
				timezone: user.timezone || '',
				profilePicture: user.profilePicture || '',
			});
		}
	};

	if (!user) {
		return (
			<Box sx={{mt: 8, p: 4}}>
				<Typography variant="h5" color="error">
					No user data available
				</Typography>
			</Box>
		);
	}

	return (
		<Box component="form" sx={{mt: 8}} onSubmit={handleSubmit(onSubmit)}>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 3,
				}}
			>
				<Typography variant="h4">My Profile</Typography>
				<Box sx={{display: 'flex', gap: 1}}>
					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={handleReset}
						disabled={!isDirty || isPending}
					>
						Reset
					</Button>
					<Button
						type="submit"
						variant="contained"
						startIcon={<SaveIcon />}
						disabled={!isDirty || isPending}
					>
						{isPending ? 'Saving...' : 'Update Profile'}
					</Button>
				</Box>
			</Box>

			<Grid container spacing={3}>
				{/* Profile Overview Card */}
				<Grid size={{xs: 12, md: 4}}>
					<Card>
						<CardContent
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								p: 4,
							}}
						>
							<ProfilePictureUpload
								currentPicture={
									user.profilePicture
										? user.profilePicture.startsWith('http')
											? user.profilePicture
											: `${import.meta.env.VITE_API_URL}/files/${
													user.profilePicture
											  }/view`
										: undefined
								}
								userName={watchedName || user.name}
								onUploadSuccess={(_fileUrl, fileUid) => {
									// Store file UID instead of signed URL
									console.log('Image uploaded with UID:', fileUid);
									updateUser(
										{
											uid: user.uid,
											data: {profilePicture: fileUid},
										},
										{
											onSuccess: () => {
												console.log(
													'Profile picture updated successfully with UID!'
												);
											},
											onError: (error) => {
												console.error(
													'Failed to update profile picture:',
													error
												);
											},
										}
									);
								}}
								onRemove={() => {
									// Automatically remove profile picture from user profile
									console.log('Removing profile picture');
									updateUser(
										{
											uid: user.uid,
											data: {profilePicture: ''},
										},
										{
											onSuccess: () => {
												console.log('Profile picture removed successfully!');
											},
											onError: (error) => {
												console.error(
													'Failed to remove profile picture:',
													error
												);
											},
										}
									);
								}}
							/>
							<Typography variant="h5" gutterBottom sx={{mt: 2}}>
								{watchedName || user.name}
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{user.email}
							</Typography>
							<Box
								sx={{
									mt: 2,
									display: 'flex',
									gap: 1,
									flexWrap: 'wrap',
									justifyContent: 'center',
								}}
							>
								{user.roles.map((role) => (
									<Chip
										key={role}
										label={role}
										size="small"
										color="primary"
										variant="outlined"
									/>
								))}
							</Box>
						</CardContent>
					</Card>
				</Grid>

				{/* Profile Edit Form Card */}
				<Grid size={{xs: 12, md: 8}}>
					<Card>
						<CardContent sx={{p: 3}}>
							{/* Basic Information Section */}
							<Box sx={{mb: 4}}>
								<Typography
									variant="h6"
									sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}
								>
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
											size="small"
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
											size="small"
										/>
									</Grid>

									<Grid size={{xs: 12}}>
										<TextField
											fullWidth
											label="Phone Number"
											placeholder="+1-555-0123"
											{...register('phoneNumber')}
											variant="outlined"
											size="small"
										/>
									</Grid>
								</Grid>
							</Box>

							<Divider sx={{my: 3}} />

							{/* Professional Information Section */}
							<Box sx={{mb: 4}}>
								<Typography
									variant="h6"
									sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}
								>
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
											size="small"
										/>
									</Grid>

									<Grid size={{xs: 12, sm: 6}}>
										<TextField
											fullWidth
											label="Department"
											placeholder="e.g., Human Resources"
											{...register('department')}
											variant="outlined"
											size="small"
										/>
									</Grid>
								</Grid>
							</Box>

							<Divider sx={{my: 3}} />

							{/* Additional Information Section */}
							<Box sx={{mb: 4}}>
								<Typography
									variant="h6"
									sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}
								>
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
											size="small"
										/>
									</Grid>

									<Grid size={{xs: 12, sm: 6}}>
										<TextField
											fullWidth
											label="LinkedIn Profile"
											placeholder="https://linkedin.com/in/username"
											{...register('linkedinUrl')}
											variant="outlined"
											size="small"
										/>
									</Grid>
								</Grid>
							</Box>

							<Divider sx={{my: 3}} />

							{/* Bio Section */}
							<Box>
								<Typography
									variant="h6"
									sx={{mb: 2, fontWeight: 600, color: 'primary.main'}}
								>
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
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ProfilePage;
