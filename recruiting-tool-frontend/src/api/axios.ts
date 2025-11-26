import axios from 'axios';
import {
	enhancedResponseNormalizer,
	errorNormalizerInterceptor,
} from './responseNormalizer';

const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
});

// Request interceptor - adds JWT token to requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('authToken');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Response interceptor - unwraps backend's normalized response structure
// Converts response.data.data → response.data automatically
api.interceptors.response.use(
	enhancedResponseNormalizer,
	errorNormalizerInterceptor
);

export default api;
