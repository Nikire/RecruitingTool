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

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value?: unknown) => void;
	reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});

	failedQueue = [];
};

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
	async (error) => {
		const originalRequest = error.config;

		// If error is 401 and we haven't tried to refresh yet
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				// If already refreshing, queue this request
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = localStorage.getItem('refreshToken');

			// Validate refresh token before using it
			if (!refreshToken || !isValidToken(refreshToken)) {
				// Invalid or missing refresh token, logout
				console.warn('[AUTH] Invalid or missing refresh token, clearing auth state');
				isRefreshing = false;
				localStorage.removeItem('authToken');
				localStorage.removeItem('refreshToken');
				window.location.href = '/login';
				return Promise.reject(error);
			}

			try {
				// Attempt to refresh the token
				const response = await axios.post(
					`${import.meta.env.VITE_API_URL}/auth/refresh`,
					{ refreshToken },
					{ headers: { 'Content-Type': 'application/json' } }
				);

				const { accessToken, refreshToken: newRefreshToken } = response.data;

				// Validate new tokens before storing
				if (!accessToken || !isValidToken(accessToken)) {
				console.error('[AUTH] Invalid access token received from refresh endpoint');
				throw new Error('Invalid access token received');
				}

				if (!newRefreshToken || !isValidToken(newRefreshToken)) {
				console.error('[AUTH] Invalid refresh token received from refresh endpoint');
				throw new Error('Invalid refresh token received');
				}

				// Store new tokens
				localStorage.setItem('authToken', accessToken);
				localStorage.setItem('refreshToken', newRefreshToken);

				// Update the authorization header
				api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
				originalRequest.headers.Authorization = `Bearer ${accessToken}`;

				// Process queued requests with new token
				processQueue(null, accessToken);
				isRefreshing = false;

				// Retry the original request
				return api(originalRequest);
			} catch (refreshError) {
				// Refresh failed, logout user
				processQueue(refreshError as Error, null);
				isRefreshing = false;

				localStorage.removeItem('authToken');
				localStorage.removeItem('refreshToken');
				window.location.href = '/login';

				return Promise.reject(refreshError);
			}
		}

		// Pass through to error normalizer interceptor
		return errorNormalizerInterceptor(error);
	}
);

export default api;
