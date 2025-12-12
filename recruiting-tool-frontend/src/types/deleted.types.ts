/**
 * Deleted Candidate record
 */
export interface DeletedCandidate {
  uid: string;
  name: string;
  email: string;
  source?: string;
  deletedAt: Date;
  createdAt: Date;
}

/**
 * Deleted JobPosition record
 */
export interface DeletedJobPosition {
  uid: string;
  title: string;
  description?: string;
  status: string;
  deletedAt: Date;
  createdAt: Date;
}

/**
 * Deleted Application record
 */
export interface DeletedApplication {
  uid: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  deletedAt: Date;
  appliedAt: Date;
}

/**
 * Deleted Interview record
 */
export interface DeletedInterview {
  uid: string;
  scheduledDate?: Date;
  status: string;
  deletedAt: Date;
  createdAt: Date;
}

/**
 * Purge operation response
 */
export interface PurgeResponse {
  success: boolean;
  message: string;
}

/**
 * Entity type for deleted records
 */
export type DeletedEntityType =
  | "candidates"
  | "job-positions"
  | "applications"
  | "interviews";
