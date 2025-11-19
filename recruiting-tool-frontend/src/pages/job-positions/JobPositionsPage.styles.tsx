import styled from 'styled-components';

export const JobPositionsPageWrapper = styled.div`
	display: flex;
	flex-direction: column;
	padding: 1rem;
	max-width: 100%;

	@media (min-width: 600px) {
		padding: 1.5rem;
	}

	@media (min-width: 1024px) {
		padding: 2rem;
	}
`;
