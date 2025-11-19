import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Chip,
	Divider,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Grid,
	IconButton,
	Tooltip,
} from '@mui/material';
import {
	Download as DownloadIcon,
	Delete as DeleteIcon,
} from '@mui/icons-material';
import {useForm} from 'react-hook-form';
import {useEffect, useState} from 'react';
import {format} from 'date-fns';
import {Application, ApplicationStatus, UpdateApplicationDto} from '../../types/application.types';
import {useUpdateApplication, useDeleteApplication, useAcceptApplication} from '../../hooks/api/useApplications';
import {useDownloadFile} from '../../hooks/api/useFiles';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ApplicationDetailDialogProps {
	open: boolean;
	onClose: () => void;
	application: Application | null;
}

interface FormData {
	status: ApplicationStatus;
	notes: string;
}

const ApplicationDetailDialog: React.FC<ApplicationDetailDialogProps> = ({
	open,
	onClose,
	application,
}) => {
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: {errors, isDirty},
	} = useForm<FormData>({
		defaultValues: {
			status: ApplicationStatus.PENDING,
			notes: '',
		},
	});

	const {mutate: updateApplication, isPending: isUpdating} = useUpdateApplication();
	const {mutate: deleteApplication, isPending: isDeleting} = useDeleteApplication();
	const {mutate: acceptApp, isPending: isAccepting} = useAcceptApplication();
	const {mutate: downloadFile} = useDownloadFile();

	const currentStatus = watch('status');

	// Update form values when application changes
	useEffect(() => {
		if (application) {
			reset({
				status: application.status,
				notes: application.notes || '',
			});
		}
	}, [application, reset]);

	const onSubmit = (data: FormData) => {
		if (!application) return;

		const updateData: UpdateApplicationDto = {
			status: data.status,
			notes: data.notes || undefined,
		};

		updateApplication(
			{uid: application.uid, data: updateData},
			{
				onSuccess: () => {
					onClose();
				},
			}
		);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleDownloadResume = () => {
		if (application?.resumeFileUid && application?.resumeFileName) {
			downloadFile({
				uid: application.resumeFileUid,
				filename: application.resumeFileName,
			});
		}
	};

	const handleDeleteClick = () => {
		setConfirmDeleteOpen(true);
	};

	const handleConfirmDelete = () => {
		if (application) {
			deleteApplication(application.uid, {
				onSuccess: () => {
					setConfirmDeleteOpen(false);
					onClose();
				},
			});
		}
	};

	const handleAcceptApplication = () => {
		if (application) {
			acceptApp(application.uid, {
				onSuccess: () => {
					onClose();
				},
			});
		}
	};

	const getStatusColor = (status: ApplicationStatus) => {
		switch (status) {
			case ApplicationStatus.PENDING:
				return 'warning';
			case ApplicationStatus.REVIEWED:
				return 'info';
			case ApplicationStatus.ACCEPTED:
				return 'success';
			case ApplicationStatus.REJECTED:
				return 'error';
			default:
				return 'default';
		}
	};

	if (!application) return null;

	return (
		<>
			<Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
				<DialogTitle>
					<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
						<Typography variant="h6">Application Details</Typography>
						<Chip
							label={application.status}
							color={getStatusColor(application.status)}
							size="small"
						/>
					</Box>
				</DialogTitle>

				<form onSubmit={handleSubmit(onSubmit)}>
					<DialogContent>
						{/* Applicant Information */}
						<Box sx={{mb: 3}}>
							<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
								Applicant Information
							</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12} sm={6}>
									<Typography variant="body2" color="text.secondary">
										Name
									</Typography>
									<Typography variant="body1">{application.applicantName}</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant="body2" color="text.secondary">
										Email
									</Typography>
									<Typography variant="body1">{application.applicantEmail}</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant="body2" color="text.secondary">
										Phone
									</Typography>
									<Typography variant="body1">{application.applicantPhone}</Typography>
								</Grid>
								<Grid item xs={12} sm={6}>
									<Typography variant="body2" color="text.secondary">
										Applied Date
									</Typography>
									<Typography variant="body1">
										{format(new Date(application.appliedAt), 'MMM d, yyyy h:mm a')}
									</Typography>
								</Grid>
							</Grid>
						</Box>

						<Divider sx={{my: 3}} />

						{/* Job Information */}
						<Box sx={{mb: 3}}>
							<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
								Job Position
							</Typography>
							<Typography variant="body1">{application.jobPositionTitle}</Typography>
							{application.companyName && (
								<Typography variant="body2" color="text.secondary">
									{application.companyName}
								</Typography>
							)}
						</Box>

						<Divider sx={{my: 3}} />

						{/* Resume */}
						{application.resumeFileUid && (
							<>
								<Box sx={{mb: 3}}>
									<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
										Resume
									</Typography>
									<Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
										<Typography variant="body2">{application.resumeFileName}</Typography>
										<Tooltip title="Download Resume">
											<IconButton
												onClick={handleDownloadResume}
												size="small"
												color="primary"
											>
												<DownloadIcon />
											</IconButton>
										</Tooltip>
									</Box>
								</Box>
								<Divider sx={{my: 3}} />
							</>
						)}

						{/* Cover Letter */}
						{application.coverLetter && (
							<>
								<Box sx={{mb: 3}}>
									<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
										Cover Letter
									</Typography>
									<Box
										sx={{
											p: 2,
											bgcolor: 'grey.50',
											borderRadius: 1,
											maxHeight: 200,
											overflowY: 'auto',
										}}
									>
										<Typography variant="body2" whiteSpace="pre-wrap">
											{application.coverLetter}
										</Typography>
									</Box>
								</Box>
								<Divider sx={{my: 3}} />
							</>
						)}

						{/* HR Section - Editable */}
						<Box sx={{mb: 3}}>
							<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
								HR Review
							</Typography>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<FormControl fullWidth>
										<InputLabel id="status-label">Status</InputLabel>
										<Select
											labelId="status-label"
											label="Status"
											value={currentStatus}
											{...register('status', {required: 'Status is required'})}
											error={!!errors.status}
										>
											<MenuItem value={ApplicationStatus.PENDING}>Pending</MenuItem>
											<MenuItem value={ApplicationStatus.REVIEWED}>Reviewed</MenuItem>
											<MenuItem value={ApplicationStatus.ACCEPTED}>Accepted</MenuItem>
											<MenuItem value={ApplicationStatus.REJECTED}>Rejected</MenuItem>
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12}>
									<TextField
										label="Internal Notes"
										multiline
										rows={4}
										fullWidth
										placeholder="Add notes about this application..."
										{...register('notes')}
									/>
								</Grid>
							</Grid>

							{application.reviewedAt && (
								<Box sx={{mt: 2}}>
									<Typography variant="caption" color="text.secondary">
										Reviewed on {format(new Date(application.reviewedAt), 'MMM d, yyyy h:mm a')}
										{application.reviewedByName && ` by ${application.reviewedByName}`}
									</Typography>
								</Box>
							)}
						</Box>
					</DialogContent>

					<DialogActions sx={{justifyContent: 'space-between', px: 3, pb: 2}}>
						<Button
							onClick={handleDeleteClick}
							color="error"
							variant="outlined"
							startIcon={<DeleteIcon />}
							disabled={isDeleting || isUpdating || isAccepting}
						>
							Delete
						</Button>
						<Box sx={{display: 'flex', gap: 1}}>
							<Button onClick={handleClose} disabled={isUpdating || isAccepting}>
								Cancel
							</Button>
							{application.status !== ApplicationStatus.ACCEPTED && (
								<Button
									onClick={handleAcceptApplication}
									variant="contained"
									color="success"
									startIcon={<CheckCircleIcon />}
									disabled={isAccepting || isUpdating}
								>
									{isAccepting ? 'Accepting...' : 'Accept & Create Hiring Process'}
								</Button>
							)}
							<Button
								type="submit"
								variant="contained"
								disabled={isUpdating || !isDirty || isAccepting}
							>
								{isUpdating ? 'Saving...' : 'Save Changes'}
							</Button>
						</Box>
					</DialogActions>
				</form>
			</Dialog>

			<ConfirmDeleteDialog
				open={confirmDeleteOpen}
				onClose={() => setConfirmDeleteOpen(false)}
				onConfirm={handleConfirmDelete}
				title="Delete Application"
				message={`Are you sure you want to delete the application from ${application.applicantName}? This action cannot be undone.`}
			/>
		</>
	);
};

export default ApplicationDetailDialog;
