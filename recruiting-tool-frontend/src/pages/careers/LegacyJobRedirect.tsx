import { Navigate, useParams } from "react-router-dom";

import CenteredLoadingSpinner from "../../components/common/CenteredLoadingSpinner";
import { usePublicJobPosition } from "../../hooks/api/useJobPositions";
import type { JobPosition } from "../../types/jobPosition.types";
import JobPositionDetailPage from "../job-position-detail/JobPositionDetailPage";
import { buildJobPath } from "./careersUrls";

/**
 * Keeps the old `/careers/:uid` job URLs alive.
 *
 * Those URLs are already in candidates' inboxes, in WhatsApp threads, in job
 * ads and possibly in Google's index. Retiring them would break every one of
 * those links, so the route stays and forwards to the canonical slugged URL
 * with `replace`, which drops the old entry from the visitor's history rather
 * than trapping the back button on a redirector.
 *
 * A missing or closed posting is NOT redirected: it renders the detail page's
 * own not-found state, which emits `noindex` — bouncing a dead job URL to the
 * board would turn a clean soft 404 into a page that silently answers 200 with
 * unrelated content.
 *
 * NOTE: this is a client-side redirect, so search engines see it as a JS
 * redirect rather than a 301. The detail page self-canonicalises to the slugged
 * URL from either path, which is what actually consolidates the two in search;
 * an nginx 301 is listed as a founder follow-up for the cleanest signal.
 */
const LegacyJobRedirect: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const { data, isLoading, error } = usePublicJobPosition(uid || "");

  if (isLoading) {
    return <CenteredLoadingSpinner />;
  }

  // React Query caches by UID, so the detail page reuses this exact result
  // instead of issuing a second request.
  if (error || !data) {
    return <JobPositionDetailPage />;
  }

  const job = data as JobPosition;

  return (
    <Navigate
      to={buildJobPath({
        uid: job.uid,
        title: job.title,
        companyName: job.companyName,
      })}
      replace
    />
  );
};

export default LegacyJobRedirect;
