export interface User {
	uid: string;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
	roles: UserRoles[];
}

export enum UserRoles {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	HR = 'HR',
	USER = 'USER',
}
