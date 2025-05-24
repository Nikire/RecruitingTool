import {useForm} from 'react-hook-form';
import {Typography, TextField, Button, Divider} from '@mui/material';
import {useLogin} from '../../hooks/api/useAuth';
import {AuthGroupWrapper, AuthPageWrapper, FormWrapper} from './Auth.styles';
interface LoginFormData {
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const {register, handleSubmit} = useForm<LoginFormData>();
	const {mutate: login, isPending, isError} = useLogin();

	const onSubmit = (data: LoginFormData) => {
		login(data);
	};

	return (
		<AuthPageWrapper>
			<AuthGroupWrapper>
				<Typography variant="h4">Login</Typography>
				<Divider />

				<FormWrapper onSubmit={handleSubmit(onSubmit)}>
					<TextField
						label="Email"
						size="small"
						fullWidth
						margin="none"
						{...register('email')}
					/>
					<TextField
						label="Password"
						size="small"
						type="password"
						fullWidth
						margin="none"
						{...register('password')}
					/>
					<Button
						type="submit"
						variant="contained"
						fullWidth
						disabled={isPending}
					>
						{isPending ? 'Logging in...' : 'Login'}
					</Button>
					{isError && (
						<Typography color="error">
							Login failed. Please try again.
						</Typography>
					)}
				</FormWrapper>
			</AuthGroupWrapper>
		</AuthPageWrapper>
	);
};

export default Login;
