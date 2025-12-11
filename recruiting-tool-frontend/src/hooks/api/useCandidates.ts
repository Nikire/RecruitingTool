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

const CANDIDATES_KEY = "candidates";

export function useCandidates() {
  return useQuery({
    queryKey: [CANDIDATES_KEY],
    queryFn: getCandidates,
  });
}

export function useListCandidates(params: PaginationParams) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, "list", params],
    queryFn: () => listCandidates(params),
  });
}

export function useCandidate(uid: string) {
  return useQuery({
    queryKey: [CANDIDATES_KEY, uid],
    queryFn: () => getCandidate(uid),
    enabled: !!uid,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Candidate>) => createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CANDIDATES_KEY] });
      showSuccessToast("Candidate created successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to create candidate");
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<Candidate> }) =>
      updateCandidate(data, uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CANDIDATES_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [CANDIDATES_KEY] });
      showSuccessToast("Candidate deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete candidate");
    },
  });
}

// Candidate Notes hooks
const CANDIDATE_NOTES_KEY = "candidate-notes";

export function useCandidateNotes(candidateUid: string) {
  return useQuery({
    queryKey: [CANDIDATE_NOTES_KEY, candidateUid],
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
        queryKey: [CANDIDATE_NOTES_KEY, variables.candidateUid],
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
      queryClient.invalidateQueries({ queryKey: [CANDIDATE_NOTES_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [CANDIDATE_NOTES_KEY] });
      showSuccessToast("Note deleted successfully!");
    },
    onError: (error) => {
      showErrorToast(error, "Failed to delete note");
    },
  });
}
