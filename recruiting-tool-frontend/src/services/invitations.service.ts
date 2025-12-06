import axios from 'axios';
import { CompanyInvitation, CreateInvitationDto, InvitationStatus } from '../types/invitations';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const invitationsService = {
  /**
   * Create a new invitation to join a company
   */
  async createInvitation(
    companyUid: string,
    data: CreateInvitationDto,
  ): Promise<CompanyInvitation> {
    const response = await axios.post<CompanyInvitation>(
      `${API_BASE_URL}/companies/${companyUid}/invitations`,
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
    const response = await axios.get<CompanyInvitation[]>(
      `${API_BASE_URL}/companies/${companyUid}/invitations`,
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
    const response = await axios.delete<{ message: string }>(
      `${API_BASE_URL}/companies/${companyUid}/invitations/${invitationUid}`,
    );
    return response.data;
  },

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string): Promise<CompanyInvitation> {
    const response = await axios.post<CompanyInvitation>(
      `${API_BASE_URL}/invitations/accept/${token}`,
    );
    return response.data;
  },
};
