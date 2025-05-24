import {useForm} from 'react-hook-form';
import {Typography, TextField, Button, Divider} from '@mui/material';
import {useRegister} from '../../hooks/api/useAuth';
import {AuthGroupWrapper, AuthPageWrapper, FormWrapper} from './Auth.styles';
interface SignupFormData {
	name: string;
	email: string;
	password: string;
}

const Signup: React.FC = () => {
	const {register, handleSubmit} = useForm<SignupFormData>();
	const {mutate: registerUser, isPending, isError} = useRegister();

	const onSubmit = (data: SignupFormData) => {
		registerUser(data);
	};

	return (
		<AuthPageWrapper>
			<AuthGroupWrapper>
				<Typography variant="h4">Sign Up</Typography>
				<Divider />

				<FormWrapper onSubmit={handleSubmit(onSubmit)}>
					<TextField
						label="Name"
						size="small"
						fullWidth
						margin="none"
						{...register('name')}
					/>
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
						{isPending ? 'Signing up...' : 'Sign Up'}
					</Button>
					{isError && (
						<Typography color="error">
							Signup failed. Please try again.
						</Typography>
					)}
				</FormWrapper>
			</AuthGroupWrapper>
		</AuthPageWrapper>
	);
};

export default Signup;
