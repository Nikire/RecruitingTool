import api from "./axios";

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

export const fetchUnreadReleaseNotes =
  async (): Promise<UnreadReleaseNotesResponse> => {
    const response = await api.get<UnreadReleaseNotesResponse>(
      "/release-notes/unread",
    );
    return response.data;
  };

export const markReleaseNoteSeen = async (
  uid: string,
): Promise<MarkSeenResponse> => {
  const response = await api.post<MarkSeenResponse>(
    `/release-notes/${uid}/mark-seen`,
  );
  return response.data;
};

/**
 * @deprecated Import these from `hooks/api/useReleaseNotes` instead.
 *
 * This module used to hold transport + React Query + Jotai + react-router in
 * one file — the worst instance of the api/ vs hooks/api/ boundary erosion.
 * The hooks now live in `src/hooks/api/useReleaseNotes.ts`; this re-export
 * only exists so the single remaining consumer
 * (`components/common/WhatsNewModal.tsx`) keeps compiling. Point that import at
 * `hooks/api/useReleaseNotes` and delete the two lines below.
 */
export {
  useUnreadReleaseNotes,
  useMarkReleaseNoteSeen,
} from "../hooks/api/useReleaseNotes";
