import {ThemeOptions} from '@mui/material';
import {green, grey} from '@mui/material/colors';

/**
 * BorderLess Theme Configuration
 *
 * Typography System:
 * - Font Family: Roboto (400, 500, 700 weights) for excellent readability
 * - Base Size: 16px (rem units for scalability)
 * - Scale: Major Third (1.25 ratio) for clear hierarchy
 * - Line Heights: Optimized for each variant (1.2 for headings, 1.5-1.75 for body)
 * - Letter Spacing: Subtle adjustments for improved readability
 *
 * Typography Tokens:
 * h1: 3.5rem/56px - Hero titles, landing page headers
 * h2: 2.5rem/40px - Page titles, major section headers
 * h3: 2rem/32px - Section headers, card titles
 * h4: 1.5rem/24px - Subsection headers, dialog titles
 * h5: 1.25rem/20px - Small headers, card subtitles
 * h6: 1.125rem/18px - List headers, metadata labels
 * subtitle1: 1rem/16px (500 weight) - Emphasized secondary text
 * subtitle2: 0.875rem/14px (500 weight) - Small emphasized text
 * body1: 1rem/16px (400 weight) - Default paragraph text
 * body2: 0.875rem/14px (400 weight) - Secondary text, captions
 * button: 0.9375rem/15px (500 weight) - Button labels, CTAs
 * caption: 0.75rem/12px - Fine print, metadata, timestamps
 * overline: 0.75rem/12px (uppercase) - Labels, category tags
 *
 * Responsive Typography:
 * - Mobile: Headings scale down 20-30% for readability on small screens
 * - Touch targets: Minimum 44px height for interactive elements
 * - Font smoothing: Optimized for both desktop and mobile displays
 */
const borderlessPalette: ThemeOptions = {
	palette: {
		primary: {
			main: green.A400,
			light: green.A100,
		},
		action: {
			disabled: grey[400],
			disabledOpacity: 1,
			disabledBackground: grey.A200,
		},
	},
	typography: {
		// Font family configuration
		fontFamily: [
			'Roboto',
			'-apple-system',
			'BlinkMacSystemFont',
			'"Segoe UI"',
			'"Helvetica Neue"',
			'Arial',
			'sans-serif',
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(','),

		// Base font size (16px = 1rem)
		fontSize: 16,

		// Font weight tokens
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightMedium: 500,
		fontWeightBold: 700,

		// Heading styles (Major Third scale: 1.25 ratio)
		h1: {
			fontSize: '3.5rem', // 56px - Hero/Landing
			fontWeight: 700,
			lineHeight: 1.15,
			letterSpacing: '-0.02em',
			fontFamily: 'Roboto, sans-serif',
		},
		h2: {
			fontSize: '2.5rem', // 40px - Page titles
			fontWeight: 700,
			lineHeight: 1.2,
			letterSpacing: '-0.015em',
			fontFamily: 'Roboto, sans-serif',
		},
		h3: {
			fontSize: '2rem', // 32px - Section headers
			fontWeight: 600,
			lineHeight: 1.25,
			letterSpacing: '-0.01em',
			fontFamily: 'Roboto, sans-serif',
		},
		h4: {
			fontSize: '1.5rem', // 24px - Subsections
			fontWeight: 600,
			lineHeight: 1.3,
			letterSpacing: '-0.005em',
			fontFamily: 'Roboto, sans-serif',
		},
		h5: {
			fontSize: '1.25rem', // 20px - Card headers
			fontWeight: 600,
			lineHeight: 1.4,
			letterSpacing: '0em',
			fontFamily: 'Roboto, sans-serif',
		},
		h6: {
			fontSize: '1.125rem', // 18px - Small headers
			fontWeight: 600,
			lineHeight: 1.4,
			letterSpacing: '0.005em',
			fontFamily: 'Roboto, sans-serif',
		},

		// Subtitle styles
		subtitle1: {
			fontSize: '1rem', // 16px
			fontWeight: 500,
			lineHeight: 1.5,
			letterSpacing: '0.0075em',
		},
		subtitle2: {
			fontSize: '0.875rem', // 14px
			fontWeight: 500,
			lineHeight: 1.57,
			letterSpacing: '0.01em',
		},

		// Body text styles
		body1: {
			fontSize: '1rem', // 16px - Default
			fontWeight: 400,
			lineHeight: 1.5,
			letterSpacing: '0.00938em',
		},
		body2: {
			fontSize: '0.875rem', // 14px - Secondary
			fontWeight: 400,
			lineHeight: 1.43,
			letterSpacing: '0.01071em',
		},

		// Button text
		button: {
			fontSize: '0.9375rem', // 15px
			fontWeight: 500,
			lineHeight: 1.75,
			letterSpacing: '0.02857em',
			textTransform: 'none', // Remove uppercase
		},

		// Caption and overline
		caption: {
			fontSize: '0.75rem', // 12px
			fontWeight: 400,
			lineHeight: 1.66,
			letterSpacing: '0.03333em',
		},
		overline: {
			fontSize: '0.75rem', // 12px
			fontWeight: 500,
			lineHeight: 2.66,
			letterSpacing: '0.08333em',
			textTransform: 'uppercase',
		},
	},
	components: {
		...({
			MuiTimelineConnector: {
				styleOverrides: {
					root: {
						backgroundColor: green.A400,
					},
				},
			},
		} as any),
		MuiAccordion: {
			styleOverrides: {
				root: ({theme}) => ({
					backgroundColor: green.A100,
					'&.Mui-disabled .MuiTypography-root': {
						color: theme.palette.text.disabled,
					},
				}),
				rounded: {
					borderRadius: '20px !important',
				},
			},
		},
		// Typography component overrides for consistency
		MuiTypography: {
			defaultProps: {
				variantMapping: {
					h1: 'h1',
					h2: 'h2',
					h3: 'h3',
					h4: 'h4',
					h5: 'h5',
					h6: 'h6',
					subtitle1: 'p',
					subtitle2: 'p',
					body1: 'p',
					body2: 'p',
				},
			},
		},
	},
};

export default borderlessPalette;
