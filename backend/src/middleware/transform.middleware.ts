import { Request, Response, NextFunction } from 'express';

// Override res.json to wrap responses in standard format
export const transformMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const originalJson = res.json.bind(res);

  res.json = function (data: unknown): Response {
    // If already wrapped (has success property) or is an error, don't re-wrap
    if (data && typeof data === 'object' && 'success' in data) {
      return originalJson(data);
    }

    // Wrap successful response in standard format
    return originalJson({
      success: true,
      data,
    });
  };

  next();
};
