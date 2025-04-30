import {Divider, Typography} from '@mui/material';
import {HiringProcessPageWrapper} from './HiringProcessPage.styles';
import {useParams} from 'react-router';
import StagesTimeline from '../../components/stages/StagesTimeline/StagesTimeline';
import {useHiringProcesses} from '../../hooks/api/useHiringProcess';
import {HiringProcess} from '../../types/hiringProcess.types';

const HiringProcessPage: React.FC = () => {
	const {uid} = useParams<{uid: string}>();
	const {
		data: hiringProcessData,
		isLoading: isHiringProcessLoading,
		error,
	} = useHiringProcesses(uid);

	if (isHiringProcessLoading) {
		return <div>LOADING...</div>;
	}

	if (error) {
		return <div>ERROR...</div>;
	}

	if (!hiringProcessData) {
		return <div>No data found</div>;
	}

	const hiringProcess = hiringProcessData as HiringProcess;

	return (
		<HiringProcessPageWrapper>
			<Typography variant="h6" gutterBottom>
				You are editing:
			</Typography>
			<Typography variant="h4" gutterBottom>
				{hiringProcess.title}
			</Typography>
			<Typography variant="subtitle2" gutterBottom>
				Signed in as:
			</Typography>
			<Divider variant="middle" />

			{hiringProcessData && <StagesTimeline stages={hiringProcess.stages} />}
		</HiringProcessPageWrapper>
	);
};

export default HiringProcessPage;
