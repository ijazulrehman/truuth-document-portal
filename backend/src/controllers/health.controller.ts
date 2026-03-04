import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export class HealthController {
  /**
   * GET /api/health
   * Health check with database connection test
   */
  check = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dbState = mongoose.connection.readyState;
      const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: dbStatus,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/health/ready
   * Readiness probe - checks if service is ready to accept traffic
   */
  ready = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dbState = mongoose.connection.readyState;

      if (dbState !== 1) {
        res.status(503).json({
          status: 'not ready',
          reason: 'Database not connected',
        });
        return;
      }

      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/health/live
   * Liveness probe - checks if service is alive
   */
  live = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({
        status: 'alive',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}
