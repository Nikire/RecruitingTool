import { Candidate } from '@prisma/client';

export function CandidateMapper(candidate: Candidate) {
  return {
    uid: candidate.uid,
    name: candidate.name,
    email: candidate.email,
  };
}
