// MongoDB initialization script for Truuth Document Portal

// Switch to the truuth_portal database
db = db.getSiblingDB('truuth_portal');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'passwordHash'],
      properties: {
        username: {
          bsonType: 'string',
          description: 'Username is required and must be a string'
        },
        passwordHash: {
          bsonType: 'string',
          description: 'Password hash is required'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('documentsubmissions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'documentType', 'status', 'fileName', 'mimeType'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID reference is required'
        },
        documentType: {
          enum: ['AUSTRALIAN_PASSPORT', 'AUSTRALIAN_DRIVERS_LICENCE', 'RESUME'],
          description: 'Document type must be one of the allowed values'
        },
        status: {
          enum: ['PROCESSING', 'DONE', 'FAILED'],
          description: 'Status must be one of the allowed values'
        },
        documentVerifyId: {
          bsonType: ['string', 'null']
        },
        fileName: {
          bsonType: 'string'
        },
        mimeType: {
          bsonType: 'string'
        },
        verificationResult: {
          bsonType: ['object', 'null']
        },
        errorMessage: {
          bsonType: ['string', 'null']
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ username: 1 }, { unique: true });
db.documentsubmissions.createIndex({ userId: 1 });
db.documentsubmissions.createIndex({ status: 1 });
db.documentsubmissions.createIndex({ userId: 1, documentType: 1 }, { unique: true });

print('MongoDB initialized successfully for Truuth Document Portal');
