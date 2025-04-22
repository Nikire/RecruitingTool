import {Divider, Typography} from '@mui/material';
import {HiringProcessPageWrapper} from './HiringProcessPage.styles';
import {useParams} from 'react-router';
import StagesTimeline from '../../components/stages/StagesTimeline/StagesTimeline';

const HiringProcessPage: React.FC = () => {
	const {uid} = useParams<{uid: string}>();
	console.log('HiringProcessPage uid:', uid);
	/* const {data: hiringProcess, isLoading: isHiringProcessLoading} =
		useHiringProcess(uid); */

	const stages = [
		{
			uid: 'test1',
			type: 'INTERVIEW',
			title: 'Initial interview',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			status: 'DONE',
		},
		{
			uid: 'test2',
			type: 'INTERVIEW',
			title: 'Technical Interview',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			status: 'CURRENT',
		},
		{
			uid: 'test3',
			type: 'INTERVIEW',
			title: 'Test drive',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			status: 'OPEN',
		},
		{
			uid: 'test4',
			type: 'INTERVIEW',
			title: 'Final Interview',
			description:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			status: 'OPEN',
		},
	];

	return (
		<HiringProcessPageWrapper>
			<Typography sx={{fontWeight: 600}} variant="h6" gutterBottom>
				You are editing:
			</Typography>
			<Typography sx={{fontWeight: 600}} variant="h4" gutterBottom>
				UX/UI Designer position
			</Typography>
			<Typography variant="subtitle2" gutterBottom>
				Signed in as:
			</Typography>
			<Divider variant="middle" />

			<StagesTimeline stages={stages} />
		</HiringProcessPageWrapper>
	);
};

export default HiringProcessPage;
