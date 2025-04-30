import {ThemeOptions} from '@mui/material';
import {green, grey} from '@mui/material/colors';

const recruitingToolPalette: ThemeOptions = {
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
	},
};

export default recruitingToolPalette;
