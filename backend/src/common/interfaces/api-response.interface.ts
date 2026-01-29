export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

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
}
