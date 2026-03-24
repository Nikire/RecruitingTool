import {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationFilterDto,
  ApplicationGroupedFilterDto,
  PaginatedApplicationGroupsResponse,
  PublicJobPosition,
} from "../types/application.types";
import { MessageResponse } from "../types/responses";
import api from "./axios";

export function getPublicJobPositions(): Promise<PublicJobPosition[]> {
  return api.get("/job-position/public/all").then((res) => res.data);
}

export function createApplication(
  data: CreateApplicationDto,
): Promise<Application> {
  return api.post("/applications", data).then((res) => res.data);
}

export function getApplications(
  filters?: ApplicationFilterDto,
): Promise<Application[]> {
  return api.get("/applications", { params: filters }).then((res) => res.data);
}

export function getApplicationsGrouped(
  filters?: ApplicationGroupedFilterDto,
): Promise<PaginatedApplicationGroupsResponse> {
  return api
    .get("/applications/grouped", { params: filters })
    .then((res) => res.data);
}

export function getApplication(uid: string): Promise<Application> {
  return api.get(`/applications/${uid}`).then((res) => res.data);
}

export function updateApplication(
  uid: string,
  data: UpdateApplicationDto,
): Promise<Application> {
  return api.put(`/applications/${uid}`, data).then((res) => res.data);
}

export function deleteApplication(uid: string): Promise<MessageResponse> {
  return api.delete(`/applications/${uid}`).then((res) => res.data);
}

export function acceptApplication(uid: string): Promise<Application> {
  return api.put(`/applications/${uid}/accept`).then((res) => res.data);
}
