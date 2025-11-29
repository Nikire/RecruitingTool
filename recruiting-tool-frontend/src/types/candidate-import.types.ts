export interface CandidateImportRow {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  notes?: string;
}

export interface CandidateImportError {
  row: number;
  name?: string;
  email?: string;
  errors: string[];
}

export interface CandidateImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: CandidateImportError[];
  importedCandidates: string[];
}

export interface CandidateImportPreview {
  validRows: CandidateImportRow[];
  invalidRows: CandidateImportError[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
}
