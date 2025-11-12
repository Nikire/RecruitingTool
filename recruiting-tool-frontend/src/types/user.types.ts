export interface User {
	uid: string;
	name: string;
	email: string;
	createdAt?: string;
	updatedAt?: string;
	roles: UserRoles[];
	companyId?: number;
	company?: {
		uid: string;
		name: string;
	};
}

export enum UserRoles {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	HR = 'HR',
	USER = 'USER',
}

export interface CreateUserDto {
	name: string;
	email: string;
	password: string;
	companyUid?: string;
}

export interface UpdateUserDto {
	name?: string;
	email?: string;
	password?: string;
	companyUid?: string;
}
