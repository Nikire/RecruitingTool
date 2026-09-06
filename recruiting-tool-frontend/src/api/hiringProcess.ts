import {
  HiringProcess,
  CreateHiringProcessDto,
  HiringProcessGroupedFilterDto,
  PaginatedHiringProcessGroupsResponse,
} from "../types/hiringProcess.types";
import { MessageResponse } from "../types/responses";
import {
  PaginationParams,
  PaginatedResponse,
  toListQuery,
} from "../types/pagination.types";
import api from "./axios";

export function getHiringProcesses(
  uid?: string,
): Promise<HiringProcess | HiringProcess[]> {
  return api
    .get("/hiring-process" + (uid ? "/" + uid : ""))
    .then((res) => res.data);
}

export function listHiringProcesses(
  params: PaginationParams & { status?: string },
): Promise<PaginatedResponse<HiringProcess>> {
  // Filter out 'all' status value - backend only accepts valid enum values
  const filteredParams: PaginationParams & { status?: string } = { ...params };
  if (filteredParams.status === "all" || filteredParams.status === "") {
    delete filteredParams.status;
  }
  return api
    .get("/hiring-process/list", { params: toListQuery(filteredParams) })
    .then((res) => res.data);
}

export function listHiringProcessesGrouped(
  params: HiringProcessGroupedFilterDto,
): Promise<PaginatedHiringProcessGroupsResponse> {
  const filteredParams = { ...params };
  if (filteredParams.status === "all" || filteredParams.status === "") {
    delete filteredParams.status;
  }
  return api
    .get("/hiring-process/list-grouped", { params: filteredParams })
    .then((res) => res.data);
}

export function createHiringProcess(
  data: CreateHiringProcessDto,
): Promise<HiringProcess> {
  return api.post("/hiring-process", data).then((res) => res.data);
}

export function updateHiringProcess(
  data: Partial<HiringProcess>,
  uid: string,
): Promise<HiringProcess> {
  return api.put("/hiring-process/" + uid, data).then((res) => res.data);
}

export function deleteHiringProcess(uid: string): Promise<MessageResponse> {
  return api.delete("/hiring-process/" + uid).then((res) => res.data);
}

export function progressStage(uid: string): Promise<HiringProcess> {
  return api
    .post(`/hiring-process/${uid}/progress-stage`)
    .then((res) => res.data);
}

export function moveToStage(
  uid: string,
  stageUid: string,
): Promise<HiringProcess> {
  return api
    .post(`/hiring-process/${uid}/move-to-stage/${stageUid}`)
    .then((res) => res.data);
}

export interface AccessCodeResponse {
  accessCode: string;
  expiresAt: Date;
}

export interface PublicStatusResponse {
  candidateName: string;
  positionTitle: string;
  companyName: string;
  currentStage?: string;
  status: string;
  lastUpdated: Date;
}

export interface PublicStage {
  uid: string;
  title: string;
  type: string;
  position: number;
  status: "COMPLETED" | "CURRENT" | "PENDING";
  description?: string;
  estimatedTime?: number;
}

export interface PublicHiringProcessTracking {
  uid: string;
  candidateName: string;
  positionTitle: string;
  companyName: string;
  status: string;
  stages: PublicStage[];
  lastUpdated: Date;
}

export function generateAccessCode(uid: string): Promise<AccessCodeResponse> {
  return api
    .post(`/hiring-process/${uid}/generate-access-code`)
    .then((res) => res.data);
}

export function getStatusByAccessCode(
  accessCode: string,
): Promise<PublicStatusResponse> {
  return api.get(`/public/status/${accessCode}`).then((res) => res.data);
}

export function getPublicHiringProcessTracking(
  uid: string,
  code: string,
): Promise<PublicHiringProcessTracking> {
  return api
    .get(`/hiring-process/${uid}/public`, { params: { code } })
    .then((res) => res.data);
}
