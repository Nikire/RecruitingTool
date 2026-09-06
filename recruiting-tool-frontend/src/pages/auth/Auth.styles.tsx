import styled from "styled-components";

export const AuthGroupWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 450px;
  min-width: 0;
  gap: 16px;
  margin: 0 auto;
  padding: 32px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.palette.background.default};

  @media (min-width: 600px) {
    padding: 32px 48px;
  }
`;
/*
 * min-height (not height) + no overflow clipping: short pages stay vertically
 * centred, while pages taller than the viewport (registration wizard) grow and
 * scroll inside AuthLayout's content slot instead of being cut off.
 */
export const AuthPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  box-sizing: border-box;
  width: 100%;
`;
export const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
