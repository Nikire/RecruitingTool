import {LinkedAccountsResponse, User} from '../types/user.types';
import api from './axios';

export function getCurrentUser(): Promise<User> {
	return api.get('/auth/me').then((res) => res.data);
}

export function login(data: {
	email: string;
	password: string;
}): Promise<{user: User; token: string; refreshToken: string}> {
	return api.post('/auth/sign-in', data).then((res) => res.data);
}

export function register(data: {
	name: string;
	email: string;
	password: string;
	roles?: string[];
	companyName?: string;
}): Promise<{user: User; token: string; refreshToken: string}> {
	return api.post('/auth/register', data).then((res) => res.data);
}

export function refreshToken(refreshToken: string): Promise<{
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}> {
	return api.post('/auth/refresh', { refreshToken }).then((res) => res.data);
}

export function logout(refreshToken: string): Promise<{message: string}> {
	return api.post('/auth/logout', { refreshToken }).then((res) => res.data);
}

export function updateProfile(data: {
	phoneNumber?: string;
	location?: string;
	linkedinUrl?: string;
	portfolioUrl?: string;
}): Promise<User> {
	return api.patch('/users/profile', data).then((res) => res.data);
}

/**
 * Get list of linked social accounts for current user
 */
export function getLinkedAccounts(): Promise<LinkedAccountsResponse> {
	return api.get('/auth/linked-accounts').then((res) => res.data);
}

/**
 * Link a social account to the current user
 * Requires Auth0 token in Authorization header and local JWT in X-Local-Token header
 */
export function linkSocialAccount(auth0Token: string, localToken: string): Promise<{message: string}> {
	return api.post('/auth/link-social', {}, {
		headers: {
			'Authorization': `Bearer ${auth0Token}`,
			'X-Local-Token': localToken,
		},
	}).then((res) => res.data);
}

/**
 * Unlink social account from the current user
 */
export function unlinkSocialAccount(): Promise<{message: string}> {
	return api.delete('/auth/unlink-social').then((res) => res.data);
}
