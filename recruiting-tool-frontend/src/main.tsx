import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import 'flag-icons/css/flag-icons.min.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {ThemeProvider as MuiThemeProvider, createTheme} from '@mui/material';
import {ThemeProvider as StyledThemeProvider} from 'styled-components';
import {Provider as JotaiProvider} from 'jotai';

import {BrowserRouter} from 'react-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import recruitingToolPalette from './palette.ts';
import ErrorBoundary from './components/error/ErrorBoundary.tsx';

import './i18n/i18n.ts';

const queryClient = new QueryClient();

const theme = createTheme(recruitingToolPalette);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ErrorBoundary>
			<QueryClientProvider client={queryClient}>
				<MuiThemeProvider theme={theme}>
					<StyledThemeProvider theme={theme}>
						<JotaiProvider>
							<BrowserRouter>
								<App />
							</BrowserRouter>
						</JotaiProvider>
					</StyledThemeProvider>
				</MuiThemeProvider>
			</QueryClientProvider>
		</ErrorBoundary>
	</StrictMode>
);
