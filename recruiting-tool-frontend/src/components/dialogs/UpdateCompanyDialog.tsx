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
import {useUpdateCompany} from '../../hooks/api/useCompanies';
import {Company} from '../../types/company.types';
import {useEffect} from 'react';

interface UpdateCompanyDialogProps {
	open: boolean;
	onClose: () => void;
	company: Company | null;
}

interface CompanyFormData {
	name: string;
	description?: string;
}

const UpdateCompanyDialog: React.FC<UpdateCompanyDialogProps> = ({
	open,
	onClose,
	company,
}) => {
	const {
		register,
		handleSubmit,
		reset,
		formState: {errors},
	} = useForm<CompanyFormData>({
		defaultValues: {
			name: '',
			description: '',
		},
	});

	const {mutate: updateCompany, isPending, isError} = useUpdateCompany();

	// Update form values when company changes
	useEffect(() => {
		if (company) {
			reset({
				name: company.name,
				description: company.description || '',
			});
		}
	}, [company, reset]);

	const onSubmit = (data: CompanyFormData) => {
		if (!company) return;

		updateCompany(
			{uid: company.uid, data},
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
			<DialogTitle>Update Company</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: 1}}>
						<TextField
							label="Company Name"
							fullWidth
							{...register('name', {
								required: 'Company name is required',
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
							label="Description"
							multiline
							rows={3}
							fullWidth
							{...register('description', {
								maxLength: {
									value: 500,
									message: 'Description must be less than 500 characters',
								},
							})}
							error={!!errors.description}
							helperText={errors.description?.message}
						/>
					</Box>

					{isError && (
						<Typography color="error" sx={{mt: 2}}>
							Failed to update company. Please try again.
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

export default UpdateCompanyDialog;
