import api from "../api/axios";
import {
  DeletedCandidate,
  DeletedJobPosition,
  DeletedApplication,
  DeletedInterview,
  PurgeResponse,
} from "../types/deleted.types";

/**
 * Service for managing soft-deleted records
 */
export const deletedRecordsService = {
  // ==================== Candidates ====================

  async getDeletedCandidates(): Promise<DeletedCandidate[]> {
    const response = await api.get<DeletedCandidate[]>(
      "/admin/deleted/candidates",
    );
    return response.data;
  },

  async restoreCandidate(uid: string): Promise<DeletedCandidate> {
    const response = await api.post<DeletedCandidate>(
      `/admin/deleted/candidates/${uid}/restore`,
    );
    return response.data;
  },

  async purgeCandidate(uid: string): Promise<PurgeResponse> {
    const response = await api.delete<PurgeResponse>(
      `/admin/deleted/candidates/${uid}/purge`,
    );
    return response.data;
  },

  // ==================== Job Positions ====================

  async getDeletedJobPositions(): Promise<DeletedJobPosition[]> {
    const response = await api.get<DeletedJobPosition[]>(
      "/admin/deleted/job-positions",
    );
    return response.data;
  },

  async restoreJobPosition(uid: string): Promise<DeletedJobPosition> {
    const response = await api.post<DeletedJobPosition>(
      `/admin/deleted/job-positions/${uid}/restore`,
    );
    return response.data;
  },

  async purgeJobPosition(uid: string): Promise<PurgeResponse> {
    const response = await api.delete<PurgeResponse>(
      `/admin/deleted/job-positions/${uid}/purge`,
    );
    return response.data;
  },

  // ==================== Applications ====================

  async getDeletedApplications(): Promise<DeletedApplication[]> {
    const response = await api.get<DeletedApplication[]>(
      "/admin/deleted/applications",
    );
    return response.data;
  },

  async restoreApplication(uid: string): Promise<DeletedApplication> {
    const response = await api.post<DeletedApplication>(
      `/admin/deleted/applications/${uid}/restore`,
    );
    return response.data;
  },

  async purgeApplication(uid: string): Promise<PurgeResponse> {
    const response = await api.delete<PurgeResponse>(
      `/admin/deleted/applications/${uid}/purge`,
    );
    return response.data;
  },

  // ==================== Interviews ====================

  async getDeletedInterviews(): Promise<DeletedInterview[]> {
    const response = await api.get<DeletedInterview[]>(
      "/admin/deleted/interviews",
    );
    return response.data;
  },

  async restoreInterview(uid: string): Promise<DeletedInterview> {
    const response = await api.post<DeletedInterview>(
      `/admin/deleted/interviews/${uid}/restore`,
    );
    return response.data;
  },

  async purgeInterview(uid: string): Promise<PurgeResponse> {
    const response = await api.delete<PurgeResponse>(
      `/admin/deleted/interviews/${uid}/purge`,
    );
    return response.data;
  },
};
