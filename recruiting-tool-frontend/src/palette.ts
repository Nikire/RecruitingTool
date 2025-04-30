import {ThemeOptions} from '@mui/material';
import {green, grey} from '@mui/material/colors';

const recruitingToolPalette: ThemeOptions = {
	palette: {
		primary: {
			main: green.A400,
			light: green.A100,
		},
	},
	typography: {
		h1: {
			fontWeight: 600,
		},
		h2: {
			fontWeight: 600,
		},
		h3: {
			fontWeight: 600,
		},
		h4: {
			fontWeight: 600,
		},
		h5: {
			fontWeight: 600,
		},
		h6: {
			fontWeight: 600,
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
				root: {
					backgroundColor: green.A100,
				},
				rounded: {
					borderRadius: '20px !important',
				},
				disabled: {
					color: grey[500],
					backgroundColor: grey[200],
				},
			},
		},
		MuiSvgIcon: {
			styleOverrides: {
				colorDisabled: {
					color: grey[500],
				},
			},
		},
	},
};

export default recruitingToolPalette;
