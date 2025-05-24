import {User} from '../types/user.types';
import api from './axios';

export function getCurrentUser(): Promise<User> {
	return api.get('/auth/me').then((res) => res.data);
}

export function login(data: {
	email: string;
	password: string;
}): Promise<{user: User; token: string}> {
	return api.post('/auth/sign-in', data).then((res) => res.data);
}

export function register(data: {
	name: string;
	email: string;
	password: string;
}): Promise<{user: User; token: string}> {
	return api.post('/auth/register', data).then((res) => res.data);
}
