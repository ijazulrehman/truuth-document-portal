import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ErrorCode } from '../utils/constants';
import { logger } from '../utils/logger';
import { MulterError } from 'multer';

// Map HTTP status codes to error codes
const mapStatusToCode = (status: number): ErrorCode => {
  const statusCodeMap: Record<number, ErrorCode> = {
    400: ErrorCode.VALIDATION_ERROR,
    401: ErrorCode.UNAUTHORIZED,
    403: ErrorCode.UNAUTHORIZED,
    404: ErrorCode.NOT_FOUND,
    409: ErrorCode.DUPLICATE_DOCUMENT,
    413: ErrorCode.FILE_TOO_LARGE,
    415: ErrorCode.INVALID_FILE_TYPE,
    429: ErrorCode.RATE_LIMIT_EXCEEDED,
    500: ErrorCode.INTERNAL_ERROR,
  };

  return statusCodeMap[status] || ErrorCode.INTERNAL_ERROR;
};

export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code: ErrorCode = ErrorCode.INTERNAL_ERROR;
  let message = 'An unexpected error occurred. Please try again.';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
  } else if (error instanceof MulterError) {
    statusCode = 400;
    if (error.code === 'LIMIT_FILE_SIZE') {
      code = ErrorCode.FILE_TOO_LARGE;
      message = 'File is too large. Maximum size is 10MB.';
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      code = ErrorCode.VALIDATION_ERROR;
      message = 'Unexpected file field.';
    } else {
      code = ErrorCode.VALIDATION_ERROR;
      message = error.message;
    }
  } else if (error instanceof SyntaxError && 'body' in error) {
    // JSON parse error
    statusCode = 400;
    code = ErrorCode.VALIDATION_ERROR;
    message = 'Invalid JSON in request body.';
  } else if (error instanceof Error) {
    // Generic error - keep internal details hidden
    code = mapStatusToCode(statusCode);
  }

  // Log the error
  logger.error(
    `${req.method} ${req.url} - ${statusCode} - ${code}: ${message}`,
    error.stack
  );

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
