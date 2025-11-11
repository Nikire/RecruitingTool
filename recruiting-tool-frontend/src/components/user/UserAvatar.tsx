import {Avatar} from '@mui/material';

const stringAvatar = (name: string) => {
	return {
		children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
	};
};
type UserAvatarType = {
	avatarUrl?: string;
	name?: string;
};

const UserAvatar: React.FC<UserAvatarType> = ({avatarUrl, name}) => {
	return (
		<Avatar
			sx={(theme) => ({bgcolor: theme.palette.primary.main})}
			{...stringAvatar(name || 'Unknown User')}
			src={avatarUrl}
		/>
	);
};
export default UserAvatar;
