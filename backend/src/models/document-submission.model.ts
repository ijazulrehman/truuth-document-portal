import mongoose, { Document, Schema } from 'mongoose';

// Document type and verification status enums
export enum DocumentType {
  AUSTRALIAN_PASSPORT = 'AUSTRALIAN_PASSPORT',
  AUSTRALIAN_DRIVERS_LICENCE = 'AUSTRALIAN_DRIVERS_LICENCE',
  RESUME = 'RESUME',
}

export enum VerificationStatus {
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

export interface IDocumentSubmission extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  documentType: DocumentType;
  documentVerifyId?: string | null;
  status: VerificationStatus;
  fileName: string;
  mimeType: string;
  verificationResult?: Record<string, unknown> | null;
  errorMessage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const documentSubmissionSchema = new Schema<IDocumentSubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    documentType: {
      type: String,
      enum: {
        values: Object.values(DocumentType),
        message: 'Invalid document type',
      },
      required: [true, 'Document type is required'],
    },
    documentVerifyId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(VerificationStatus),
        message: 'Invalid verification status',
      },
      default: VerificationStatus.PROCESSING,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    verificationResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound unique index: One document per type per user
documentSubmissionSchema.index({ userId: 1, documentType: 1 }, { unique: true });

// Virtual populate for user reference
documentSubmissionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

export const DocumentSubmission = mongoose.model<IDocumentSubmission>(
  'DocumentSubmission',
  documentSubmissionSchema
);
