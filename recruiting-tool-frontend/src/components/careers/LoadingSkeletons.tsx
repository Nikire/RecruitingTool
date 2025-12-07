import React, {memo} from 'react';
import {Grid, Paper, Box, Stack, Skeleton} from '@mui/material';

const SkeletonCard: React.FC = memo(() => (
	<Paper
		sx={{
			p: 3,
			height: 320,
			display: 'flex',
			flexDirection: 'column',
			gap: 2,
		}}
	>
		<Stack direction="row" spacing={2} alignItems="center">
			<Skeleton variant="circular" width={56} height={56} />
			<Box sx={{flex: 1}}>
				<Skeleton variant="text" width="60%" />
			</Box>
		</Stack>
		<Skeleton variant="text" width="90%" height={40} />
		<Skeleton variant="text" width="70%" />
		<Stack direction="row" spacing={1}>
			<Skeleton variant="rectangular" width={80} height={24} sx={{borderRadius: 2}} />
			<Skeleton variant="rectangular" width={80} height={24} sx={{borderRadius: 2}} />
		</Stack>
		<Box sx={{flex: 1}} />
		<Skeleton variant="rectangular" height={48} sx={{borderRadius: 1}} />
	</Paper>
));

SkeletonCard.displayName = 'SkeletonCard';

interface LoadingSkeletonsProps {
	count?: number;
}

const LoadingSkeletons: React.FC<LoadingSkeletonsProps> = memo(({count = 9}) => (
	<Grid container spacing={3}>
		{Array.from({length: count}).map((_, i) => (
			<Grid
				item
				key={i}
				xs={12}
				sm={6}
				lg={4}
				sx={{
					overflow: 'visible',
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<Box sx={{width: 400, maxWidth: '100%'}}>
					<SkeletonCard />
				</Box>
			</Grid>
		))}
	</Grid>
));

LoadingSkeletons.displayName = 'LoadingSkeletons';

export default LoadingSkeletons;
