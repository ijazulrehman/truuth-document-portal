import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Truuth Document Portal API',
      version: '1.0.0',
      description: 'Backend API for Truuth Document Verification Portal',
      contact: {
        name: 'Truuth',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            username: { type: 'string', example: 'testuser' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'testuser' },
            password: { type: 'string', example: 'password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            documentType: {
              type: 'string',
              enum: ['AUSTRALIAN_PASSPORT', 'AUSTRALIAN_DRIVERS_LICENCE', 'RESUME'],
            },
            status: {
              type: 'string',
              enum: ['PROCESSING', 'DONE', 'FAILED'],
            },
            fileName: { type: 'string' },
            hasResult: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DocumentSummary: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 3 },
            uploaded: { type: 'number' },
            processing: { type: 'number' },
            completed: { type: 'number' },
            failed: { type: 'number' },
          },
        },
        DocumentListResponse: {
          type: 'object',
          properties: {
            documents: {
              type: 'array',
              items: { $ref: '#/components/schemas/Document' },
            },
            summary: { $ref: '#/components/schemas/DocumentSummary' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
