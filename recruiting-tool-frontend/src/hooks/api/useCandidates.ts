import { candidateKeys, candidateNoteKeys } from "../../api/queryKeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  listCandidates,
  getCandidateNotes,
  createCandidateNote,
  updateCandidateNote,
  deleteCandidateNote,
} from "../../api/candidates";
import {
  Candidate,
  CreateCandidateNoteDto,
  UpdateCandidateNoteDto,
} from "../../types/candidate";
import { PaginationParams } from "../../types/pagination.types";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";
import { ANALYTICS_EVENTS } from "../../analytics";
import { useActivationEvents } from "./useActivationEvents";

export function useCandidates() {
  return useQuery({
    queryKey: candidateKeys.all,
    queryFn: getCandidates,
  });
}

export function useListCandidates(params: PaginationParams) {
  return useQuery({
    queryKey: candidateKeys.list(params),
    queryFn: () => listCandidates(params),
  });
}

export function useCandidate(uid: string) {
  return useQuery({
    queryKey: candidateKeys.detail(uid),
    queryFn: () => getCandidate(uid),
    enabled: !!uid,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { trackFirstTime } = useActivationEvents();

  return useMutation({
    mutationFn: (data: Partial<Candidate>) => createCandidate(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
      showSuccessToast(t("candidates.created_success"));
      // Activation milestone. Mirrored server-side as CANDIDATE_CREATED.
      trackFirstTime(ANALYTICS_EVENTS.FIRST_CANDIDATE_ADDED, {
        candidateUid: created?.uid,
      });
    },
    onError: (error) => {
      showErrorToast(error, t("candidates.create_error"));
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<Candidate> }) =>
      updateCandidate(data, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
      showSuccessToast("Candidate updated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update candidate");
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uid: string) => deleteCandidate(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all });
      showSuccessToast("Candidate deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete candidate");
    },
  });
}

// Candidate Notes hooks
export function useCandidateNotes(candidateUid: string) {
  return useQuery({
    queryKey: candidateNoteKeys.byCandidate(candidateUid),
    queryFn: () => getCandidateNotes(candidateUid),
    enabled: !!candidateUid,
  });
}

export function useCreateCandidateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCandidateNoteDto) => createCandidateNote(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: candidateNoteKeys.byCandidate(variables.candidateUid),
      });
      showSuccessToast("Note created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create note");
    },
  });
}

export function useUpdateCandidateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      noteUid,
      data,
    }: {
      noteUid: string;
      data: UpdateCandidateNoteDto;
    }) => updateCandidateNote(noteUid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateNoteKeys.all });
      showSuccessToast("Note updated successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to update note");
    },
  });
}

export function useDeleteCandidateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteUid: string) => deleteCandidateNote(noteUid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateNoteKeys.all });
      showSuccessToast("Note deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete note");
    },
  });
}
