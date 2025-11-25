import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';
import {Typography, TextField, Button, Divider} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {useRegister} from '../../hooks/api/useAuth';
import {useUserAtom} from '../../hooks/api/state/useUserAtom';
import {getDefaultDashboard} from '../../utils/permissions';
import {AuthGroupWrapper, AuthPageWrapper, FormWrapper} from './Auth.styles';
interface SignupFormData {
	name: string;
	email: string;
	password: string;
}

const Signup: React.FC = () => {
	const {t} = useTranslation();
	const navigate = useNavigate();
	const {user} = useUserAtom();
	const {register, handleSubmit} = useForm<SignupFormData>();
	const {mutate: registerUser, isPending, isError} = useRegister();

	const onSubmit = (data: SignupFormData) => {
		registerUser(data, {
			onSuccess: () => {
				navigate(getDefaultDashboard(user));
			},
		});
	};

	return (
		<AuthPageWrapper>
			<AuthGroupWrapper>
				<Typography variant="h4">{t('auth.signup_title')}</Typography>
				<Divider />

				<FormWrapper onSubmit={handleSubmit(onSubmit)}>
					<TextField
						label={t('auth.name')}
						size="small"
						fullWidth
						margin="none"
						{...register('name')}
					/>
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
						{isPending ? t('auth.signing_up') : t('auth.signup_title')}
					</Button>
					{isError && (
						<Typography color="error">
							{t('auth.signup_failed')}
						</Typography>
					)}
				</FormWrapper>
			</AuthGroupWrapper>
		</AuthPageWrapper>
	);
};

export default Signup;
