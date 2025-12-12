import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
	const env = loadEnv(mode, process.cwd(), '');

	console.log('-------------------------------');
	console.log('VITE MODE:', mode);
	console.log('-------------------------------');

	return {
		plugins: [react()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		server: {
			port: Number(env.VITE_PORT) || 5137,
		},
	};
});
