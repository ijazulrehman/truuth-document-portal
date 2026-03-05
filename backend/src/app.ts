import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import {
  authMiddleware,
  transformMiddleware,
  errorMiddleware,
  combinedRateLimit,
} from './middleware';
import config from './config';
import { swaggerSpec } from './config/swagger';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.cors.origin === '*' ? true : config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate limiting
  app.use(combinedRateLimit);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Response transformation (wrap in {success: true, data: ...})
  app.use(transformMiddleware);

  // Authentication middleware (checks JWT for protected routes)
  app.use(authMiddleware);

  // Swagger documentation (only in development)
  if (config.nodeEnv !== 'production') {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Truuth API Docs',
    }));
    app.get('/api/docs.json', (_req, res) => {
      res.json(swaggerSpec);
    });
  }

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    });
  });

  // Global error handler (must be last)
  app.use(errorMiddleware);

  return app;
};
