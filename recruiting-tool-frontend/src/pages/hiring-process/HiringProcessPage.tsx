import {Divider, Typography} from '@mui/material';
import {HiringProcessPageWrapper} from './HiringProcessPage.styles';
import {useParams} from 'react-router';
import StagesTimeline from '../../components/stages/StagesTimeline/StagesTimeline';
import {useHiringProcesses} from '../../hooks/api/useHiringProcess';
import {HiringProcess} from '../../types/hiringProcess.types';

const HiringProcessPage: React.FC = () => {
	const {uid} = useParams<{uid: string}>();
	console.log('HiringProcessPage uid:', uid);
	const {data, isLoading, error} = useHiringProcesses(uid);

	if (isLoading) {
		return <div>LOADING...</div>;
	}

	if (error) {
		return <div>ERROR...</div>;
	}

	if (!data) {
		return <div>No data found</div>;
	}

	const hiringProcess = data as HiringProcess;

	return (
		<HiringProcessPageWrapper>
			<Typography sx={{fontWeight: 600}} variant="h6" gutterBottom>
				You are editing:
			</Typography>
			<Typography sx={{fontWeight: 600}} variant="h4" gutterBottom>
				{hiringProcess.title}
			</Typography>
			<Typography variant="subtitle2" gutterBottom>
				Signed in as:
			</Typography>
			<Divider variant="middle" />

			{data && <StagesTimeline stages={hiringProcess.stages} />}
		</HiringProcessPageWrapper>
	);
};

export default HiringProcessPage;
