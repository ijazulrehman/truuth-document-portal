import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { ErrorCode } from '../utils/constants';
import { AppError } from '../utils/errors';
import { JwtPayload, AuthenticatedRequest } from '../types';

// Routes that don't require authentication (patterns without /api prefix)
const publicPatterns: Array<{ method: string; pattern: RegExp }> = [
  { method: 'POST', pattern: /^(\/api)?\/auth\/login\/?$/ },
  { method: 'GET', pattern: /^(\/api)?\/health(\/.*)?$/ },
  { method: 'GET', pattern: /^(\/api)?\/docs(\.json)?\/?$/ },
  { method: 'OPTIONS', pattern: /.*/ }, // Allow all preflight requests
];

const isPublicRoute = (method: string, path: string): boolean => {
  return publicPatterns.some((route) => {
    if (route.method !== method) return false;
    return route.pattern.test(path);
  });
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip auth for public routes
  if (isPublicRoute(req.method, req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      401,
      ErrorCode.UNAUTHORIZED,
      'Authentication required. Please log in.'
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(
          401,
          ErrorCode.TOKEN_EXPIRED,
          'Your session has expired. Please log in again.'
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError(
          401,
          ErrorCode.UNAUTHORIZED,
          'Invalid authentication token.'
        );
      }
    }
    throw new AppError(
      401,
      ErrorCode.UNAUTHORIZED,
      'Authentication required. Please log in.'
    );
  }
};
