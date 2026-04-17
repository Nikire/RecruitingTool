import { Candidate, User } from '@prisma/client';

type CandidateWithCreator = Candidate & { createdByUser?: User | null };

export function CandidateMapper(candidate: CandidateWithCreator) {
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
    createdAt: candidate.createdAt,
    createdByName: candidate.createdByUser?.name ?? null,
  };
}
