import axiosInstance from "./axios";
import {
  CandidateStageNote,
  StageEvalNote,
  UpsertStageEvalNoteDto,
} from "../types/stage.types";

export const upsertStageEvalNote = async (
  hiringProcessUid: string,
  stageUid: string,
  data: UpsertStageEvalNoteDto,
): Promise<StageEvalNote> => {
  const response = await axiosInstance.put(
    `/hiring-process/${hiringProcessUid}/stages/${stageUid}/note`,
    data,
  );
  return response.data;
};

export const getStageEvalNote = async (
  hiringProcessUid: string,
  stageUid: string,
): Promise<StageEvalNote> => {
  const response = await axiosInstance.get(
    `/hiring-process/${hiringProcessUid}/stages/${stageUid}/note`,
  );
  return response.data;
};

export const deleteStageEvalNote = async (
  hiringProcessUid: string,
  stageUid: string,
): Promise<void> => {
  await axiosInstance.delete(
    `/hiring-process/${hiringProcessUid}/stages/${stageUid}/note`,
  );
};

export const getCandidateStageNotes = (
  candidateUid: string,
): Promise<CandidateStageNote[]> =>
  axiosInstance
    .get(`/candidate/${candidateUid}/stage-eval-notes`)
    .then((r) => r.data);
