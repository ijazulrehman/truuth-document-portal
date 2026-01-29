import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorCode } from '../interfaces/api-response.interface';

interface ExceptionResponse {
  code?: string;
  message?: string | string[];
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.INTERNAL_ERROR;
    let message = 'An unexpected error occurred. Please try again.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as ExceptionResponse;

      // Extract code if provided
      if (exceptionResponse.code) {
        code = exceptionResponse.code as ErrorCode;
      } else {
        code = this.mapStatusToCode(status);
      }

      // Extract message
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (Array.isArray(exceptionResponse.message)) {
        message = exceptionResponse.message[0];
      } else if (exceptionResponse.message) {
        message = exceptionResponse.message;
      } else if (exceptionResponse.error) {
        message = exceptionResponse.error;
      }
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${code}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }

  private mapStatusToCode(status: number): ErrorCode {
    const statusCodeMap: Record<number, ErrorCode> = {
      400: ErrorCode.VALIDATION_ERROR,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.UNAUTHORIZED,
      404: ErrorCode.NOT_FOUND,
      409: ErrorCode.DUPLICATE_DOCUMENT,
      413: ErrorCode.FILE_TOO_LARGE,
      415: ErrorCode.INVALID_FILE_TYPE,
      500: ErrorCode.INTERNAL_ERROR,
    };

    return statusCodeMap[status] || ErrorCode.INTERNAL_ERROR;
  }
}
