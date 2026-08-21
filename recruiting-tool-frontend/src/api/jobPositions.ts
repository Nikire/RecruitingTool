import {
  JobModerationQueueParams,
  JobModerationQueueResponse,
  JobModerationStats,
  JobPosition,
  ModerationJobPositionItem,
} from "../types/jobPosition.types";
import { MessageResponse } from "../types/responses";
import { PaginationParams, PaginatedResponse } from "../types/pagination.types";
import api from "./axios";

export interface PublicJobPositionFilters {
  search?: string;
  category?: string;
  jobType?: string;
  workLocation?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  companyUid?: string;
  sortBy?: "createdAt" | "salary" | "title";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedPublicJobPositions {
  data: JobPosition[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPublicJobPositions(
  filters?: PublicJobPositionFilters,
): Promise<PaginatedPublicJobPositions> {
  return api
    .get("/job-position/public/all", { params: filters })
    .then((res) => res.data);
}

export function getPublicJobPosition(uid: string): Promise<JobPosition> {
  return api.get(`/job-position/public/${uid}`).then((res) => res.data);
}

export function getJobPositions(
  uid?: string,
): Promise<JobPosition | JobPosition[]> {
  return api
    .get("/job-position" + (uid ? "/" + uid : ""))
    .then((res) => res.data);
}

export function listJobPositions(
  params: PaginationParams,
): Promise<PaginatedResponse<JobPosition>> {
  return api.get("/job-position/list", { params }).then((res) => res.data);
}

export function createJobPosition(
  data: Partial<JobPosition>,
): Promise<JobPosition> {
  return api.post("/job-position", data).then((res) => res.data);
}

export function updateJobPosition(
  data: Partial<JobPosition>,
  uid: string,
): Promise<JobPosition> {
  return api.put("/job-position/" + uid, data).then((res) => res.data);
}

export function deleteJobPosition(uid: string): Promise<MessageResponse> {
  return api.delete("/job-position/" + uid).then((res) => res.data);
}

// ─── Platform job posting moderation (SUPER_ADMIN only) ──────────────────────

export function getJobModerationStats(): Promise<JobModerationStats> {
  return api.get("/admin/job-moderation/stats").then((res) => res.data);
}

export function getJobModerationQueue(
  params?: JobModerationQueueParams,
): Promise<JobModerationQueueResponse> {
  return api
    .get("/admin/job-moderation/pending", { params })
    .then((res) => res.data);
}

export function getJobModerationItem(
  uid: string,
): Promise<ModerationJobPositionItem> {
  return api.get(`/admin/job-moderation/${uid}`).then((res) => res.data);
}

export function approveJobPosition(
  uid: string,
  reason?: string,
): Promise<ModerationJobPositionItem> {
  return api
    .post(`/admin/job-moderation/${uid}/approve`, reason ? { reason } : {})
    .then((res) => res.data);
}

export function rejectJobPosition(
  uid: string,
  reason: string,
): Promise<ModerationJobPositionItem> {
  return api
    .post(`/admin/job-moderation/${uid}/reject`, { reason })
    .then((res) => res.data);
}
