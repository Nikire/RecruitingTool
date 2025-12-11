import axios from "axios";
import {
  ConnectionRequest,
  CreateConnectionRequestDto,
  ApproveConnectionRequestDto,
  DenyConnectionRequestDto,
  GetConnectionRequestsQuery,
} from "../../../types/connection-requests";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Submit a request to join a company
 */
export const createConnectionRequest = async (
  dto: CreateConnectionRequestDto,
): Promise<ConnectionRequest> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.post(
    `${API_BASE_URL}/connection-requests`,
    dto,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

/**
 * Get my connection requests
 */
export const getMyConnectionRequests = async (
  query?: GetConnectionRequestsQuery,
): Promise<ConnectionRequest[]> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(
    `${API_BASE_URL}/connection-requests/my-requests`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: query,
    },
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
  const token = localStorage.getItem("authToken");
  const response = await axios.get(
    `${API_BASE_URL}/connection-requests/companies/${companyUid}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: query,
    },
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
  const token = localStorage.getItem("authToken");
  const response = await axios.patch(
    `${API_BASE_URL}/connection-requests/${requestUid}/approve`,
    dto,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
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
  const token = localStorage.getItem("authToken");
  const response = await axios.patch(
    `${API_BASE_URL}/connection-requests/${requestUid}/deny`,
    dto,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};

/**
 * Cancel a connection request (by requester)
 */
export const cancelConnectionRequest = async (
  requestUid: string,
): Promise<{ message: string }> => {
  const token = localStorage.getItem("authToken");
  const response = await axios.delete(
    `${API_BASE_URL}/connection-requests/${requestUid}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data;
};
