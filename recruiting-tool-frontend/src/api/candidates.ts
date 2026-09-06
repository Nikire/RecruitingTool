import axiosInstance from "./axios";
import { CandidateActivity } from "../types/candidate-activity.types";
import {
  Candidate,
  CandidateNote,
  CreateCandidateNoteDto,
  UpdateCandidateNoteDto,
} from "../types/candidate";
import {
  PaginationParams,
  PaginatedResponse,
  toListQuery,
} from "../types/pagination.types";

export const getCandidates = async (): Promise<Candidate[]> => {
  const response = await axiosInstance.get("/candidate");
  return response.data;
};

export const listCandidates = async (
  params: PaginationParams,
): Promise<PaginatedResponse<Candidate>> => {
  const response = await axiosInstance.get("/candidate/list", {
    params: toListQuery(params),
  });
  return response.data;
};

export const getCandidate = async (uid: string): Promise<Candidate> => {
  const response = await axiosInstance.get(`/candidate/${uid}`);
  return response.data;
};

export const createCandidate = async (
  data: Partial<Candidate>,
): Promise<Candidate> => {
  const response = await axiosInstance.post("/candidate", data);
  return response.data;
};

export const updateCandidate = async (
  data: Partial<Candidate>,
  uid: string,
): Promise<Candidate> => {
  const response = await axiosInstance.put(`/candidate/${uid}`, data);
  return response.data;
};

export const deleteCandidate = async (uid: string): Promise<void> => {
  await axiosInstance.delete(`/candidate/${uid}`);
};

// Candidate Notes API
export const getCandidateNotes = async (
  candidateUid: string,
): Promise<CandidateNote[]> => {
  const response = await axiosInstance.get(`/candidate/${candidateUid}/notes`);
  return response.data;
};

export const createCandidateNote = async (
  data: CreateCandidateNoteDto,
): Promise<CandidateNote> => {
  const response = await axiosInstance.post(
    `/candidate/${data.candidateUid}/notes`,
    data,
  );
  return response.data;
};

export const updateCandidateNote = async (
  noteUid: string,
  data: UpdateCandidateNoteDto,
): Promise<CandidateNote> => {
  const response = await axiosInstance.put(`/candidate/notes/${noteUid}`, data);
  return response.data;
};

export const deleteCandidateNote = async (noteUid: string): Promise<void> => {
  await axiosInstance.delete(`/candidate/notes/${noteUid}`);
};

export const getCandidateActivities = async (
  candidateUid: string,
): Promise<CandidateActivity[]> => {
  const response = await axiosInstance.get(
    `/candidate/${candidateUid}/activities`,
  );
  return response.data;
};
