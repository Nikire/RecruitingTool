import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import { useAuthMe } from '../hooks/api/useAuth';

/**
 * LandingPageLayout - Specialized layout for public landing pages
 *
 * Features:
 * - No Container padding/gutters (full-width control)
 * - Includes Navbar for navigation
 * - Allows child pages to control their own spacing
 * - Optimized for hero sections and marketing content
 * - Restores auth state on page load (via useAuthMe)
 *
 * Used for: Home page, marketing pages
 */
const LandingPageLayout = () => {
	// Restore auth state on page load - ensures navbar shows correct auth status
	useAuthMe();

	return (
		<>
			<Navbar />
			<Toolbar /> {/* Offset spacer for fixed AppBar */}
			<Box sx={{ width: '100%' }}>
				<Outlet />
			</Box>
		</>
	);
};

export default LandingPageLayout;
