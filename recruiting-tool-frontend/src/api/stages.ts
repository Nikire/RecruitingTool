import axiosInstance from "./axios";
import {
  Stage,
  StageNote,
  CreateStageNoteDto,
  UpdateStageNoteDto,
} from "../types/stage.types";
import { PaginationParams, PaginatedResponse } from "../types/pagination.types";

export const listStages = async (
  params: PaginationParams,
): Promise<PaginatedResponse<Stage>> => {
  const response = await axiosInstance.get("/stages/list", { params });
  return response.data;
};

export const getStage = async (uid: string): Promise<Stage> => {
  const response = await axiosInstance.get(`/stages/${uid}`);
  return response.data;
};

export const createStage = async (data: Partial<Stage>): Promise<Stage> => {
  const response = await axiosInstance.post("/stages", data);
  return response.data;
};

export const bulkCreateStages = async (
  data: Partial<Stage>[],
): Promise<Stage[]> => {
  const response = await axiosInstance.post("/stages/bulk", data);
  return response.data;
};

export const updateStage = async (
  data: Partial<Stage>,
  uid: string,
): Promise<Stage> => {
  const response = await axiosInstance.put(`/stages/${uid}`, data);
  return response.data;
};

export const deleteStage = async (uid: string): Promise<void> => {
  await axiosInstance.delete(`/stages/${uid}`);
};

export const reorderStages = async (
  stages: { uid: string; position: number }[],
): Promise<void> => {
  await axiosInstance.patch("/stages/reorder", { stages });
};

// Stage Notes API functions
export const getStageNotes = async (stageUid: string): Promise<StageNote[]> => {
  const response = await axiosInstance.get(`/stages/${stageUid}/notes`);
  return response.data;
};

export const createStageNote = async (
  stageUid: string,
  data: CreateStageNoteDto,
): Promise<StageNote> => {
  const response = await axiosInstance.post(`/stages/${stageUid}/notes`, data);
  return response.data;
};

export const updateStageNote = async (
  noteUid: string,
  data: UpdateStageNoteDto,
): Promise<StageNote> => {
  const response = await axiosInstance.put(`/stages/notes/${noteUid}`, data);
  return response.data;
};

export const deleteStageNote = async (noteUid: string): Promise<void> => {
  await axiosInstance.delete(`/stages/notes/${noteUid}`);
};
