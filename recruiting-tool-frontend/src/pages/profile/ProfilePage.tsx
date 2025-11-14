import {Box, Typography, Card, CardContent, Grid, Avatar, Button, Chip} from '@mui/material';
import {Edit as EditIcon, LinkedIn as LinkedInIcon, Phone as PhoneIcon, Work as WorkIcon, Business as BusinessIcon, Schedule as ScheduleIcon} from '@mui/icons-material';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {useState} from 'react';
import UpdateProfileDialog from '../../components/dialogs/UpdateProfileDialog';

const ProfilePage: React.FC = () => {
	const {user} = useUserAtom();
	const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

	if (!user) {
		return (
			<Box sx={{p: 4}}>
				<Typography variant="h5" color="error">
					No user data available
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
				<Typography variant="h4">My Profile</Typography>
				<Button variant="contained" startIcon={<EditIcon />} onClick={() => setOpenUpdateDialog(true)}>
					Edit Profile
				</Button>
			</Box>

			<Grid container spacing={3}>
				{/* Profile Overview Card */}
				<Grid item xs={12} md={4}>
					<Card>
						<CardContent sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4}}>
							<Avatar
								src={user.profilePicture}
								alt={user.name}
								sx={{width: 120, height: 120, mb: 2, fontSize: '3rem'}}
							>
								{user.name.charAt(0).toUpperCase()}
							</Avatar>
							<Typography variant="h5" gutterBottom>
								{user.name}
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{user.email}
							</Typography>
							<Typography variant="body1" color={user.position ? 'primary' : 'text.disabled'} sx={{mt: 1, fontStyle: user.position ? 'normal' : 'italic'}}>
								{user.position || 'No position set'}
							</Typography>
							<Typography variant="body2" color={user.department ? 'text.secondary' : 'text.disabled'} sx={{fontStyle: user.department ? 'normal' : 'italic'}}>
								{user.department || 'No department set'}
							</Typography>
							<Box sx={{mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center'}}>
								{user.roles.map((role) => (
									<Chip key={role} label={role} size="small" color="primary" variant="outlined" />
								))}
							</Box>
						</CardContent>
					</Card>
				</Grid>

				{/* Profile Details Card */}
				<Grid item xs={12} md={8}>
					<Card>
						<CardContent>
							<Typography variant="h6" gutterBottom>
								Profile Information
							</Typography>

							<Grid container spacing={2} sx={{mt: 1}}>
								<Grid item xs={12} sm={6}>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
										<PhoneIcon color={user.phoneNumber ? 'action' : 'disabled'} />
										<Box>
											<Typography variant="caption" color="text.secondary">
												Phone Number
											</Typography>
											<Typography variant="body1" color={user.phoneNumber ? 'text.primary' : 'text.disabled'} sx={{fontStyle: user.phoneNumber ? 'normal' : 'italic'}}>
												{user.phoneNumber || 'No phone number'}
											</Typography>
										</Box>
									</Box>
								</Grid>

								<Grid item xs={12} sm={6}>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
										<BusinessIcon color={user.company ? 'action' : 'disabled'} />
										<Box>
											<Typography variant="caption" color="text.secondary">
												Company
											</Typography>
											<Typography variant="body1" color={user.company ? 'text.primary' : 'text.disabled'} sx={{fontStyle: user.company ? 'normal' : 'italic'}}>
												{user.company?.name || 'No company assigned'}
											</Typography>
										</Box>
									</Box>
								</Grid>

								<Grid item xs={12} sm={6}>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
										<WorkIcon color={user.position ? 'action' : 'disabled'} />
										<Box>
											<Typography variant="caption" color="text.secondary">
												Position
											</Typography>
											<Typography variant="body1" color={user.position ? 'text.primary' : 'text.disabled'} sx={{fontStyle: user.position ? 'normal' : 'italic'}}>
												{user.position || 'No position set'}
											</Typography>
										</Box>
									</Box>
								</Grid>

								<Grid item xs={12} sm={6}>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
										<BusinessIcon color={user.department ? 'action' : 'disabled'} />
										<Box>
											<Typography variant="caption" color="text.secondary">
												Department
											</Typography>
											<Typography variant="body1" color={user.department ? 'text.primary' : 'text.disabled'} sx={{fontStyle: user.department ? 'normal' : 'italic'}}>
												{user.department || 'No department set'}
											</Typography>
										</Box>
									</Box>
								</Grid>

								<Grid item xs={12} sm={6}>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
										<ScheduleIcon color={user.timezone ? 'action' : 'disabled'} />
										<Box>
											<Typography variant="caption" color="text.secondary">
												Timezone
											</Typography>
											<Typography variant="body1" color={user.timezone ? 'text.primary' : 'text.disabled'} sx={{fontStyle: user.timezone ? 'normal' : 'italic'}}>
												{user.timezone || 'No timezone set'}
											</Typography>
										</Box>
									</Box>
								</Grid>

								<Grid item xs={12} sm={6}>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
										<LinkedInIcon color={user.linkedinUrl ? 'action' : 'disabled'} />
										<Box>
											<Typography variant="caption" color="text.secondary">
												LinkedIn
											</Typography>
											{user.linkedinUrl ? (
												<Typography
													variant="body1"
													component="a"
													href={user.linkedinUrl}
													target="_blank"
													rel="noopener noreferrer"
													sx={{color: 'primary.main', textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}
												>
													View Profile
												</Typography>
											) : (
												<Typography variant="body1" color="text.disabled" sx={{fontStyle: 'italic'}}>
													No LinkedIn URL
												</Typography>
											)}
										</Box>
									</Box>
								</Grid>

								<Grid item xs={12}>
									<Box sx={{mt: 2}}>
										<Typography variant="caption" color="text.secondary">
											Bio
										</Typography>
										<Typography variant="body1" color={user.bio ? 'text.primary' : 'text.disabled'} sx={{mt: 1, whiteSpace: 'pre-wrap', fontStyle: user.bio ? 'normal' : 'italic'}}>
											{user.bio || 'No bio added yet'}
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			</Grid>

			<UpdateProfileDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} user={user} />
		</Box>
	);
};

export default ProfilePage;
