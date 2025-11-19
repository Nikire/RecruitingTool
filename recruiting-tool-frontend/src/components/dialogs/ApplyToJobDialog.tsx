import React, {useState} from 'react';
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

	const [formData, setFormData] = useState({
		applicantName: '',
		applicantEmail: '',
		applicantPhone: '',
		coverLetter: '',
	});
	const [resumeFile, setResumeFile] = useState<File | null>(null);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [success, setSuccess] = useState(false);

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

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
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
		setResumeFile(null);
		setFormErrors({});
		setSuccess(false);
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
			<DialogTitle>Apply to {jobTitle}</DialogTitle>
			<DialogContent>
				{success ? (
					<Alert severity="success" sx={{mt: 2}}>
						Application submitted successfully! We'll get back to you soon.
					</Alert>
				) : (
					<Box sx={{pt: 2}}>
						<TextField
							fullWidth
							label="Full Name"
							name="applicantName"
							value={formData.applicantName}
							onChange={handleInputChange}
							error={!!formErrors.applicantName}
							helperText={formErrors.applicantName}
							required
							sx={{mb: 2}}
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
							sx={{mb: 2}}
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
							sx={{mb: 2}}
						/>

						<Box sx={{mb: 2}}>
							<Button
								variant="outlined"
								component="label"
								startIcon={<AttachFileIcon />}
								fullWidth
								sx={{justifyContent: 'flex-start', py: 1.5}}
							>
								{resumeFile ? resumeFile.name : 'Upload Resume (Optional - PDF or DOC)'}
								<input type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileChange} />
							</Button>
							{formErrors.resume && (
								<Typography variant="caption" color="error" sx={{mt: 1, display: 'block'}}>
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
						/>
					</Box>
				)}
			</DialogContent>
			{!success && (
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button
						variant="contained"
						onClick={handleSubmit}
						disabled={submitting || uploading}
					>
						{submitting || uploading ? 'Submitting...' : 'Submit Application'}
					</Button>
				</DialogActions>
			)}
		</Dialog>
	);
};
