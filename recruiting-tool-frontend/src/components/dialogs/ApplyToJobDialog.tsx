import React, {useState, useEffect} from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Box,
	Typography,
	Alert,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {useCreateApplication} from '../../hooks/api/useApplications';
import {useUploadFile} from '../../hooks/api/useFiles';
import {useJobPositions} from '../../hooks/api/useJobPositions';
import {CustomQuestionRenderer} from '../forms/CustomQuestionRenderer';
import {CustomAnswers} from '../../types/customQuestions';

interface ApplyToJobDialogProps {
	open: boolean;
	onClose: () => void;
	jobUid: string;
	jobTitle: string;
}

export const ApplyToJobDialog: React.FC<ApplyToJobDialogProps> = ({
	open,
	onClose,
	jobUid,
	jobTitle,
}) => {
	const {mutateAsync: createApplication, isPending: submitting} = useCreateApplication();
	const {mutateAsync: uploadFile, isPending: uploading} = useUploadFile();
	const {data: jobPosition, isLoading: loadingJob} = useJobPositions(jobUid);

	const [formData, setFormData] = useState({
		applicantName: '',
		applicantEmail: '',
		applicantPhone: '',
		coverLetter: '',
	});
	const [customAnswers, setCustomAnswers] = useState<CustomAnswers>({});
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [customAnswerErrors, setCustomAnswerErrors] = useState<Record<string, string>>({});
	const [success, setSuccess] = useState(false);

	// Initialize custom answers when job position loads
	useEffect(() => {
		if (jobPosition?.customQuestions) {
			const initialAnswers: CustomAnswers = {};
			jobPosition.customQuestions.forEach((q) => {
				initialAnswers[q.id] = '';
			});
			setCustomAnswers(initialAnswers);
		}
	}, [jobPosition]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));
		if (formErrors[name]) {
			setFormErrors((prev) => ({...prev, [name]: ''}));
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const validTypes = [
				'application/pdf',
				'application/msword',
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			];
			if (!validTypes.includes(file.type)) {
				setFormErrors((prev) => ({...prev, resume: 'Please upload a PDF or DOC file'}));
				return;
			}
			if (file.size > 10 * 1024 * 1024) {
				setFormErrors((prev) => ({...prev, resume: 'File size must be less than 10MB'}));
				return;
			}
			setResumeFile(file);
			setFormErrors((prev) => ({...prev, resume: ''}));
		}
	};

	const validateForm = () => {
		const errors: Record<string, string> = {};
		const customErrors: Record<string, string> = {};

		if (!formData.applicantName.trim()) {
			errors.applicantName = 'Name is required';
		}
		if (!formData.applicantEmail.trim()) {
			errors.applicantEmail = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.applicantEmail)) {
			errors.applicantEmail = 'Invalid email format';
		}
		if (!formData.applicantPhone.trim()) {
			errors.applicantPhone = 'Phone number is required';
		}

		// Validate custom questions
		if (jobPosition?.customQuestions) {
			jobPosition.customQuestions.forEach((question) => {
				if (question.required) {
					const answer = customAnswers[question.id];
					if (!answer || (Array.isArray(answer) && answer.length === 0)) {
						customErrors[question.id] = 'This field is required';
					}
				}
			});
		}

		setFormErrors(errors);
		setCustomAnswerErrors(customErrors);
		return Object.keys(errors).length === 0 && Object.keys(customErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			let resumeFileUid: string | undefined;

			if (resumeFile) {
				const uploadedFile = await uploadFile({file: resumeFile});
				resumeFileUid = uploadedFile.uid;
			}

			await createApplication({
				jobPositionUid: jobUid,
				applicantName: formData.applicantName,
				applicantEmail: formData.applicantEmail,
				applicantPhone: formData.applicantPhone,
				coverLetter: formData.coverLetter || undefined,
				resumeFileUid,
				customAnswers: Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
			});

			setSuccess(true);
			setTimeout(() => {
				handleClose();
			}, 2000);
		} catch (error) {
			console.error('Application submission failed:', error);
		}
	};

	const handleClose = () => {
		setFormData({
			applicantName: '',
			applicantEmail: '',
			applicantPhone: '',
			coverLetter: '',
		});
		setCustomAnswers({});
		setResumeFile(null);
		setFormErrors({});
		setCustomAnswerErrors({});
		setSuccess(false);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					m: {xs: 1, sm: 2},
					borderRadius: {xs: 1, sm: 2},
				},
			}}
			slotProps={{
				backdrop: {
					sx: {
						backdropFilter: 'blur(4px)',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
					},
				},
			}}
		>
			<DialogTitle
				sx={{
					fontSize: {xs: '1.15rem', sm: '1.25rem'},
					fontWeight: 600,
					pb: {xs: 1.5, sm: 2},
					pt: {xs: 1.5, sm: 2},
					px: {xs: 2, sm: 3},
				}}
			>
				Apply to {jobTitle}
			</DialogTitle>
			<DialogContent>
				{success ? (
					<Alert severity="success" sx={{mt: 2}}>
						Application submitted successfully! We'll get back to you soon.
					</Alert>
				) : (
					<Box
						sx={{
							pt: {xs: 1.5, sm: 2},
							display: 'flex',
							flexDirection: 'column',
							gap: {xs: 1.5, sm: 2},
						}}
					>
						<TextField
							fullWidth
							label="Full Name"
							name="applicantName"
							value={formData.applicantName}
							onChange={handleInputChange}
							error={!!formErrors.applicantName}
							helperText={formErrors.applicantName}
							required
							inputProps={{
								minLength: 2,
							}}
							sx={{
								'& .MuiInputBase-input': {
									fontSize: {xs: '1rem', sm: '1rem'},
									minHeight: {xs: 44, sm: 'auto'},
								},
							}}
						/>

						<TextField
							fullWidth
							label="Email Address"
							name="applicantEmail"
							type="email"
							value={formData.applicantEmail}
							onChange={handleInputChange}
							error={!!formErrors.applicantEmail}
							helperText={formErrors.applicantEmail}
							required
							sx={{
								'& .MuiInputBase-input': {
									fontSize: {xs: '1rem', sm: '1rem'},
									minHeight: {xs: 44, sm: 'auto'},
								},
							}}
						/>

						<TextField
							fullWidth
							label="Phone Number"
							name="applicantPhone"
							value={formData.applicantPhone}
							onChange={handleInputChange}
							error={!!formErrors.applicantPhone}
							helperText={formErrors.applicantPhone}
							required
							sx={{
								'& .MuiInputBase-input': {
									fontSize: {xs: '1rem', sm: '1rem'},
									minHeight: {xs: 44, sm: 'auto'},
								},
							}}
						/>

						<Box sx={{mb: 0}}>
							<Button
								variant="outlined"
								component="label"
								startIcon={<AttachFileIcon />}
								fullWidth
								sx={{
									justifyContent: 'flex-start',
									py: {xs: 1.75, sm: 1.5},
									minHeight: 44,
									fontSize: {xs: '0.9rem', sm: '1rem'},
									textTransform: 'none',
									textAlign: 'left',
									paddingLeft: 2,
									borderRadius: 1,
								}}
							>
								{resumeFile ? resumeFile.name : 'Upload Resume (Optional)'}
								<input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
							</Button>
							{formErrors.resume && (
								<Typography variant="caption" color="error" sx={{mt: 1, display: 'block', fontSize: {xs: '0.85rem', sm: '0.75rem'}}}>
									{formErrors.resume}
								</Typography>
							)}
						</Box>

						<TextField
							fullWidth
							label="Cover Letter (Optional)"
							name="coverLetter"
							value={formData.coverLetter}
							onChange={handleInputChange}
							multiline
							rows={4}
							placeholder="Tell us why you're interested in this position..."
							sx={{
								'& .MuiInputBase-input': {
									fontSize: {xs: '1rem', sm: '1rem'},
									minHeight: {xs: 100, sm: 'auto'},
								},
							}}
						/>

						{jobPosition?.customQuestions && jobPosition.customQuestions.length > 0 && (
							<CustomQuestionRenderer
								questions={jobPosition.customQuestions}
								answers={customAnswers}
								onAnswerChange={(questionId, answer) => {
									setCustomAnswers((prev) => ({...prev, [questionId]: answer}));
									// Clear error for this question
									if (customAnswerErrors[questionId]) {
										setCustomAnswerErrors((prev) => ({...prev, [questionId]: ''}));
									}
								}}
								errors={customAnswerErrors}
							/>
						)}
					</Box>
				)}
			</DialogContent>
			{!success && (
				<DialogActions
					sx={{
						p: {xs: 1.5, sm: 2},
						gap: {xs: 1, sm: 1},
						flexDirection: {xs: 'column-reverse', sm: 'row'},
						'& button': {
							minHeight: 44,
							fontSize: {xs: '0.95rem', sm: '1rem'},
						},
					}}
				>
					<Button
						onClick={handleClose}
						sx={{
							minWidth: {xs: '100%', sm: 'auto'},
						}}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleSubmit}
						disabled={submitting || uploading}
						sx={{
							minWidth: {xs: '100%', sm: 'auto'},
						}}
					>
						{submitting || uploading ? 'Submitting...' : 'Submit Application'}
					</Button>
				</DialogActions>
			)}
		</Dialog>
	);
};
