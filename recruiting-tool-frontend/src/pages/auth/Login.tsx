import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {Typography, TextField, Button, Divider} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useLogin} from '../../hooks/api/useAuth';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {getDefaultDashboard} from '../../utils/permissions';
import {AuthGroupWrapper, AuthPageWrapper, FormWrapper} from './Auth.styles';
import SocialLoginButtons from '../../components/auth/SocialLoginButtons';

interface LoginFormData {
	email: string;
	password: string;
}

const Login: React.FC = () => {
	const {t} = useTranslation();
	const navigate = useNavigate();
	const {register, handleSubmit} = useForm<LoginFormData>();
	const {mutate: login, isPending, isError} = useLogin();

	const onSubmit = (data: LoginFormData) => {
		login(data, {
			onSuccess: (response) => {
				// Navigate using the user data from the login response
				navigate(getDefaultDashboard(response.user));
			},
		});
	};

	return (
		<AuthPageWrapper>
			<AuthGroupWrapper>
				<Typography variant="h4">{t('auth.login_title')}</Typography>
				<Divider />

				{/* Social Login Buttons (only shown if Auth0 is configured) */}
				<SocialLoginButtons context="login" />

				<FormWrapper onSubmit={handleSubmit(onSubmit)}>
					<TextField
						label={t('auth.email')}
						size="small"
						fullWidth
						margin="none"
						{...register('email')}
					/>
					<TextField
						label={t('auth.password')}
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
						{isPending ? t('auth.logging_in') : t('auth.login_title')}
					</Button>
					{isError && (
						<Typography color="error">
							{t('auth.login_failed')}
						</Typography>
					)}
				</FormWrapper>
			</AuthGroupWrapper>
		</AuthPageWrapper>
	);
};

export default Login;
