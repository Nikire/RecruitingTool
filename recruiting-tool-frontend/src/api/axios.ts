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

// Token validation helper
function isValidToken(token: string | null): boolean {
	if (!token) return false;
	if (typeof token !== 'string') return false;
	if (token === 'null' || token === 'undefined' || token === '') return false;
	// Basic JWT format check: should have 3 parts separated by dots
	const parts = token.split('.');
	return parts.length === 3;
}

// Request interceptor - adds JWT token to requests
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('authToken');

	// Validate token before using it
	if (token && !isValidToken(token)) {
		console.warn('[AUTH] Invalid token detected in localStorage, clearing it');
		localStorage.removeItem('authToken');
		return config; // Continue request without token
	}

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
