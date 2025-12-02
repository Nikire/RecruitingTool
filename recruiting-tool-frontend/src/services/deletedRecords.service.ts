import axios from 'axios';
import {
  DeletedCandidate,
  DeletedJobPosition,
  DeletedApplication,
  DeletedInterview,
  PurgeResponse,
} from '../types/deleted.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

/**
 * Service for managing soft-deleted records
 */
export const deletedRecordsService = {
  // ==================== Candidates ====================

  async getDeletedCandidates(): Promise<DeletedCandidate[]> {
    const response = await axios.get(`${API_URL}/admin/deleted/candidates`);
    return response.data;
  },

  async restoreCandidate(uid: string): Promise<DeletedCandidate> {
    const response = await axios.post(`${API_URL}/admin/deleted/candidates/${uid}/restore`);
    return response.data;
  },

  async purgeCandidate(uid: string): Promise<PurgeResponse> {
    const response = await axios.delete(`${API_URL}/admin/deleted/candidates/${uid}/purge`);
    return response.data;
  },

  // ==================== Job Positions ====================

  async getDeletedJobPositions(): Promise<DeletedJobPosition[]> {
    const response = await axios.get(`${API_URL}/admin/deleted/job-positions`);
    return response.data;
  },

  async restoreJobPosition(uid: string): Promise<DeletedJobPosition> {
    const response = await axios.post(`${API_URL}/admin/deleted/job-positions/${uid}/restore`);
    return response.data;
  },

  async purgeJobPosition(uid: string): Promise<PurgeResponse> {
    const response = await axios.delete(`${API_URL}/admin/deleted/job-positions/${uid}/purge`);
    return response.data;
  },

  // ==================== Applications ====================

  async getDeletedApplications(): Promise<DeletedApplication[]> {
    const response = await axios.get(`${API_URL}/admin/deleted/applications`);
    return response.data;
  },

  async restoreApplication(uid: string): Promise<DeletedApplication> {
    const response = await axios.post(`${API_URL}/admin/deleted/applications/${uid}/restore`);
    return response.data;
  },

  async purgeApplication(uid: string): Promise<PurgeResponse> {
    const response = await axios.delete(`${API_URL}/admin/deleted/applications/${uid}/purge`);
    return response.data;
  },

  // ==================== Interviews ====================

  async getDeletedInterviews(): Promise<DeletedInterview[]> {
    const response = await axios.get(`${API_URL}/admin/deleted/interviews`);
    return response.data;
  },

  async restoreInterview(uid: string): Promise<DeletedInterview> {
    const response = await axios.post(`${API_URL}/admin/deleted/interviews/${uid}/restore`);
    return response.data;
  },

  async purgeInterview(uid: string): Promise<PurgeResponse> {
    const response = await axios.delete(`${API_URL}/admin/deleted/interviews/${uid}/purge`);
    return response.data;
  },
};
