import api from "../../../api/axios";
import {
  ConnectionRequest,
  CreateConnectionRequestDto,
  ApproveConnectionRequestDto,
  DenyConnectionRequestDto,
  GetConnectionRequestsQuery,
} from "../../../types/connection-requests";

/**
 * Submit a request to join a company
 */
export const createConnectionRequest = async (
  dto: CreateConnectionRequestDto,
): Promise<ConnectionRequest> => {
  const response = await api.post<ConnectionRequest>(
    "/connection-requests",
    dto,
  );
  return response.data;
};

/**
 * Get my connection requests
 */
export const getMyConnectionRequests = async (
  query?: GetConnectionRequestsQuery,
): Promise<ConnectionRequest[]> => {
  const response = await api.get<ConnectionRequest[]>(
    "/connection-requests/my-requests",
    { params: query },
  );
  return response.data;
};

/**
 * Get connection requests for a company (admin/owner only)
 */
export const getCompanyConnectionRequests = async (
  companyUid: string,
  query?: GetConnectionRequestsQuery,
): Promise<ConnectionRequest[]> => {
  const response = await api.get<ConnectionRequest[]>(
    `/connection-requests/companies/${companyUid}`,
    { params: query },
  );
  return response.data;
};

/**
 * Approve a connection request
 */
export const approveConnectionRequest = async (
  requestUid: string,
  dto: ApproveConnectionRequestDto,
): Promise<ConnectionRequest> => {
  const response = await api.patch<ConnectionRequest>(
    `/connection-requests/${requestUid}/approve`,
    dto,
  );
  return response.data;
};

/**
 * Deny a connection request
 */
export const denyConnectionRequest = async (
  requestUid: string,
  dto: DenyConnectionRequestDto,
): Promise<ConnectionRequest> => {
  const response = await api.patch<ConnectionRequest>(
    `/connection-requests/${requestUid}/deny`,
    dto,
  );
  return response.data;
};

/**
 * Cancel a connection request (by requester)
 */
export const cancelConnectionRequest = async (
  requestUid: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/connection-requests/${requestUid}`,
  );
  return response.data;
};
