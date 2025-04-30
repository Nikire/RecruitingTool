import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {createTheme, ThemeProvider} from '@mui/material';
import {BrowserRouter} from 'react-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import recruitingToolPalette from './palette.ts';

const queryClient = new QueryClient();

const theme = createTheme(recruitingToolPalette);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider theme={theme}>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>
);
