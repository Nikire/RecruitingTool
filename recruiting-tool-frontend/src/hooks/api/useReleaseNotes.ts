import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { releaseNoteKeys } from "../../api/queryKeys";
import {
  fetchUnreadReleaseNotes,
  markReleaseNoteSeen,
  type MarkSeenResponse,
  type UnreadReleaseNotesResponse,
} from "../../api/releaseNotes";
import { useUserAtom } from "../../store";
import { UserRoles } from "../../types/user.types";

/**
 * Unread "What's New" entries for the signed-in user.
 *
 * Suppressed for admins and anywhere under /admin: the changelog is a
 * product-announcement surface for customers, and admins author the entries.
 */
export function useUnreadReleaseNotes() {
  const { user, isAuthenticated } = useUserAtom();
  const location = useLocation();

  const isAdmin = user?.roles?.some(
    (role) => role === UserRoles.ADMIN || role === UserRoles.SUPER_ADMIN,
  );
  const isAdminPath = location.pathname.startsWith("/admin");

  const enabled = isAuthenticated && !isAdmin && !isAdminPath;

  return useQuery<UnreadReleaseNotesResponse>({
    queryKey: releaseNoteKeys.unread(),
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
      queryClient.invalidateQueries({ queryKey: releaseNoteKeys.unread() });
    },
  });
}
