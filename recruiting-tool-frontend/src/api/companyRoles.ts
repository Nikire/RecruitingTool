import api from './axios';
import { CompanyMember, AssignRoleDto, UpdateRoleDto, UserRoles } from '../types/user.types';

export const companyRolesApi = {
	/**
	 * Get all members of a company
	 */
	getCompanyMembers: async (companyUid: string): Promise<CompanyMember[]> => {
		const response = await api.get(`/companies/${companyUid}/roles`);
		return response.data;
	},

	/**
	 * Get roles that the current user can delegate
	 */
	getDelegatableRoles: async (companyUid: string): Promise<UserRoles[]> => {
		const response = await api.get(`/companies/${companyUid}/roles/delegatable`);
		return response.data;
	},

	/**
	 * Assign role(s) to a user
	 */
	assignRole: async (companyUid: string, data: AssignRoleDto): Promise<CompanyMember> => {
		const response = await api.post(`/companies/${companyUid}/roles`, data);
		return response.data;
	},

	/**
	 * Update a user's role(s)
	 */
	updateUserRole: async (companyUid: string, userUid: string, data: UpdateRoleDto): Promise<CompanyMember> => {
		const response = await api.patch(`/companies/${companyUid}/roles/${userUid}`, data);
		return response.data;
	},

	/**
	 * Remove a user from the company
	 */
	removeUserFromCompany: async (companyUid: string, userUid: string): Promise<{ message: string }> => {
		const response = await api.delete(`/companies/${companyUid}/roles/${userUid}`);
		return response.data;
	},
};
