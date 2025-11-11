import {useCallback} from 'react';
import {atom, useAtom, useAtomValue} from 'jotai';
import type {User} from '../../../types/user.types';

// Store user in memory only (not in localStorage)
const userAtom = atom<User | null>(null);
const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

export function useUserAtom() {
	const [user, setUser] = useAtom(userAtom);
	const isAuthenticated = useAtomValue(isAuthenticatedAtom);

	const updateUser = useCallback(
		(patch: Partial<User>) => {
			setUser((prev) => (prev ? {...prev, ...patch} : prev));
		},
		[setUser]
	);

	return {
		user,
		isAuthenticated,
		setUser,
		updateUser,
	};
}
