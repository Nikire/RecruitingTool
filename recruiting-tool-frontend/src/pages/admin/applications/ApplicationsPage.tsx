import {useState} from 'react';
import {
	Typography,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Alert,
	Paper,
} from '@mui/material';
import {useUserAtom} from '../../../hooks/api/state/useUserAtom';
import {isAdmin} from '../../../utils/permissions';
import {ApplicationStatus} from '../../../types/application.types';
import ApplicationsTable from '../../../components/applications/ApplicationsTable';

const ApplicationsPage: React.FC = () => {
	const {user} = useUserAtom();
	const hasAdminAccess = isAdmin(user);
	const [statusFilter, setStatusFilter] = useState<ApplicationStatus | ''>('');

	// Check if user has admin access
	if (!hasAdminAccess) {
		return (
			<Box>
				<Alert severity="error" sx={{mb: 2}}>
					Access Denied: You need ADMIN or SUPER_ADMIN role to view applications.
				</Alert>
				<Typography variant="body1">
					Please contact your administrator if you believe you should have access to this page.
				</Typography>
			</Box>
		);
	}

	return (
		<Box>
			<Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 8}}>
				<Typography variant="h4">Job Applications</Typography>
			</Box>

			<Paper sx={{p: 2, mb: 3}}>
				<Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
					<FormControl sx={{minWidth: 200}}>
						<InputLabel id="status-filter-label">Filter by Status</InputLabel>
						<Select
							labelId="status-filter-label"
							id="status-filter"
							value={statusFilter}
							label="Filter by Status"
							onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | '')}
						>
							<MenuItem value="">All Applications</MenuItem>
							<MenuItem value={ApplicationStatus.PENDING}>Pending</MenuItem>
							<MenuItem value={ApplicationStatus.REVIEWED}>Reviewed</MenuItem>
							<MenuItem value={ApplicationStatus.ACCEPTED}>Accepted</MenuItem>
							<MenuItem value={ApplicationStatus.REJECTED}>Rejected</MenuItem>
						</Select>
					</FormControl>
				</Box>
			</Paper>

			<ApplicationsTable statusFilter={statusFilter || undefined} />
		</Box>
	);
};

export default ApplicationsPage;
