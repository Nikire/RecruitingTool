import api from "./axios";
import type {
  ProspectCompany,
  ProspectStats,
  ProspectListResponse,
  CreateProspectDto,
  UpdateProspectDto,
  CreateOutreachContactDto,
  CreateOutreachActivityDto,
  ProspectListParams,
  ProspectContact,
  ProspectActivity,
} from "../types/prospect-tracking.types";

const BASE = "/prospect-tracking";

export function getProspects(
  params?: ProspectListParams,
): Promise<ProspectListResponse> {
  return api.get(BASE, { params }).then((res) => res.data);
}

export function getProspectStats(): Promise<ProspectStats> {
  return api.get(`${BASE}/stats`).then((res) => res.data);
}

export function getProspect(uid: string): Promise<ProspectCompany> {
  return api.get(`${BASE}/${uid}`).then((res) => res.data);
}

export function createProspect(
  dto: CreateProspectDto,
): Promise<ProspectCompany> {
  return api.post(BASE, dto).then((res) => res.data);
}

export function updateProspect(
  uid: string,
  dto: UpdateProspectDto,
): Promise<ProspectCompany> {
  return api.patch(`${BASE}/${uid}`, dto).then((res) => res.data);
}

export function deleteProspect(uid: string): Promise<void> {
  return api.delete(`${BASE}/${uid}`).then(() => undefined);
}

export function addProspectContact(
  uid: string,
  dto: CreateOutreachContactDto,
): Promise<ProspectContact> {
  return api.post(`${BASE}/${uid}/contacts`, dto).then((res) => res.data);
}

export function removeProspectContact(
  uid: string,
  contactUid: string,
): Promise<void> {
  return api
    .delete(`${BASE}/${uid}/contacts/${contactUid}`)
    .then(() => undefined);
}

export function addProspectActivity(
  uid: string,
  dto: CreateOutreachActivityDto,
): Promise<ProspectActivity> {
  return api.post(`${BASE}/${uid}/activities`, dto).then((res) => res.data);
}
