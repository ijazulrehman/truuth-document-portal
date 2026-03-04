// Error codes used throughout the application
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',

  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_DOCUMENT = 'DUPLICATE_DOCUMENT',

  // Truuth API errors
  CLASSIFICATION_FAILED = 'CLASSIFICATION_FAILED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
  TRUUTH_API_ERROR = 'TRUUTH_API_ERROR',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// File upload constraints
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// Document requirements
export const TOTAL_REQUIRED_DOCUMENTS = 3;

// Truuth document type mapping
export const TRUUTH_DOCUMENT_TYPE_MAP: Record<string, string> = {
  AUSTRALIAN_PASSPORT: 'PASSPORT',
  AUSTRALIAN_DRIVERS_LICENCE: 'DRIVING_LICENSE',
  RESUME: 'OTHER',
};

// Expected document classifications
export const EXPECTED_CLASSIFICATIONS = {
  AUSTRALIAN_PASSPORT: {
    countryCode: 'AUS',
    documentTypeCode: 'PASSPORT',
  },
  AUSTRALIAN_DRIVERS_LICENCE: {
    countryCode: 'AUS',
    documentTypeCode: 'DRIVING_LICENSE',
  },
};

// Verification required checks - must be array of objects with "name" property
export const VERIFICATION_REQUIRED_CHECKS = [
  { name: 'ANNOTATION' },
  { name: 'C2PA' },
  { name: 'COMPRESSION_HEATMAP' },
  { name: 'DEEPFAKE_2' },
  { name: 'DEEPFAKE_3' },
  { name: 'DEEPFAKE_4' },
  { name: 'DEEPFAKE_5' },
  { name: 'DEEPFAKE_6' },
  { name: 'DEEPFAKE_7' },
  { name: 'DEEPFAKE' },
  { name: 'EOF_COUNT' },
  { name: 'HANDWRITING' },
  { name: 'INVOICE_DATE_ANOMALY_CHECK' },
  { name: 'INVOICE_TOTAL_ANOMALY_CHECK' },
  { name: 'SCREENSHOT' },
  { name: 'SOFTWARE_EDITOR' },
  { name: 'SOFTWARE_FINGERPRINT' },
  { name: 'TIMESTAMP' },
  { name: 'VENDOR_MISSING_FIELDS' },
  { name: 'VENDOR_VALIDATION' },
  { name: 'VISUAL_ANOMALY' },
  { name: 'WATERMARK_CHECK' },
];
