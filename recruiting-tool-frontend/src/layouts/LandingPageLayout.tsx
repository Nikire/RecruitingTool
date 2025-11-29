import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';

/**
 * LandingPageLayout - Specialized layout for public landing pages
 *
 * Features:
 * - No Container padding/gutters (full-width control)
 * - Includes Navbar for navigation
 * - Allows child pages to control their own spacing
 * - Optimized for hero sections and marketing content
 *
 * Used for: Home page, marketing pages
 */
const LandingPageLayout = () => {
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
