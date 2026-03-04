import mongoose from 'mongoose';
import {
  DocumentSubmission,
  IDocumentSubmission,
  DocumentType,
  VerificationStatus,
} from '../models';
import { TruuthService } from './truuth.service';
import { AppError } from '../utils/errors';
import {
  ErrorCode,
  TOTAL_REQUIRED_DOCUMENTS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from '../utils/constants';
import { logger } from '../utils/logger';
import {
  DocumentDto,
  DocumentListResponseDto,
  DocumentResultDto,
  DocumentSummaryDto,
  PollResponseDto,
  PollUpdateDto,
} from '../types';

export class DocumentsService {
  private truuthService: TruuthService;

  constructor() {
    this.truuthService = new TruuthService();
  }

  /**
   * Upload and submit a document for verification
   */
  async uploadDocument(
    userId: string,
    documentType: DocumentType,
    file: Express.Multer.File
  ): Promise<DocumentDto> {
    logger.info(`Processing upload for user ${userId}, type: ${documentType}`);

    // Validate file
    this.validateFile(file);

    // Check if document already exists for this user and type
    const existingDocument = await DocumentSubmission.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      documentType,
    });

    if (existingDocument) {
      throw new AppError(
        409,
        ErrorCode.DUPLICATE_DOCUMENT,
        `You have already uploaded ${this.truuthService.getDocumentTypeName(documentType)}.`
      );
    }

    // Convert file to base64
    const imageBase64 = file.buffer.toString('base64');

    // Step 1: Classification (only for Passport and Driver's Licence)
    if (this.truuthService.requiresClassification(documentType)) {
      logger.info(`Classifying document: ${documentType}`);

      const { isValid } = await this.truuthService.classifyDocument(
        imageBase64,
        file.mimetype,
        documentType
      );

      if (!isValid) {
        const expectedTypeName = this.truuthService.getDocumentTypeName(documentType);
        throw new AppError(
          400,
          ErrorCode.CLASSIFICATION_FAILED,
          `The uploaded document does not appear to be an ${expectedTypeName}. Please upload a valid ${expectedTypeName}.`
        );
      }

      logger.info('Classification passed');
    }

    // Step 2: Submit for verification
    logger.info('Submitting document for verification');
    const verifyResponse = await this.truuthService.submitForVerification(
      imageBase64,
      file.mimetype,
      documentType,
      `user-${userId}-${documentType}`
    );

    // Step 3: Store submission in database
    const submission = await DocumentSubmission.create({
      userId: new mongoose.Types.ObjectId(userId),
      documentType,
      documentVerifyId: verifyResponse.documentVerifyId,
      status: VerificationStatus.PROCESSING,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });

    logger.info(`Document submitted successfully: ${submission._id}`);

    return this.mapToDocumentDto(submission);
  }

  /**
   * Get all documents for a user
   */
  async getDocuments(userId: string): Promise<DocumentListResponseDto> {
    const documents = await DocumentSubmission.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    const documentDtos = documents.map((doc) => this.mapToDocumentDto(doc));
    const summary = this.calculateSummary(documents);

    return {
      documents: documentDtos,
      summary,
    };
  }

  /**
   * Poll for status updates on processing documents
   */
  async pollForUpdates(userId: string): Promise<PollResponseDto> {
    // Get all processing documents for this user
    const processingDocs = await DocumentSubmission.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: VerificationStatus.PROCESSING,
    });

    if (processingDocs.length === 0) {
      return { updates: [] };
    }

    const updates: PollUpdateDto[] = [];

    // Check each processing document with Truuth API
    for (const doc of processingDocs) {
      if (!doc.documentVerifyId) continue;

      try {
        const result = await this.truuthService.getVerificationResult(doc.documentVerifyId);

        // If status changed from PROCESSING, update database
        if (result.status === 'DONE' || result.status === 'FAILED') {
          const newStatus =
            result.status === 'DONE' ? VerificationStatus.DONE : VerificationStatus.FAILED;

          await DocumentSubmission.findByIdAndUpdate(doc._id, {
            status: newStatus,
            verificationResult: result.result || result,
          });

          updates.push({
            id: doc._id.toString(),
            documentType: doc.documentType,
            status: newStatus,
            hasResult: true,
          });

          logger.info(`Document ${doc._id} verification completed: ${newStatus}`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error polling document ${doc._id}: ${message}`);
        // Continue with other documents
      }
    }

    return { updates };
  }

  /**
   * Get verification result for a specific document
   */
  async getDocumentResult(userId: string, documentId: string): Promise<DocumentResultDto> {
    const document = await DocumentSubmission.findOne({
      _id: new mongoose.Types.ObjectId(documentId),
      userId: new mongoose.Types.ObjectId(userId), // Ensure user can only access their own documents
    });

    if (!document) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Document not found');
    }

    return {
      id: document._id.toString(),
      documentType: document.documentType,
      status: document.status,
      fileName: document.fileName,
      hasResult: !!document.verificationResult,
      verificationResult: document.verificationResult as Record<string, unknown>,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      completedAt:
        document.status !== VerificationStatus.PROCESSING ? document.updatedAt : undefined,
    };
  }

  /**
   * Delete a document submission (for re-upload)
   */
  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const document = await DocumentSubmission.findOne({
      _id: new mongoose.Types.ObjectId(documentId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!document) {
      throw new AppError(404, ErrorCode.NOT_FOUND, 'Document not found');
    }

    await DocumentSubmission.findByIdAndDelete(documentId);

    logger.info(`Document deleted: ${documentId}`);
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new AppError(400, ErrorCode.VALIDATION_ERROR, 'Please select a file to upload');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new AppError(
        400,
        ErrorCode.INVALID_FILE_TYPE,
        'Please upload an image (JPEG, PNG) or PDF file.'
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(400, ErrorCode.FILE_TOO_LARGE, 'File is too large. Maximum size is 10MB.');
    }
  }

  /**
   * Map database entity to DTO
   */
  private mapToDocumentDto(doc: IDocumentSubmission): DocumentDto {
    return {
      id: doc._id.toString(),
      documentType: doc.documentType,
      status: doc.status,
      fileName: doc.fileName,
      hasResult: !!doc.verificationResult,
      verificationResult: doc.verificationResult as Record<string, unknown> | undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      completedAt:
        doc.status !== VerificationStatus.PROCESSING ? doc.updatedAt : undefined,
    };
  }

  /**
   * Calculate document summary
   */
  private calculateSummary(documents: IDocumentSubmission[]): DocumentSummaryDto {
    return {
      total: TOTAL_REQUIRED_DOCUMENTS,
      uploaded: documents.length,
      processing: documents.filter((d) => d.status === VerificationStatus.PROCESSING).length,
      completed: documents.filter((d) => d.status === VerificationStatus.DONE).length,
      failed: documents.filter((d) => d.status === VerificationStatus.FAILED).length,
    };
  }
}
