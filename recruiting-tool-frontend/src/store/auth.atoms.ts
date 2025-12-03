/**
 * Authentication State Atoms
 *
 * Manages user authentication state using Jotai.
 * This is in-memory only (not persisted to localStorage) for security.
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, setUser } = useUserAtom();
 * ```
 */
import {useCallback} from 'react';
import {atom, useAtom, useAtomValue} from 'jotai';
import type {User} from '../types/user.types';

/**
 * Core user atom - stores the authenticated user
 * In-memory only for security (tokens should not be persisted)
 */
export const userAtom = atom<User | null>(null);

/**
 * Derived atom - computed authentication status
 * Automatically updates when userAtom changes
 */
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null);

/**
 * Hook for managing user authentication state
 *
 * Provides:
 * - user: Current authenticated user or null
 * - isAuthenticated: Boolean indicating if user is logged in
 * - setUser: Set the entire user object (for login)
 * - updateUser: Partial update of user fields (for profile updates)
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, setUser, updateUser } = useUserAtom();
 *
 * // On login
 * setUser(userData);
 *
 * // On profile update
 * updateUser({ name: 'New Name' });
 *
 * // On logout
 * setUser(null);
 * ```
 */
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
