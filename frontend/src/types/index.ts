export interface User {
  id: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Backend uses AUSTRALIAN_PASSPORT, AUSTRALIAN_DRIVERS_LICENCE, RESUME
export type DocumentType = 'AUSTRALIAN_PASSPORT' | 'AUSTRALIAN_DRIVERS_LICENCE' | 'RESUME';

export type DocumentStatus =
  | 'PENDING'
  | 'CLASSIFYING'
  | 'CLASSIFICATION_FAILED'
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'DONE'
  | 'FAILED';

// Check result status types
export type CheckStatus = 'PASS' | 'WARNING' | 'NOT_APPLICABLE' | 'FAIL';

// Individual check result structure
export interface CheckResult {
  name: string;
  result: {
    status: CheckStatus;
    message: string;
    checkMetadata?: Record<string, unknown>;
    checkResponse?: Record<string, unknown>;
  };
  completedAt: string;
}

// Outcome from the verification
export interface VerificationOutcome {
  name: string;
  type: string;
  score: number;
  status: CheckStatus;
  message: string;
}

// Document info within verification result
export interface VerificationDocument {
  documentId: string;
  countryCode: string;
  documentType: string;
}

// Full verification result structure
export interface VerificationResult {
  status: string;
  document: VerificationDocument;
  outcomes: VerificationOutcome[];
  createdAt: string;
  updatedAt: string;
  batchRefId: string | null;
  agentDetail: {
    userId: string;
  };
  tenantAlias: string;
  checkResults: Record<string, CheckResult>;
  externalRefId: string;
  documentVerifyId: string;
  batchRefDescription: string | null;
}

export interface Document {
  id: string;
  fileName: string;
  documentType: DocumentType;
  status: DocumentStatus;
  hasResult: boolean;
  verificationResult?: VerificationResult;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface DocumentSummary {
  total: number;
  uploaded: number;
  processing: number;
  completed: number;
  failed: number;
}

export interface DocumentListResponse {
  documents: Document[];
  summary: DocumentSummary;
}

export interface DocumentUpdate {
  id: string;
  documentType: DocumentType;
  status: DocumentStatus;
  hasResult: boolean;
}

export interface PollResponse {
  updates: DocumentUpdate[];
}

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  error?: string;
}
