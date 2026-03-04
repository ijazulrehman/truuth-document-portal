import rateLimit from 'express-rate-limit';
import { ErrorCode } from '../utils/constants';

// Short window: 10 requests per second
export const shortRateLimit = rateLimit({
  windowMs: 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later.',
    },
  },
});

// Medium window: 50 requests per 10 seconds
export const mediumRateLimit = rateLimit({
  windowMs: 10000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later.',
    },
  },
});

// Long window: 100 requests per minute
export const longRateLimit = rateLimit({
  windowMs: 60000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: 'Too many requests, please try again later.',
    },
  },
});

// Combined rate limiter (applies all three)
export const combinedRateLimit = [shortRateLimit, mediumRateLimit, longRateLimit];
