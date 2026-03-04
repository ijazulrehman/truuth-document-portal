import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env files
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  database: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/truuth_portal',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  truuth: {
    classifierUrl:
      process.env.TRUUTH_CLASSIFIER_URL ||
      'https://api.au.truuth.id/document-management/v1/classify',
    verifyBaseUrl:
      process.env.TRUUTH_VERIFY_BASE_URL ||
      'https://submissions.api.au.truuth.id/verify-document/v1/tenants',
    tenantAlias: process.env.TRUUTH_TENANT_ALIAS || '',
    apiKey: process.env.TRUUTH_API_KEY || '',
    apiSecret: process.env.TRUUTH_API_SECRET || '',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

// Validate required config in production
if (config.nodeEnv === 'production') {
  if (config.jwt.secret === 'default-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  if (!config.truuth.apiKey || !config.truuth.apiSecret) {
    throw new Error('Truuth API credentials must be set in production');
  }
}

export default config;
