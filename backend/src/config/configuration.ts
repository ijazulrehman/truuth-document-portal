export default () => ({
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Truuth API
  truuth: {
    classifierUrl:
      process.env.TRUUTH_CLASSIFIER_URL ||
      'https://api.au.truuth.id/document-management/v1/classify',
    verifyBaseUrl:
      process.env.TRUUTH_VERIFY_BASE_URL ||
      'https://submissions.api.au.truuth.id/verify-document/v1/tenants',
    tenantAlias: process.env.TRUUTH_TENANT_ALIAS,
    apiKey: process.env.TRUUTH_API_KEY,
    apiSecret: process.env.TRUUTH_API_SECRET,
  },

  // File upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
});
