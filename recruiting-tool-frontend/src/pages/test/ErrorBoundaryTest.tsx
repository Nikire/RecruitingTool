import { useState } from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { BugReport as BugIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

/**
 * ErrorBoundaryTest Component
 *
 * This component is used to test the ErrorBoundary by intentionally throwing errors.
 * It should be removed from production code or protected behind a development-only route.
 *
 * Usage:
 * - Add a route to this component: <Route path="/test/error-boundary" element={<ErrorBoundaryTest />} />
 * - Click the button to trigger an error
 * - The ErrorBoundary should catch the error and display the fallback UI
 *
 * To test:
 * 1. Navigate to /test/error-boundary
 * 2. Click "Throw Error" button
 * 3. Verify ErrorBoundary displays properly
 * 4. Click "Reload Page" to reset
 */
const ErrorBoundaryTest = () => {
	const { t } = useTranslation();
	const [shouldThrowError, setShouldThrowError] = useState(false);

	if (shouldThrowError) {
		// Intentionally throw an error to test ErrorBoundary
		throw new Error('This is a test error thrown intentionally to verify ErrorBoundary works correctly.');
	}

	const handleThrowError = () => {
		setShouldThrowError(true);
	};

	return (
		<Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
			<Paper
				elevation={3}
				sx={{
					p: 4,
					textAlign: 'center',
					borderTop: 4,
					borderColor: 'warning.main',
				}}
			>
				{/* Warning Icon */}
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						mb: 3,
					}}
				>
					<BugIcon
						sx={{
							fontSize: 80,
							color: 'warning.main',
						}}
					/>
				</Box>

				{/* Title */}
				<Typography variant="h4" gutterBottom color="warning.main">
					ErrorBoundary Test Page
				</Typography>

				{/* Description */}
				<Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
					This page is for testing the ErrorBoundary component. Clicking the button below will
					intentionally throw an error to verify that the ErrorBoundary catches it and displays
					the fallback UI correctly.
				</Typography>

				{/* Instructions */}
				<Paper
					sx={{
						p: 3,
						mb: 4,
						bgcolor: 'grey.100',
						textAlign: 'left',
					}}
				>
					<Typography variant="subtitle1" gutterBottom fontWeight="bold">
						Test Instructions:
					</Typography>
					<Typography variant="body2" component="div">
						<ol>
							<li>Click the "Throw Error" button below</li>
							<li>Verify the ErrorBoundary displays a user-friendly error page</li>
							<li>Check that "Reload Page" and "Go Home" buttons work</li>
							<li>In development mode, verify error details accordion is visible</li>
							<li>In production mode, verify error details are hidden</li>
						</ol>
					</Typography>
				</Paper>

				{/* Test Button */}
				<Button
					variant="contained"
					color="error"
					size="large"
					startIcon={<BugIcon />}
					onClick={handleThrowError}
				>
					Throw Error
				</Button>

				{/* Note */}
				<Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
					Note: This test page should be removed or protected in production.
				</Typography>
			</Paper>
		</Container>
	);
};

export default ErrorBoundaryTest;
