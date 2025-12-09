import { Candidate } from '@prisma/client';

export function CandidateMapper(candidate: Candidate) {
  return {
    uid: candidate.uid,
    name: candidate.name,
    email: candidate.email,
    source: candidate.source,
    sourceDetails: candidate.sourceDetails,
    sourceUrl: candidate.sourceUrl,
    utmSource: candidate.utmSource,
    utmMedium: candidate.utmMedium,
    utmCampaign: candidate.utmCampaign,
  };
}
