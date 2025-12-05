export interface User {
	uid: string;
	name: string;
	email: string;
	createdAt?: string;
	updatedAt?: string;
	roles: UserRoles[];
	companyUid?: string;
	company?: {
		uid: string;
		name: string;
	};
	profilePicture?: string;
	phoneNumber?: string;
	position?: string;
	department?: string;
	bio?: string;
	linkedinUrl?: string;
	timezone?: string;
}

export enum UserRoles {
	SUPER_ADMIN = 'SUPER_ADMIN',
	ADMIN = 'ADMIN',
	HR = 'HR',
	USER = 'USER',
	COMPANY_OWNER = 'COMPANY_OWNER',
}

export interface CreateUserDto {
	name: string;
	email: string;
	password: string;
	companyUid?: string;
	roles?: UserRoles[];
}

export interface UpdateUserDto {
	name?: string;
	email?: string;
	password?: string;
	companyUid?: string;
	roles?: UserRoles[];
	profilePicture?: string;
	phoneNumber?: string;
	position?: string;
	department?: string;
	bio?: string;
	linkedinUrl?: string;
	timezone?: string;
}
