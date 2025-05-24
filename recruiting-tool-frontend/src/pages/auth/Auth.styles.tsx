import styled from 'styled-components';

export const AuthGroupWrapper = styled.div`
	display: flex;
	flex-direction: column;
	min-width: 450px;
	gap: 16px;
	margin: 0 auto;
	padding: 32px 48px;
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	background-color: ${({theme}) => theme.palette.background.default};
`;
export const AuthPageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	justify-content: center;
	align-items: center;
`;
export const FormWrapper = styled.form`
	display: flex;
	flex-direction: column;
	gap: 16px;
`;
