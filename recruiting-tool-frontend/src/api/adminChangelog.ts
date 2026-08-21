import { adminKeys } from "./queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

export interface ReleaseNoteAdminItem {
  uid: string;
  title: string;
  body: string;
  version: string | null;
  targetTier: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  seenCount: number;
}

export interface ReleaseNoteListResponse {
  notes: ReleaseNoteAdminItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminChangelogParams {
  page?: number;
  limit?: number;
  published?: string;
}

export interface CreateReleaseNotePayload {
  title: string;
  body: string;
  version?: string;
  targetTier?: "all" | "professional" | "enterprise";
  isPublished?: boolean;
}

export interface UpdateReleaseNotePayload {
  uid: string;
  title?: string;
  body?: string;
  version?: string;
  targetTier?: "all" | "professional" | "enterprise";
  isPublished?: boolean;
}

const fetchAdminReleaseNotes = async (
  params: AdminChangelogParams,
): Promise<ReleaseNoteListResponse> => {
  const queryParams: Record<string, string | number> = {};
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;
  if (params.published !== undefined) queryParams.published = params.published;

  const response = await api.get<ReleaseNoteListResponse>(
    "/admin/release-notes",
    { params: queryParams },
  );
  return response.data;
};

const createReleaseNote = async (
  payload: CreateReleaseNotePayload,
): Promise<ReleaseNoteAdminItem> => {
  const response = await api.post<ReleaseNoteAdminItem>(
    "/admin/release-notes",
    payload,
  );
  return response.data;
};

const updateReleaseNote = async (
  payload: UpdateReleaseNotePayload,
): Promise<ReleaseNoteAdminItem> => {
  const { uid, ...body } = payload;
  const response = await api.patch<ReleaseNoteAdminItem>(
    `/admin/release-notes/${uid}`,
    body,
  );
  return response.data;
};

const togglePublishReleaseNote = async (
  uid: string,
): Promise<ReleaseNoteAdminItem> => {
  const response = await api.patch<ReleaseNoteAdminItem>(
    `/admin/release-notes/${uid}/publish`,
  );
  return response.data;
};

const deleteReleaseNote = async (uid: string): Promise<void> => {
  await api.delete(`/admin/release-notes/${uid}`);
};

export function useAdminReleaseNotes(params: AdminChangelogParams) {
  return useQuery<ReleaseNoteListResponse>({
    queryKey: adminKeys.releaseNotesList(params),
    queryFn: () => fetchAdminReleaseNotes(params),
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

export function useCreateReleaseNote() {
  const queryClient = useQueryClient();
  return useMutation<ReleaseNoteAdminItem, Error, CreateReleaseNotePayload>({
    mutationFn: createReleaseNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.releaseNotes() });
    },
  });
}

export function useUpdateReleaseNote() {
  const queryClient = useQueryClient();
  return useMutation<ReleaseNoteAdminItem, Error, UpdateReleaseNotePayload>({
    mutationFn: updateReleaseNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.releaseNotes() });
    },
  });
}

export function useTogglePublishReleaseNote() {
  const queryClient = useQueryClient();
  return useMutation<ReleaseNoteAdminItem, Error, string>({
    mutationFn: togglePublishReleaseNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.releaseNotes() });
    },
  });
}

export function useDeleteReleaseNote() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteReleaseNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.releaseNotes() });
    },
  });
}
