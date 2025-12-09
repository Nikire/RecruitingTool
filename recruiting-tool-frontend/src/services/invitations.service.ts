import api from '../api/axios';
import { CompanyInvitation, CreateInvitationDto, InvitationStatus } from '../types/invitations';

export const invitationsService = {
  /**
   * Create a new invitation to join a company
   */
  async createInvitation(
    companyUid: string,
    data: CreateInvitationDto,
  ): Promise<CompanyInvitation> {
    const response = await api.post<CompanyInvitation>(
      `/companies/${companyUid}/invitations`,
      data,
    );
    return response.data;
  },

  /**
   * Get all invitations for a company
   */
  async getCompanyInvitations(
    companyUid: string,
    status?: InvitationStatus,
  ): Promise<CompanyInvitation[]> {
    const params = status ? { status } : {};
    const response = await api.get<CompanyInvitation[]>(
      `/companies/${companyUid}/invitations`,
      { params },
    );
    return response.data;
  },

  /**
   * Cancel an invitation
   */
  async cancelInvitation(
    companyUid: string,
    invitationUid: string,
  ): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/companies/${companyUid}/invitations/${invitationUid}`,
    );
    return response.data;
  },

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string): Promise<CompanyInvitation> {
    const response = await api.post<CompanyInvitation>(
      `/invitations/accept/${token}`,
    );
    return response.data;
  },
};
