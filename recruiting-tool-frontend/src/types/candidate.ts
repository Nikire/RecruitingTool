export interface Candidate {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateNote {
  uid: string;
  content: string;
  candidateUid: string;
  authorUid: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateNoteDto {
  content: string;
  candidateUid: string;
}

export interface UpdateCandidateNoteDto {
  content: string;
}
