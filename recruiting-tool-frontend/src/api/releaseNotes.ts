import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "./axios";
import { useUserAtom } from "../store";
import { UserRoles } from "../types/user.types";
import { useLocation } from "react-router-dom";

export interface ReleaseNoteUserItem {
  uid: string;
  title: string;
  body: string;
  version: string | null;
  targetTier: string;
  publishedAt: string | null;
}

export interface UnreadReleaseNotesResponse {
  notes: ReleaseNoteUserItem[];
}

export interface MarkSeenResponse {
  ok: boolean;
}

const fetchUnreadReleaseNotes =
  async (): Promise<UnreadReleaseNotesResponse> => {
    const response = await api.get<UnreadReleaseNotesResponse>(
      "/release-notes/unread",
    );
    return response.data;
  };

const markReleaseNoteSeen = async (uid: string): Promise<MarkSeenResponse> => {
  const response = await api.post<MarkSeenResponse>(
    `/release-notes/${uid}/mark-seen`,
  );
  return response.data;
};

export function useUnreadReleaseNotes() {
  const { user, isAuthenticated } = useUserAtom();
  const location = useLocation();

  const isAdmin = user?.roles?.some(
    (role) => role === UserRoles.ADMIN || role === UserRoles.SUPER_ADMIN,
  );
  const isAdminPath = location.pathname.startsWith("/admin");

  const enabled = isAuthenticated && !isAdmin && !isAdminPath;

  return useQuery<UnreadReleaseNotesResponse>({
    queryKey: ["release-notes", "unread"],
    queryFn: fetchUnreadReleaseNotes,
    enabled,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}

export function useMarkReleaseNoteSeen() {
  const queryClient = useQueryClient();
  return useMutation<MarkSeenResponse, Error, string>({
    mutationFn: markReleaseNoteSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-notes", "unread"] });
    },
  });
}
